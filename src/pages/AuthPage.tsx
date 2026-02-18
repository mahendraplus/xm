import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { Loader2 } from 'lucide-react'

// Note: I need to install @radix-ui/react-dialog for Dialog, or build my own.
// I will build a simple custom Dialog/Modal to avoid more dependencies for now, 
// or I can try to install it. I'll stick to a simple conditional rendering for settings 
// or I'll implement a custom modal in this file for now to save time/complexity.

const AuthPage = () => {
    const [searchParams] = useSearchParams()
    const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'
    const [isRegister, setIsRegister] = useState(mode === 'register')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { setToken, setUser } = useAuthStore()

    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data: any) => {
        setLoading(true)
        setError('')
        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
            const res = await apiClient.post(endpoint, data)

            const { token } = res.data
            setToken(token)

            // Fetch user profile immediately
            const profileRes = await apiClient.get('/api/user/profile')
            setUser(profileRes.data)

            navigate('/dashboard')
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-4"
            >
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden">
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
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Full Name"
                                        {...register('name', { required: isRegister })}
                                    />
                                    {errors.name && <span className="text-red-400 text-xs">Name is required</span>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    {...register('email', { required: true })}
                                />
                                {errors.email && <span className="text-red-400 text-xs">Email is required</span>}
                            </div>

                            <div className="space-y-2">
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    {...register('password', { required: true })}
                                />
                                {errors.password && <span className="text-red-400 text-xs">Password is required</span>}
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-destructive/20 border border-destructive/50 text-destructive text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button className="w-full h-11 text-md shadow-[0_0_20px_rgba(59,130,246,0.3)]" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Sign Up' : 'Sign In')}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center gap-2">
                        <Button variant="link" onClick={() => setIsRegister(!isRegister)} className="text-muted-foreground hover:text-white">
                            {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                        </Button>
                        {!isRegister && (
                            <a href="#/forgot-password" className="text-xs text-muted-foreground hover:text-white underline">
                                Forgot Password?
                            </a>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

export default AuthPage
