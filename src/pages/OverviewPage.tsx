import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    BarChart3, TrendingUp, IndianRupee, Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, CreditCard
} from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'

interface PaymentRequest {
    amount: number
    utr_number: string
    status: string
    created_at: string
}

const OverviewPage = () => {
    const { user, setUser, token } = useAuthStore()
    const { navigate } = useAppStore()
    const [payments, setPayments] = useState<PaymentRequest[]>([])
    const [payLoading, setPayLoading] = useState(false)
    const [totalSpent, setTotalSpent] = useState(0)

    const fetchProfile = useCallback(async () => {
        try {
            const res = await apiClient.get('/api/user/profile')
            setUser(res.data)
        } catch (err) {
            console.error('Failed to fetch profile:', err)
        }
    }, [setUser])

    const fetchTotalSpent = useCallback(async () => {
        try {
            const res = await apiClient.get('/api/user/history')
            const history = res.data.history || []
            const spent = history.reduce((sum: number, entry: { billing?: { total_deducted?: number } }) => {
                return sum + (entry.billing?.total_deducted || 0)
            }, 0)
            setTotalSpent(spent)
        } catch (err) {
            console.error('Failed to fetch spent history:', err)
        }
    }, [])

    const fetchPayments = useCallback(async () => {
        setPayLoading(true)
        try {
            const res = await apiClient.get('/api/payments/history')
            setPayments(res.data.history || [])
        } catch (err) {
            console.error('Failed to fetch payments:', err)
        } finally { setPayLoading(false) }
    }, [])

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        fetchPayments()
        fetchProfile()
        fetchTotalSpent()
    }, [token, navigate, fetchPayments, fetchProfile, fetchTotalSpent])

    if (!user) return null

    return (
        <div className="space-y-6">
            <Helmet><title>Overview | Go-Biz</title></Helmet>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Overview</h1>
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
        </div>
    )
}

export default OverviewPage
