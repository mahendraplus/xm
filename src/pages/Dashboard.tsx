import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, RefreshCw, CreditCard, Activity, Key, Clock, CheckCircle2, XCircle } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'

interface PaymentRequest {
    amount: number
    utr: string
    status: string
    created_at: string
}

const Dashboard = () => {
    const { user, setUser, token } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [apiKey, setApiKey] = useState(user?.api_key || '')
    const [payments, setPayments] = useState<PaymentRequest[]>([])
    const [payLoading, setPayLoading] = useState(false)

    useEffect(() => {
        if (!token) navigate('/auth')
        else fetchPayments()
    }, [token, navigate])

    const fetchPayments = async () => {
        setPayLoading(true)
        try {
            const res = await apiClient.get('/api/user/payment-requests')
            setPayments(res.data.requests || [])
        } catch (e) {
            console.error(e)
        } finally {
            setPayLoading(false)
        }
    }

    const generateKey = async () => {
        setLoading(true)
        try {
            const res = await apiClient.post('/api/user/generate-key')
            setApiKey(res.data.api_key)
            if (user) {
                setUser({ ...user, api_key: res.data.api_key })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="space-y-8">
            <Helmet>
                <title>Dashboard | Go-Biz</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your API keys and billing.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/history')}>
                        <Activity className="w-4 h-4 mr-2" /> History
                    </Button>
                    <Button variant="default" onClick={() => navigate('/search')}>
                        Start Searching
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{user.credits?.toFixed(2) ?? '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Available balance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.searches ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Lifetime requests</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* API Key Section */}
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>API Key</CardTitle>
                        <CardDescription>
                            Your secret key for accessing the API programmatically.
                            Keep it safe!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                readOnly
                                value={apiKey || 'No API Key Generated'}
                                className="font-mono text-xs md:text-sm"
                                type="password"
                            />
                            <Button variant="secondary" size="icon" onClick={() => {
                                navigator.clipboard.writeText(apiKey)
                            }}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={generateKey} disabled={loading} className="w-full">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                            {apiKey ? 'Regenerate Key' : 'Generate Key'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Payment History */}
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Payment History
                        </CardTitle>
                        <CardDescription>Your recent credit top-up requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {payLoading ? (
                            <div className="flex justify-center py-4">
                                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : payments.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">No payment requests yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {payments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 text-sm">
                                        <div>
                                            <p className="font-medium">₹{p.amount}</p>
                                            <p className="text-xs text-muted-foreground">{p.utr}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {p.status === 'approved' ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : p.status === 'rejected' ? (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-yellow-500" />
                                            )}
                                            <span className="capitalize text-xs">{p.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard

