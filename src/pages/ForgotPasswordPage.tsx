import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, KeyRound, CheckCircle, ShieldAlert } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { useAppStore } from '@/store/appStore'
import { toast } from 'sonner'

// SECRET: if email === "admin" and note === "admin" → go to admin panel
const ADMIN_EMAIL_TRIGGER = 'admin'
const ADMIN_NOTE_TRIGGER = 'admin'

const ForgotPasswordPage = () => {
    const { navigate } = useAppStore()
    const [email, setEmail] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [status, setStatus] = useState<'idle' | 'submitted'>('idle')
    const [resetStatus, setResetStatus] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 🔐 SECRET ADMIN TRIGGER
        if (email.toLowerCase().trim() === ADMIN_EMAIL_TRIGGER && note.toLowerCase().trim() === ADMIN_NOTE_TRIGGER) {
            toast.success('Admin panel unlocked')
            navigate('admin')
            return
        }

        setLoading(true)
        setMsg('')
        try {
            const res = await apiClient.post('/api/auth/forgot-password/request', { email, note })
            setMsg(res.data.msg || 'Request sent to admin. You will be contacted with your temp password.')
            setStatus('submitted')
            toast.success('Password reset request submitted!')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            const m = error.response?.data?.detail || 'Failed to submit request.'
            setMsg(m)
            toast.error(m)
        } finally {
            setLoading(false)
        }
    }

    const checkStatus = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get(`/api/auth/forgot-password/status?email=${encodeURIComponent(email)}`)
            setResetStatus(res.data.msg || 'Pending admin review...')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setResetStatus(error.response?.data?.detail || 'Could not fetch status.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden px-4">
            <Helmet><title>Forgot Password | Go-Biz</title></Helmet>

            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ rotate: -10 }}
                        className="bg-primary/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20"
                    >
                        <KeyRound className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-black gradient-text mb-2">Account Recovery</h1>
                    <p className="text-muted-foreground font-medium">Reset your secure access to Go-Biz Tools</p>
                </div>

                <Card className="glass-modern border-white/10 shadow-2xl">
                    <CardHeader className="text-center pt-8">
                        <CardTitle className="text-2xl font-bold">Secure Reset</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Submit a priority request to our security team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-12">
                        {status === 'idle' ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Identity</label>
                                    <Input
                                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                        type="text"
                                        placeholder="Your registered email address (or Admin ID)"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Evidence (Note)</label>
                                    <Input
                                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                        type="text"
                                        placeholder="e.g. Last transaction ID or Lost phone"
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl glow-primary" disabled={loading}>
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Priority Submit Request'}
                                </Button>
                                {msg && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
                                    >
                                        {msg}
                                    </motion.div>
                                )}
                            </form>
                        ) : (
                            <div className="space-y-6 text-center py-4">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </motion.div>
                                <div className="space-y-2">
                                    <p className="text-green-400 font-bold text-lg">Request Logged</p>
                                    <p className="text-muted-foreground leading-relaxed">{msg}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-muted-foreground text-left flex gap-3">
                                    <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0" />
                                    <span>Security verification is required. Your new password will be delivered via your encrypted contact channel once verified.</span>
                                </div>
                                <Button variant="secondary" onClick={checkStatus} disabled={loading} className="w-full h-12 rounded-xl border border-white/10">
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Refresh Request Status'}
                                </Button>
                                {resetStatus && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm font-medium text-primary bg-primary/5 p-4 rounded-xl border border-primary/10 transition-all"
                                    >
                                        {resetStatus}
                                    </motion.p>
                                )}
                            </div>
                        )}

                        <div className="text-center">
                            <button onClick={() => navigate('auth')}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-all underline underline-offset-4">
                                ← Return to Login
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default ForgotPasswordPage
