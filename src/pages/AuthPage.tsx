import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { Loader2, Rocket } from 'lucide-react'
import { toast } from 'sonner'

const AuthPage = () => {
    const { setToken, setUser } = useAuthStore()
    const { navigate, authMode } = useAppStore()
    const [isRegister, setIsRegister] = useState(authMode === 'register')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const { register, handleSubmit, formState: { errors }, reset } = useForm()

    const onSubmit = async (data: Record<string, string>) => {
        setLoading(true)
        setError('')
        setSuccessMsg('')
        try {
            if (isRegister) {
                const res = await apiClient.post('/api/auth/register', data)
                const status = res.data.account_status || 'PENDING'
                setSuccessMsg(`✓ Registered! Your account is ${status}. An admin must activate it before login.`)
                toast.success('Registration successful! Awaiting admin activation.')
                reset()
                return
            }
            const res = await apiClient.post('/api/auth/login', data)
            setToken(res.data.token)
            const profileRes = await apiClient.get('/api/user/profile')
            setUser(profileRes.data)
            toast.success(`Welcome back, ${profileRes.data.name}!`)
            navigate('search')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            const detail = error.response?.data?.detail
            const msg = typeof detail === 'string' ? detail : 'Authentication failed.'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden px-4">
            <Helmet>
                <title>{isRegister ? 'Register' : 'Login'} | Go-Biz</title>
            </Helmet>

            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                    className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", damping: 20 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="bg-primary/20 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                    >
                        <Rocket className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tight gradient-text mb-2">Go-Biz</h1>
                    <p className="text-muted-foreground font-medium">Empowering the next generation of data validation</p>
                </div>

                <Card className="glass-modern overflow-hidden border-white/10 shadow-2xl">
                    <CardHeader className="pt-8 pb-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isRegister ? 'reg' : 'log'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CardTitle className="text-3xl font-bold text-center tracking-tight">
                                    {isRegister ? 'Join the Future' : 'Welcome Back'}
                                </CardTitle>
                                <CardDescription className="text-center text-base mt-2">
                                    {isRegister ? 'Create your professional account' : 'Access your dashboard and API tools'}
                                </CardDescription>
                            </motion.div>
                        </AnimatePresence>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <AnimatePresence mode="popLayout">
                                {isRegister && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="relative group">
                                            <Input
                                                className="bg-white/5 border-white/10 focus:border-primary/50 h-12 transition-all"
                                                placeholder="Full Name (min. 4 chars)"
                                                {...register('name', { required: isRegister, minLength: 4 })}
                                            />
                                        </div>
                                        {errors.name && <span className="text-destructive text-xs mt-1 block">Name must be at least 4 characters</span>}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Input
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-12 transition-all"
                                placeholder="Email address"
                                type="email"
                                {...register('email', { required: true })}
                            />
                            {errors.email && <span className="text-destructive text-xs mt-1 block">Valid email is required</span>}

                            <Input
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-12 transition-all"
                                placeholder="Password (min. 8 chars)"
                                type="password"
                                {...register('password', { required: true, minLength: 8 })}
                            />
                            {errors.password && <span className="text-destructive text-xs mt-1 block">Secure password is required</span>}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                                    {error}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium text-center"
                                >
                                    {successMsg}
                                </motion.div>
                            )}

                            <Button className="w-full h-12 text-base font-bold rounded-xl glow-primary mt-4 transition-all active:scale-[0.98]" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isRegister ? 'Create Account' : 'Sign In Now')}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center gap-4 pt-0 pb-8">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <Button variant="link" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccessMsg('') }}
                            className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
                            {isRegister ? 'Already verified? Sign in instead' : "New to Go-Biz? Join the waitlist"}
                        </Button>
                        {!isRegister && (
                            <button onClick={() => navigate('forgot-password')}
                                className="text-xs text-muted-foreground/60 hover:text-primary transition-all underline underline-offset-4">
                                Securely reset password
                            </button>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

export default AuthPage
