import { useEffect, useState } from 'react'
import apiClient from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { Loader2, History, Phone, Calendar, IndianRupee, CheckSquare2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'

const HistoryPage = () => {
    const { navigate } = useAppStore()
    const { token } = useAuthStore()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        apiClient.get('/api/user/history')
            .then(res => setHistory(res.data.history || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-8">
            <Helmet><title>Search History | Go-Biz</title></Helmet>
            <div>
                <h1 className="text-3xl font-bold gradient-text">Search History</h1>
                <p className="text-muted-foreground">View your past lookup activities and costs.</p>
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
                    {history.map((item, index) => (
                        <Card key={index} className="glass hover:border-white/20 transition-colors">
                            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2.5 rounded-xl">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg font-mono">{item.mobile}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Cost</p>
                                        <p className="font-bold flex items-center gap-1">
                                            <IndianRupee className="w-3.5 h-3.5" />{item.cost}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Fields Found</p>
                                        <p className="font-bold text-primary flex items-center gap-1">
                                            <CheckSquare2 className="w-3.5 h-3.5" />{item.result_count || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default HistoryPage
