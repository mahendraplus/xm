import { useEffect, useState } from 'react'
import apiClient from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { Loader2, History, Phone, Calendar } from 'lucide-react'

const HistoryPage = () => {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await apiClient.get('/api/user/history')
                setHistory(res.data.history || [])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Search History | Go-Biz</title>
            </Helmet>

            <div>
                <h1 className="text-3xl font-bold">Search History</h1>
                <p className="text-muted-foreground">View your past search activities.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : history.length === 0 ? (
                <Card className="border-dashed border-white/10 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <History className="w-12 h-12 mb-4 opacity-50" />
                        <p>No search history found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {history.map((item, index) => (
                        <Card key={index} className="border-white/5 bg-black/20 hover:bg-black/30 transition-colors">
                            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg">{item.mobile}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Cost</p>
                                        <p className="text-lg font-bold">₹{item.cost}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Results</p>
                                        <p className="text-lg font-bold text-primary">{item.result_count}</p>
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
