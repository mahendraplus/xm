import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Copy, RefreshCw, CreditCard, Activity, Key, Clock, CheckCircle2, XCircle,
    Upload, BarChart3, ChevronRight, Terminal, Play, Eye, EyeOff, Code2,
    AlertTriangle, TrendingUp, IndianRupee, Zap, Search, Timer
} from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

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
    const [totalSpent, setTotalSpent] = useState(0)
    const [activeTab, setActiveTab] = useState<'overview' | 'recharge' | 'api'>('overview')
    const [lastResponseTime, setLastResponseTime] = useState<number | null>(null)

    // Quick Search
    const { register: regSearch, handleSubmit: handleSearch, formState: { errors: searchErrors } } = useForm()
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchResult, setSearchResult] = useState<any>(null)
    const [searchError, setSearchError] = useState('')

    // Deposit form
    const [depositAmount, setDepositAmount] = useState('')
    const [depositUTR, setDepositUTR] = useState('')
    const [depositScreenshot, setDepositScreenshot] = useState('')
    const [depositLoading, setDepositLoading] = useState(false)
    const [depositMsg, setDepositMsg] = useState('')
    const [depositOk, setDepositOk] = useState(false)
    const [sysConfig, setSysConfig] = useState<{ upi_id: string; qr_code_url: string } | null>(null)

    const fetchProfile = async () => {
        try {
            const res = await apiClient.get('/api/user/profile')
            setUser(res.data)
        } catch { }
    }

    const fetchSysConfig = async () => {
        try {
            // Priority 1: User-accessible stats or specific config endpoint
            const res = await apiClient.get('/api/stats')
            if (res.data.config) {
                setSysConfig(res.data.config)
            } else {
                // Priority 2: Try specific user configuration endpoint found by subagent
                const configRes = await apiClient.get('/api/user/config-public').catch(() => null)
                if (configRes && configRes.data) {
                    setSysConfig(configRes.data)
                } else {
                    // Priority 3: Sensible defaults for our system
                    setSysConfig({
                        upi_id: '9824584454@ybl',
                        qr_code_url: 'https://raw.githubusercontent.com/mahendraplus/mahendraplus.github.io/refs/heads/Mahendra-Mali/assets/img/qr/gpay-light.png'
                    })
                }
            }
        } catch {
            // Final fallback
            setSysConfig({
                upi_id: '9824584454@ybl',
                qr_code_url: 'https://raw.githubusercontent.com/mahendraplus/mahendraplus.github.io/refs/heads/Mahendra-Mali/assets/img/qr/gpay-light.png'
            })
        }
    }

    const fetchTotalSpent = async () => {
        try {
            const res = await apiClient.get('/api/user/history')
            const history = res.data.history || []
            const spent = history.reduce((sum: number, entry: any) => {
                return sum + (entry.billing?.total_deducted || 0)
            }, 0)
            setTotalSpent(spent)
        } catch { }
    }

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        fetchPayments()
        fetchProfile()
        fetchTotalSpent()
        fetchSysConfig()
    }, [token])

    const fetchPayments = async () => {
        setPayLoading(true)
        try {
            const res = await apiClient.get('/api/payments/history')
            setPayments(res.data.history || [])
        } catch { } finally { setPayLoading(false) }
    }

    // Quick Search from dashboard
    const onQuickSearch = async (data: any) => {
        setSearchLoading(true)
        setSearchResult(null)
        setSearchError('')
        try {
            const startTime = Date.now()
            const res = await apiClient.post('/api/user/search', {
                mobile: data.mobile,
                requested_fields: ['ALL']
            })
            const elapsed = Date.now() - startTime
            setLastResponseTime(elapsed)
            setSearchResult(res.data)
            fetchProfile() // refresh credits
            toast.success(`Search complete in ${elapsed}ms`)
        } catch (err: any) {
            const msg = err.response?.data?.detail || err.response?.data?.msg || 'Search failed'
            setSearchError(msg)
            toast.error(msg)
        } finally { setSearchLoading(false) }
    }

    const handlePayUPayment = async (amount: number) => {
        if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
        setLoading(true)
        try {
            // 1) Get PayU parameters from backend
            const orderRes = await apiClient.post('/api/payments/initiate', { amount })
            const payuData = orderRes.data

            // 2) Dynamically build a form and submit it to PayU
            const form = document.createElement('form')
            // Use the correct action URL. Typically provided by the backend, or fallback based on env.
            form.action = payuData.action_url || (payuData.env === 'test' ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment')
            form.method = 'POST'
            form.style.display = 'none'

            // Add all the required PayU hidden fields
            const fields = ['key', 'txnid', 'amount', 'productinfo', 'firstname', 'email', 'phone', 'surl', 'furl', 'hash', 'udf1', 'udf2', 'udf3', 'udf4', 'udf5']

            fields.forEach(field => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = field
                input.value = payuData[field] || ''
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to initiate payment')
            setLoading(false)
        }
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
            setDepositMsg(res.data.msg || 'Submitted! Admin will verify and credit your account.')
            setDepositOk(true)
            toast.success('Payment request submitted! Admin will verify soon.')
            setDepositAmount(''); setDepositUTR(''); setDepositScreenshot('')
            fetchPayments()
        } catch (err: any) {
            const m = err.response?.data?.detail || 'Failed to submit.'
            setDepositMsg(m); toast.error(m)
        } finally { setDepositLoading(false) }
    }

    const testApiKey = async () => {
        if (!apiKey) { toast.error('Generate an API key first'); return }
        setCurlLoading(true); setCurlResult('')
        try {
            const startTime = Date.now()
            const res = await apiClient.post('/api/user/search', {
                mobile: '9876543210',
                requested_fields: ['ALL']
            })
            const elapsed = Date.now() - startTime
            setLastResponseTime(elapsed)
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

    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'recharge', label: 'Recharge', icon: CreditCard },
        { key: 'api', label: 'API & Docs', icon: Code2 },
    ] as const

    return (
        <div className="space-y-6">
            <Helmet><title>Dashboard | Go-Biz</title></Helmet>

            {/* ── Search Bar at Top ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4"
            >
                <form onSubmit={handleSearch(onQuickSearch)} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            {...regSearch('mobile', {
                                required: true,
                                pattern: /^[6-9]\d{9}$/
                            })}
                            placeholder="Quick Validate — Enter 10-digit number..."
                            className="w-full pl-10 pr-4 py-3 bg-background/60 border border-border/50 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all font-mono"
                        />
                        {searchErrors.mobile && (
                            <p className="text-xs text-destructive mt-1 ml-1">Enter a valid 10-digit Indian number</p>
                        )}
                    </div>
                    <Button type="submit" disabled={searchLoading} className="glow-primary h-12 px-6">
                        {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                        Validate
                    </Button>
                </form>

                {/* Response Time Bar */}
                {lastResponseTime !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"
                    >
                        <Timer className="w-3.5 h-3.5 text-primary" />
                        <span>Last response: <span className="text-primary font-bold">{lastResponseTime}ms</span></span>
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (lastResponseTime / 3000) * 100)}%` }}
                                transition={{ duration: 0.5 }}
                                className={cn(
                                    "h-full rounded-full transition-colors",
                                    lastResponseTime < 500 ? 'bg-green-500' : lastResponseTime < 1500 ? 'bg-yellow-500' : 'bg-red-500'
                                )}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Inline Quick Result */}
                {searchError && <p className="text-sm text-destructive mt-2">{searchError}</p>}
                {searchResult && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                        <pre className="text-xs bg-card/80 border border-border/50 rounded-xl p-3 overflow-x-auto max-h-48 font-mono text-foreground">
                            {JSON.stringify(searchResult, null, 2)}
                        </pre>
                    </motion.div>
                )}
            </motion.div>

            {/* ── Header + Stats ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        Welcome, <span className="text-foreground font-medium">{user.name}</span> ·
                        <span className={cn("ml-2 text-xs font-medium px-2 py-0.5 rounded-full",
                            user.account_status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}>
                            {user.account_status || 'ACTIVE'}
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('history')}>
                        <Activity className="w-4 h-4 mr-1" /> History
                    </Button>
                    <Button size="sm" onClick={() => navigate('search')} className="glow-primary">
                        <Zap className="w-4 h-4 mr-1" /> Full Validate <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'API Credits', val: `₹${user.credits?.toFixed(2) ?? '0.00'}`, icon: IndianRupee, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'API Calls', val: user.searches ?? 0, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Credits Spent', val: `₹${totalSpent.toFixed(2)}`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Account', val: user.account_status || 'ACTIVE', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="glass hover:border-primary/30 transition-all">
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
                    </motion.div>
                ))}
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1.5 bg-muted/40 rounded-xl p-1">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                            activeTab === t.key
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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

                    {/* Payment History */}
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
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
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors text-sm border border-border/50"
                                    >
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
                                    </motion.div>
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
                </motion.div>
            )}

            {/* ── RECHARGE TAB ── */}
            {activeTab === 'recharge' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 md:grid-cols-2">
                    {/* Razorpay */}
                    <Card className="glass border-primary/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-16 h-16 text-primary" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" /> Instant Recharge
                            </CardTitle>
                            <CardDescription>Automatic credit top-up via PayU (UPI, Card, Netbanking)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {[100, 500, 1000, 2000, 5000, 10000].map(amt => (
                                    <Button
                                        key={amt}
                                        variant="outline"
                                        size="sm"
                                        className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                                        onClick={() => handlePayUPayment(amt)}
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
                                onClick={() => handlePayUPayment(parseFloat(depositAmount))}
                            >
                                {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Pay with PayU
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Manual Recharge */}
                    <Card className="glass border-green-500/15">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-green-400" /> Manual Recharge
                            </CardTitle>
                            <CardDescription>Transfer via UPI, then submit your UTR for admin verification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sysConfig && (
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                                    <div className="flex flex-col items-center gap-3">
                                        {sysConfig.qr_code_url && (
                                            <div className="bg-white p-2 rounded-lg">
                                                <img src={sysConfig.qr_code_url} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Scan & Pay via UPI</p>
                                            <div className="flex items-center justify-center gap-2 mt-1">
                                                <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">{sysConfig.upi_id}</code>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(sysConfig.upi_id); toast.success('UPI ID copied!') }}>
                                                    <Copy className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
                                        After paying, please enter the 12-digit UTR/Reference number below.
                                        Credits will be added within 10-60 minutes after verification.
                                    </div>
                                </div>
                            )}
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
                </motion.div>
            )}

            {/* ── API & DOCS TAB ── */}
            {activeTab === 'api' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <Card className="glass border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-primary" /> API Key
                            </CardTitle>
                            <CardDescription>
                                Your secret key for programmatic API access. <span className="text-yellow-400">Keep it safe!</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        readOnly
                                        value={apiKey || 'No API Key — generate below'}
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

                            <Button onClick={generateKey} disabled={loading} className="w-full glow-primary">
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                                {apiKey ? 'Regenerate Key' : 'Generate API Key'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* User API Reference */}
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Code2 className="w-5 h-5 text-purple-400" /> Your API Endpoints
                            </CardTitle>
                            <CardDescription>
                                Base URL: <code className="text-primary text-xs">https://mahendraplus-api-db-in.hf.space</code>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { method: 'POST', path: '/api/user/search', desc: 'Search by mobile. Body: { mobile, requested_fields }' },
                                { method: 'GET', path: '/api/user/profile', desc: 'Your profile, credits & search count' },
                                { method: 'GET', path: '/api/user/history', desc: 'Your search history with billing' },
                                { method: 'POST', path: '/api/user/generate-key', desc: 'Generate or regenerate API key' },
                                { method: 'POST', path: '/api/user/add-credits', desc: 'Submit payment. Body: { amount, utr_number }' },
                                { method: 'POST', path: '/api/chat/send', desc: 'Send support message. Body: { text }' },
                                { method: 'GET', path: '/api/chat/history', desc: 'Get your chat messages' },
                                { method: 'POST', path: '/api/payments/initiate', desc: 'Initiate PayU payment. Body: { amount }' },
                                { method: 'GET', path: '/api/payments/history', desc: 'Payment & deposit history' },
                            ].map((ep, i) => (
                                <motion.div
                                    key={ep.path}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="flex flex-col sm:flex-row gap-1.5 sm:items-center p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                                >
                                    <span className={cn("font-mono text-xs px-2 py-0.5 rounded shrink-0 w-fit font-bold",
                                        ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400')}>
                                        {ep.method}
                                    </span>
                                    <span className="font-mono text-xs text-primary shrink-0">{ep.path}</span>
                                    <span className="text-xs text-muted-foreground">— {ep.desc}</span>
                                </motion.div>
                            ))}
                            <p className="text-xs text-muted-foreground mt-3">
                                All endpoints require: <code className="text-yellow-400">Authorization: Bearer YOUR_TOKEN</code>
                            </p>
                        </CardContent>
                    </Card>

                    {/* cURL + Test */}
                    {apiKey && (
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Terminal className="w-5 h-5 text-primary" /> cURL Example
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="relative">
                                    <pre className="text-xs text-green-400 bg-card/80 border border-border/50 rounded-xl p-4 overflow-x-auto font-mono">
                                        {curlCommand}
                                    </pre>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(curlCommand); toast.success('cURL copied!') }}
                                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <Button variant="secondary" onClick={testApiKey} disabled={curlLoading} className="w-full">
                                    <Play className="w-4 h-4 mr-2" />
                                    {curlLoading ? 'Testing...' : 'Test API Key (Live Request)'}
                                </Button>
                                {curlResult && (
                                    <pre className="text-xs text-green-400 bg-card/80 border border-border/50 rounded-xl p-4 overflow-x-auto max-h-48 font-mono">
                                        {curlResult}
                                    </pre>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            )}
        </div>
    )
}

export default Dashboard
