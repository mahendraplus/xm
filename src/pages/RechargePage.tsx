import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Copy, RefreshCw, IndianRupee, Zap, Upload, CheckCircle2
} from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'

const RechargePage = () => {
    const { user, token } = useAuthStore()
    const { navigate } = useAppStore()
    const [loading, setLoading] = useState(false)
    const [depositAmount, setDepositAmount] = useState('')
    const [depositUTR, setDepositUTR] = useState('')
    const [depositScreenshot, setDepositScreenshot] = useState('')
    const [depositLoading, setDepositLoading] = useState(false)
    const [depositMsg, setDepositMsg] = useState('')
    const [depositOk, setDepositOk] = useState(false)
    const [sysConfig, setSysConfig] = useState<{ upi_id: string; qr_code_url: string } | null>(null)

    const fetchSysConfig = async () => {
        try {
            const res = await apiClient.get('/api/stats')
            if (res.data.config) {
                setSysConfig(res.data.config)
            } else {
                const configRes = await apiClient.get('/api/user/config-public').catch(() => null)
                if (configRes && configRes.data) {
                    setSysConfig(configRes.data)
                } else {
                    setSysConfig({
                        upi_id: '9824584454@ybl',
                        qr_code_url: 'https://raw.githubusercontent.com/mahendraplus/mahendraplus.github.io/refs/heads/Mahendra-Mali/assets/img/qr/gpay-light.png'
                    })
                }
            }
        } catch (err) {
            console.error('Failed to fetch sys config:', err)
            setSysConfig({
                upi_id: '9824584454@ybl',
                qr_code_url: 'https://raw.githubusercontent.com/mahendraplus/mahendraplus.github.io/refs/heads/Mahendra-Mali/assets/img/qr/gpay-light.png'
            })
        }
    }

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        fetchSysConfig()
    }, [token, navigate])

    const handlePayUPayment = async (amount: number) => {
        if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
        setLoading(true)
        try {
            const orderRes = await apiClient.post('/api/payments/initiate', { amount })
            const payuData = orderRes.data
            const form = document.createElement('form')
            form.action = payuData.action_url || (payuData.env === 'test' ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment')
            form.method = 'POST'
            form.style.display = 'none'
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
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            toast.error(error.response?.data?.detail || 'Failed to initiate payment')
            setLoading(false)
        }
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
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            const m = error.response?.data?.detail || 'Failed to submit.'
            setDepositMsg(m); toast.error(m)
        } finally { setDepositLoading(false) }
    }

    if (!user) return null

    return (
        <div className="space-y-6">
            <Helmet><title>Recharge | Go-Biz</title></Helmet>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Recharge Credits</h1>
                    <p className="text-sm text-muted-foreground mt-1">Select a payment method to top up your API credits</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* PayU Instant */}
                <Card className="glass border-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-16 h-16 text-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
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
                        <CardTitle className="flex items-center gap-2 text-lg">
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
            </div>
        </div>
    )
}

export default RechargePage
