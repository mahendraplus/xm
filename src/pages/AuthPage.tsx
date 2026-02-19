import { useState } from 'react'
import { motion } from 'framer-motion'
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
    const [isRegister, setIsRegister] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const { setToken, setUser } = useAuthStore()
    const { navigate } = useAppStore()

    const { register, handleSubmit, formState: { errors }, reset } = useForm()

    const onSubmit = async (data: any) => {
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
            navigate('dashboard')
        } catch (err: any) {
            const detail = err.response?.data?.detail
            const msg = typeof detail === 'string' ? detail : 'Authentication failed.'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Helmet>
                <title>{isRegister ? 'Register' : 'Login'} | Go-Biz</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md p-4"
            >
                <div className="text-center mb-8">
                    <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-ring">
                        <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Go-Biz</h1>
                </div>

                <Card className="glass border-white/10">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isRegister ? 'Enter your details to get started' : 'Sign in to your account'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {isRegister && (
                                <div>
                                    <Input
                                        placeholder="Full Name (min. 4 chars)"
                                        {...register('name', { required: isRegister, minLength: 4 })}
                                    />
                                    {errors.name && <span className="text-destructive text-xs mt-1">Name must be at least 4 characters</span>}
                                </div>
                            )}
                            <div>
                                <Input
                                    placeholder="Email address"
                                    type="email"
                                    {...register('email', { required: true })}
                                />
                                {errors.email && <span className="text-destructive text-xs mt-1">Email is required</span>}
                            </div>
                            <div>
                                <Input
                                    placeholder="Password (min. 8 chars)"
                                    type="password"
                                    {...register('password', { required: true, minLength: 8 })}
                                />
                                {errors.password && <span className="text-destructive text-xs mt-1">Password must be at least 8 characters</span>}
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-sm text-center">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="p-3 rounded-lg bg-green-500/15 border border-green-500/40 text-green-400 text-sm text-center">
                                    {successMsg}
                                </div>
                            )}

                            <Button className="w-full h-11 glow-primary" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Sign Up' : 'Sign In')}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center gap-2">
                        <Button variant="link" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccessMsg('') }}
                            className="text-muted-foreground hover:text-foreground">
                            {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                        </Button>
                        {!isRegister && (
                            <button onClick={() => navigate('forgot-password')}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors underline">
                                Forgot Password?
                            </button>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

export default AuthPage
