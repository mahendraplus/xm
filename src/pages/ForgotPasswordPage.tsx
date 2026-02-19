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
        } catch (err: any) {
            const m = err.response?.data?.detail || 'Failed to submit request.'
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
        } catch (err: any) {
            setResetStatus(err.response?.data?.detail || 'Could not fetch status.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Helmet><title>Forgot Password | Go-Biz</title></Helmet>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="glass border-white/10">
                    <CardHeader className="text-center">
                        <KeyRound className="w-10 h-10 mx-auto text-primary mb-2" />
                        <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        <CardDescription>
                            Submit a request and an admin will set a temporary password for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {status === 'idle' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Your registered email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    type="text"
                                    placeholder="Note for admin (e.g. Lost my phone)"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                                <Button type="submit" className="w-full glow-primary" disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Submit Request
                                </Button>
                                {msg && (
                                    <div className="p-3 rounded bg-destructive/15 border border-destructive/40 text-destructive text-sm text-center">{msg}</div>
                                )}
                            </form>
                        ) : (
                            <div className="space-y-4 text-center">
                                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                                <p className="text-green-400 text-sm">{msg}</p>
                                <div className="p-3 rounded bg-white/5 text-sm text-muted-foreground text-left space-y-1">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-yellow-500" />
                                        <span>Admin will set a temp password and send it to you via WhatsApp/Email.</span>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={checkStatus} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Check Status
                                </Button>
                                {resetStatus && (
                                    <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded">{resetStatus}</p>
                                )}
                            </div>
                        )}

                        <div className="text-center pt-2">
                            <button onClick={() => navigate('auth')}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                ← Back to Login
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default ForgotPasswordPage
