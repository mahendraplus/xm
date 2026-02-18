import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, RefreshCw, CreditCard, Activity, Key, Clock, CheckCircle2, XCircle, Upload } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'

interface PaymentRequest {
    amount: number
    utr_number: string
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

    // Deposit form
    const [depositAmount, setDepositAmount] = useState('')
    const [depositUTR, setDepositUTR] = useState('')
    const [depositScreenshot, setDepositScreenshot] = useState('')
    const [depositLoading, setDepositLoading] = useState(false)
    const [depositMsg, setDepositMsg] = useState('')

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

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        const parsedAmount = parseFloat(depositAmount)
        if (!parsedAmount || parsedAmount <= 0) {
            setDepositMsg('Amount must be greater than 0.')
            return
        }
        setDepositLoading(true)
        setDepositMsg('')
        try {
            const res = await apiClient.post('/api/user/add-credits', {
                amount: parseFloat(depositAmount),
                utr_number: depositUTR,
                screenshot_url: depositScreenshot || undefined,
            })
            setDepositMsg(res.data.msg || 'Payment request submitted. Admin will verify and credit your wallet.')
            setDepositAmount(''); setDepositUTR(''); setDepositScreenshot('')
            fetchPayments()
        } catch (err: any) {
            setDepositMsg(err.response?.data?.detail || 'Failed to submit. Please try again.')
        } finally {
            setDepositLoading(false)
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
                    <p className="text-muted-foreground">Manage your account, top-up credits and API keys.</p>
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

            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.account_status || 'ACTIVE'}</div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Add Credits — Deposit Form */}
                <Card className="border-green-500/20 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" /> Add Credits
                        </CardTitle>
                        <CardDescription>
                            Transfer via UPI/Bank, then submit your UTR number below for admin verification.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDeposit} className="space-y-3">
                            <Input
                                placeholder="Amount (e.g. 5000)"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                                required
                            />
                            <Input
                                placeholder="UTR / Reference Number"
                                value={depositUTR}
                                onChange={e => setDepositUTR(e.target.value)}
                                required
                            />
                            <Input
                                placeholder="Screenshot URL (optional)"
                                value={depositScreenshot}
                                onChange={e => setDepositScreenshot(e.target.value)}
                            />
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={depositLoading}>
                                {depositLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                Submit Payment Request
                            </Button>
                            {depositMsg && (
                                <p className={`text-sm text-center ${depositMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                                    {depositMsg}
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
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
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {payments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 text-sm">
                                        <div>
                                            <p className="font-medium">₹{p.amount}</p>
                                            <p className="text-xs text-muted-foreground">{p.utr_number}</p>
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

            <div className="grid gap-4 md:grid-cols-2">
                {/* API Key Section */}
                <Card className="md:col-span-1">
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
            </div>
        </div>
    )
}

export default Dashboard
