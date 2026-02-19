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

    useEffect(() => {
        if (!token) navigate('auth')
        else fetchPayments()
    }, [token])

    const fetchPayments = async () => {
        setPayLoading(true)
        try {
            const res = await apiClient.get('/api/user/payment-requests')
            setPayments(res.data.requests || [])
        } catch { } finally { setPayLoading(false) }
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
                {/* Add Credits */}
                <Card className="glass border-green-500/15">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-green-400" /> Add Credits
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
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input className="pl-8" placeholder="Amount (e.g. 5000)" type="number" min="0.01" step="0.01"
                                        value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required />
                                </div>
                                <Input placeholder="UTR / Reference Number" value={depositUTR} onChange={e => setDepositUTR(e.target.value)} required />
                                <Input placeholder="Screenshot URL (optional)" value={depositScreenshot} onChange={e => setDepositScreenshot(e.target.value)} />
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={depositLoading}>
                                    {depositLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Submit Payment Request
                                </Button>
                                {depositMsg && !depositOk && (
                                    <p className="text-sm text-center text-destructive">{depositMsg}</p>
                                )}
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Payment History
                        </CardTitle>
                        <CardDescription>Recent credit top-up requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-y-auto max-h-52 space-y-2 pr-1">
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
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-sm">
                                    <div className="min-w-0">
                                        <p className="font-medium">₹{p.amount}</p>
                                        <p className="text-xs text-muted-foreground truncate">{p.utr_number}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {p.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                            p.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> :
                                                <Clock className="w-4 h-4 text-yellow-500" />}
                                        <span className="capitalize text-xs">{p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" onClick={fetchPayments} className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
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
