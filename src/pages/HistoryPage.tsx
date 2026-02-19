import { useEffect, useState } from 'react'
import apiClient from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import { Loader2, History, Phone, Calendar, IndianRupee, Hash, Trash2, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface HistoryItem {
    id?: string
    mobile: string
    mobile_mask?: string
    result_count: number
    requested_fields?: string[]
    billing?: {
        base_fee: number
        field_charges: Record<string, number>
        total_deducted: number
    }
    cost?: number
    created_at: string
}

const HistoryPage = () => {
    const { navigate } = useAppStore()
    const { token } = useAuthStore()
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchHistory = () => {
        if (!token) { navigate('auth'); return }
        setLoading(true)
        apiClient.get('/api/user/history')
            .then(res => setHistory(res.data.history || []))
            .catch(() => toast.error('Failed to load history'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchHistory() }, [])

    const deleteItem = async (id?: string) => {
        if (!id) return
        setDeleting(id)
        try {
            await apiClient.delete(`/api/user/history/${id}`)
            setHistory(h => h.filter(i => i.id !== id))
            toast.success('Entry deleted')
        } catch { toast.error('Failed to delete') } finally { setDeleting(null) }
    }

    const clearAll = async () => {
        try {
            await apiClient.delete('/api/user/history')
            setHistory([])
            toast.success('History cleared')
        } catch { toast.error('Failed to clear history') }
    }

    // Total spent from history
    const totalSpent = history.reduce((sum, i) => sum + (i.billing?.total_deducted ?? i.cost ?? 0), 0)

    return (
        <div className="space-y-8">
            <Helmet><title>Search History | Go-Biz</title></Helmet>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Search History</h1>
                    <p className="text-muted-foreground mt-1">All your lookups · Total spent: <span className="font-semibold text-foreground">₹{totalSpent.toFixed(2)}</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={fetchHistory}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
                    {history.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={clearAll}>
                            <Trash2 className="w-4 h-4 mr-1" /> Clear All
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : history.length === 0 ? (
                <Card className="glass border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                        <History className="w-14 h-14 opacity-30" />
                        <p className="text-lg">No search history yet</p>
                        <button onClick={() => navigate('search')} className="text-sm text-primary hover:underline">
                            Start your first search →
                        </button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {history.map((item, index) => {
                        const cost = item.billing?.total_deducted ?? item.cost ?? 0
                        const fieldCharges = item.billing?.field_charges || {}
                        const hasFieldCharges = Object.keys(fieldCharges).length > 0
                        return (
                            <Card key={item.id || index} className="glass hover:border-white/20 transition-colors">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        {/* Mobile info */}
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2.5 rounded-xl">
                                                <Phone className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg font-mono">{item.mobile}</p>
                                                {item.mobile_mask && item.mobile_mask !== item.mobile && (
                                                    <p className="text-xs text-muted-foreground font-mono">Mask: {item.mobile_mask}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Summary stats */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Charged</p>
                                                <p className={cn("font-bold flex items-center gap-0.5 justify-end",
                                                    cost > 0 ? 'text-orange-400' : 'text-muted-foreground')}>
                                                    <IndianRupee className="w-3.5 h-3.5" />{cost.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Fields Found</p>
                                                <p className="font-bold text-primary flex items-center gap-0.5 justify-end">
                                                    <Hash className="w-3.5 h-3.5" />{item.result_count || 0}
                                                </p>
                                            </div>
                                            {item.id && (
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    disabled={deleting === item.id}
                                                    onClick={() => deleteItem(item.id)}
                                                >
                                                    {deleting === item.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Billing breakdown */}
                                    {hasFieldCharges && (
                                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                                            {item.billing?.base_fee !== undefined && (
                                                <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground">
                                                    base: ₹{item.billing.base_fee.toFixed(1)}
                                                </span>
                                            )}
                                            {Object.entries(fieldCharges).map(([field, charge]) => (
                                                <span key={field} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                    {field}: ₹{String(charge)}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Requested fields */}
                                    {item.requested_fields && item.requested_fields.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            <span className="text-xs text-muted-foreground mr-1">Requested:</span>
                                            {item.requested_fields.map(f => (
                                                <span key={f} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground capitalize">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default HistoryPage
