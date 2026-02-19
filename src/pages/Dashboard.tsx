import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Copy, RefreshCw, CreditCard, Activity, Key, Clock, CheckCircle2, XCircle,
    Upload, BarChart3, ChevronRight, Terminal, Play, Eye, EyeOff, Code2,
    AlertTriangle, TrendingUp, Wallet, IndianRupee, Zap
} from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PaymentRequest {
    amount: number
    utr_number: string
    status: string
    created_at: string
}

const Dashboard = () => {
    const { user, setUser, token } = useAuthStore()
    const { navigate } = useAppStore()
    const [loading, setLoading] = useState(false)
    const [apiKey, setApiKey] = useState(user?.api_key || '')
    const [showKey, setShowKey] = useState(false)
    const [payments, setPayments] = useState<PaymentRequest[]>([])
    const [payLoading, setPayLoading] = useState(false)
    const [curlResult, setCurlResult] = useState('')
    const [curlLoading, setCurlLoading] = useState(false)

    // Deposit form
    const [depositAmount, setDepositAmount] = useState('')
    const [depositUTR, setDepositUTR] = useState('')
    const [depositScreenshot, setDepositScreenshot] = useState('')
    const [depositLoading, setDepositLoading] = useState(false)
    const [depositMsg, setDepositMsg] = useState('')
    const [depositOk, setDepositOk] = useState(false)

    const fetchProfile = async () => {
        try {
            const res = await apiClient.get('/api/user/profile')
            setUser(res.data)
        } catch { }
    }

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        fetchPayments()
        fetchProfile()

        // Load Razorpay Script
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        return () => { document.body.removeChild(script) }
    }, [token])

    const fetchPayments = async () => {
        setPayLoading(true)
        try {
            const res = await apiClient.get('/api/user/payment-requests')
            setPayments(res.data.requests || [])
        } catch { } finally { setPayLoading(false) }
    }

    const handleRazorpayPayment = async (amount: number) => {
        if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
        setLoading(true)
        try {
            // 1. Create Order
            const orderRes = await apiClient.post('/api/payments/create-order', { amount })
            const order = orderRes.data

            const options = {
                key: 'rzp_live_XXXXXXXXXXXXXX', // Should ideally come from settings or env
                amount: order.amount,
                currency: order.currency,
                name: 'Go-Biz Enterprise',
                description: 'Wallet Top-up',
                order_id: order.id,
                handler: async (response: any) => {
                    setLoading(true)
                    try {
                        // 2. Verify Payment
                        await apiClient.post('/api/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                        toast.success('Credits added successfully!')
                        fetchProfile()
                        fetchPayments()
                    } catch (err: any) {
                        toast.error(err.response?.data?.msg || 'Verification failed')
                    } finally { setLoading(false) }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: '#3b82f6' }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to create order')
        } finally { setLoading(false) }
    }

    const generateKey = async () => {
        setLoading(true)
        try {
            const res = await apiClient.post('/api/user/generate-key')
            const newKey = res.data.api_key
            setApiKey(newKey)
            if (user) setUser({ ...user, api_key: newKey })
            toast.success('API key generated!')
        } catch { toast.error('Failed to generate key') } finally { setLoading(false) }
    }

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        const parsedAmount = parseFloat(depositAmount)
        if (!parsedAmount || parsedAmount <= 0) { toast.error('Amount must be > 0'); return }
        setDepositLoading(true)
        setDepositMsg('')
        try {
            const res = await apiClient.post('/api/user/add-credits', {
                amount: parsedAmount,
                utr_number: depositUTR,
                screenshot_url: depositScreenshot || undefined,
            })
            setDepositMsg(res.data.msg || 'Submitted! Admin will verify and credit your wallet.')
            setDepositOk(true)
            toast.success('Payment request submitted! Admin will verify soon.')
            setDepositAmount(''); setDepositUTR(''); setDepositScreenshot('')
            fetchPayments()
        } catch (err: any) {
            const m = err.response?.data?.detail || 'Failed to submit.'
            setDepositMsg(m); toast.error(m)
        } finally { setDepositLoading(false) }
    }

    // Test API via curl (uses fetch to replicate)
    const testApiKey = async () => {
        if (!apiKey) { toast.error('Generate an API key first'); return }
        setCurlLoading(true); setCurlResult('')
        try {
            const startTime = Date.now()
            const res = await apiClient.post('/api/user/search', {
                mobile: '9999999999',
                requested_fields: ['name', 'carrier', 'circle']
            })
            const elapsed = Date.now() - startTime
            setCurlResult(`// Test search response (${elapsed}ms)\n${JSON.stringify(res.data, null, 2)}`)
            toast.success('API test successful!')
        } catch (err: any) {
            setCurlResult(`// Error response\n${JSON.stringify(err.response?.data || { error: err.message }, null, 2)}`)
            toast.info('API responded (see output)')
        } finally { setCurlLoading(false) }
    }

    const curlCommand = apiKey
        ? `curl -X POST 'https://mahendraplus-api-db-in.hf.space/api/user/search' \\\n  -H 'Authorization: Bearer ${apiKey}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"mobile":"9876543210","requested_fields":["ALL"]}'`
        : `# Generate an API key first, then your curl command will appear here`

    if (!user) return null

    const creditUsed = user.total_spent || 0

    return (
        <div className="space-y-8">
            <Helmet><title>Dashboard | Go-Biz</title></Helmet>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome, <span className="text-foreground font-medium">{user.name}</span> ·
                        <span className={cn("ml-2 text-xs font-medium px-2 py-0.5 rounded-full",
                            user.account_status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}>
                            {user.account_status || 'ACTIVE'}
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('history')}>
                        <Activity className="w-4 h-4 mr-2" /> History
                    </Button>
                    <Button onClick={() => navigate('search')} className="glow-primary">
                        <Zap className="w-4 h-4 mr-2" /> Search Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Wallet Balance', val: `₹${user.credits?.toFixed(2) ?? '0.00'}`, icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Searches', val: user.searches ?? 0, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Credits Spent', val: `₹${creditUsed.toFixed(2)}`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Account', val: user.account_status || 'ACTIVE', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
                ].map(s => (
                    <Card key={s.label} className="glass hover:border-white/20 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-muted-foreground">{s.label}</span>
                                <div className={cn("p-1.5 rounded-lg", s.bg)}>
                                    <s.icon className={cn("w-4 h-4", s.color)} />
                                </div>
                            </div>
                            <div className="text-xl font-bold">{s.val}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charge Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl glass border-yellow-500/20 border bg-yellow-500/5 text-sm">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-yellow-400">Billing Notice</p>
                    <p className="text-muted-foreground mt-0.5">
                        Each search deducts a ₹1 base fee + per-field charges for data found. If no record is found, only the ₹1 base fee is charged.
                        Field prices: Name ₹5 · Father ₹10 · Address ₹25 · Email ₹15 · Alt Mobile ₹20 · DOB ₹5 · Gender ₹2 · Carrier ₹1 · State ₹1 · Aadhaar ID ₹100
                    </p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Razorpay Instant */}
                <Card className="glass border-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-16 h-16 text-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" /> Instant Recharge
                        </CardTitle>
                        <CardDescription>Automatic wallet top-up via Razorpay (UPI, Card, Netbanking)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {[100, 500, 1000, 2000, 5000, 10000].map(amt => (
                                <Button
                                    key={amt}
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                                    onClick={() => handleRazorpayPayment(amt)}
                                    disabled={loading}
                                >
                                    ₹{amt}
                                </Button>
                            ))}
                        </div>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-8"
                                placeholder="Custom Amount"
                                type="number"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 glow-primary"
                            disabled={loading || !depositAmount}
                            onClick={() => handleRazorpayPayment(parseFloat(depositAmount))}
                        >
                            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Pay with Razorpay
                        </Button>
                    </CardContent>
                </Card>

                {/* Add Credits (Manual) */}
                <Card className="glass border-green-500/15">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-green-400" /> Manual Recharge
                        </CardTitle>
                        <CardDescription>Transfer via UPI/Bank, then submit your UTR for admin verification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {depositOk ? (
                            <div className="text-center space-y-2 py-4">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                                <p className="text-green-400 text-sm">{depositMsg}</p>
                                <Button variant="secondary" onClick={() => { setDepositOk(false); setDepositMsg('') }}>Submit Another</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleDeposit} className="space-y-3">
                                <Input placeholder="Amount (e.g. 5000)" type="number" min="1"
                                    value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required />
                                <Input placeholder="UTR / Reference Number" value={depositUTR} onChange={e => setDepositUTR(e.target.value)} required />
                                <Input placeholder="Screenshot URL (optional)" value={depositScreenshot} onChange={e => setDepositScreenshot(e.target.value)} />
                                <Button type="submit" className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30" disabled={depositLoading}>
                                    {depositLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Submit UTR Request
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card className="glass md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" /> Payment & Deposit History
                        </CardTitle>
                        <CardDescription>Status of your recent credit top-up requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-y-auto max-h-64 space-y-2 pr-1">
                            {payLoading ? (
                                <div className="flex justify-center py-6">
                                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="flex flex-col items-center py-6 text-muted-foreground gap-2">
                                    <CreditCard className="w-8 h-8 opacity-50" />
                                    <p className="text-sm">No payment requests yet.</p>
                                </div>
                            ) : payments.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors text-sm border border-border/50">
                                    <div className="min-w-0 flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg",
                                            p.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                p.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400')}>
                                            <IndianRupee className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold">₹{p.amount}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{p.utr_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            p.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                p.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400')}>
                                            {p.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                            {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                            {p.status !== 'approved' && p.status !== 'rejected' && <Clock className="w-3 h-3" />}
                                            {p.status}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                        <p className="text-xs text-muted-foreground">Manual requests take 10-60 mins to verify.</p>
                        <Button variant="ghost" size="sm" onClick={fetchPayments}>
                            <RefreshCw className="w-3 h-3 mr-2" /> Refresh
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* API Key Section */}
            <Card className="glass border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" /> API Key
                    </CardTitle>
                    <CardDescription>
                        Your secret key for accessing the Go-Biz API programmatically. <span className="text-yellow-400">Keep it safe!</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Key Display */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                readOnly
                                value={apiKey || 'No API Key — generate one below'}
                                type={showKey ? 'text' : 'password'}
                                className="font-mono text-xs pr-10"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {apiKey && (
                            <Button variant="secondary" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('API key copied!') }}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Curl Command */}
                    {apiKey && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Terminal className="w-4 h-4 text-primary" /> cURL Example
                            </div>
                            <div className="relative">
                                <pre className="text-xs text-green-300 bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto font-mono">
                                    {curlCommand}
                                </pre>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(curlCommand); toast.success('cURL command copied!') }}
                                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* API Docs */}
                    <div className="glass rounded-xl p-4 space-y-3 border border-white/5">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Code2 className="w-4 h-4 text-purple-400" /> Quick API Reference
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground overflow-y-auto max-h-40">
                            {[
                                { method: 'POST', path: '/api/user/search', desc: 'Search by mobile number. Body: { mobile, requested_fields }' },
                                { method: 'GET', path: '/api/user/profile', desc: 'Get your profile, credits & searches count' },
                                { method: 'GET', path: '/api/user/history', desc: 'Get your search history' },
                                { method: 'POST', path: '/api/user/generate-key', desc: 'Generate or regenerate API key' },
                                { method: 'POST', path: '/api/user/add-credits', desc: 'Submit payment request. Body: { amount, utr_number }' },
                            ].map(ep => (
                                <div key={ep.path} className="flex flex-col sm:flex-row gap-1 sm:items-center">
                                    <span className={cn("font-mono text-xs px-1.5 py-0.5 rounded shrink-0",
                                        ep.method === 'POST' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300')}>
                                        {ep.method}
                                    </span>
                                    <span className="font-mono text-primary shrink-0">{ep.path}</span>
                                    <span className="text-muted-foreground">— {ep.desc}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Base URL: <code className="text-primary">https://mahendraplus-api-db-in.hf.space</code> · All user endpoints require: <code className="text-yellow-400">Authorization: Bearer YOUR_TOKEN</code>
                        </p>
                    </div>

                    {/* Test Button + Output */}
                    {apiKey && (
                        <div className="space-y-2">
                            <Button variant="secondary" onClick={testApiKey} disabled={curlLoading} className="w-full">
                                <Play className="w-4 h-4 mr-2" />
                                {curlLoading ? 'Testing...' : 'Test API Key (Live Request)'}
                            </Button>
                            {curlResult && (
                                <pre className="text-xs text-green-300 bg-black/60 border border-white/10 rounded-xl p-4 overflow-x-auto max-h-48 font-mono">
                                    {curlResult}
                                </pre>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={generateKey} disabled={loading} className="w-full glow-primary">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                        {apiKey ? 'Regenerate Key' : 'Generate API Key'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Dashboard
