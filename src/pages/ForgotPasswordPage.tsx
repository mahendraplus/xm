import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, KeyRound, CheckCircle } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [status, setStatus] = useState<'idle' | 'submitted' | 'checking'>('idle')
    const [resetStatus, setResetStatus] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMsg('')
        try {
            const res = await apiClient.post('/api/auth/forgot-password', { email })
            setMsg(res.data.msg || 'Request sent to admin. Please wait for approval.')
            setStatus('submitted')
        } catch (err: any) {
            setMsg(err.response?.data?.detail || 'Failed to submit request.')
        } finally {
            setLoading(false)
        }
    }

    const checkStatus = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get(`/api/auth/forgot-password/status?email=${encodeURIComponent(email)}`)
            setResetStatus(res.data.msg || 'Pending admin approval...')
        } catch (err: any) {
            setResetStatus(err.response?.data?.detail || 'Could not fetch status.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Helmet>
                <title>Forgot Password | Go-Biz</title>
            </Helmet>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        <KeyRound className="w-10 h-10 mx-auto text-primary mb-2" />
                        <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        <CardDescription>
                            Submit a request and an admin will reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {status === 'idle' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="Your registered email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Submit Request
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4 text-center">
                                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                                <p className="text-green-400">{msg}</p>
                                <Button variant="secondary" onClick={checkStatus} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Check Status
                                </Button>
                                {resetStatus && (
                                    <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded">{resetStatus}</p>
                                )}
                            </div>
                        )}

                        {msg && status === 'idle' && (
                            <p className="text-center text-red-400 text-sm">{msg}</p>
                        )}

                        <div className="text-center pt-2">
                            <Link to="/auth">
                                <Button variant="link" className="text-muted-foreground">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default ForgotPasswordPage
