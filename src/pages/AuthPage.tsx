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
import { Loader2, Cog } from 'lucide-react'

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
    const { setToken, setUser, setSpacesJwt, spacesJwt } = useAuthStore()

    // Connection Settings State
    const [showSettings, setShowSettings] = useState(false)
    const [jwtInput, setJwtInput] = useState(spacesJwt || '')
    const [apiUrlInput, setApiUrlInput] = useState(useAuthStore.getState().apiUrl || '')

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
            setError(err.response?.data?.detail || 'Authentication failed. Check connection settings or credentials.')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = () => {
        setSpacesJwt(jwtInput)
        useAuthStore.getState().setApiUrl(apiUrlInput) // Direct state update to avoid missing dep in effect
        setShowSettings(false)
        window.location.reload() // Reload to apply new client config if needed (or just re-render)
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
                    {/* Settings Button */}
                    <div className="absolute top-4 right-4 z-10">
                        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
                            <Cog className="w-5 h-5 text-muted-foreground hover:text-white" />
                        </Button>
                    </div>

                    {showSettings ? (
                        // Settings View
                        <div className="p-6 space-y-4">
                            <CardHeader className="p-0">
                                <CardTitle>Connection Settings</CardTitle>
                                <CardDescription>Configure the runtime secret (Spaces JWT) to access the API.</CardDescription>
                            </CardHeader>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spaces JWT Cookie Value</label>
                                <Input
                                    value={jwtInput}
                                    onChange={(e) => setJwtInput(e.target.value)}
                                    placeholder="eyJhbGciOi..."
                                    type="password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Base URL (Optional)</label>
                                <Input
                                    value={apiUrlInput}
                                    onChange={(e) => setApiUrlInput(e.target.value)}
                                    placeholder="https://api.example.com"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Override the backend URL if deploying to a different environment.
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Required for both public and private endpoints on the Hugging Face Space.
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
                                <Button onClick={saveSettings}>Save & Connect</Button>
                            </div>
                        </div>
                    ) : (
                        // Auth Form View
                        <>
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
                            <CardFooter className="flex justify-center">
                                <Button variant="link" onClick={() => setIsRegister(!isRegister)} className="text-muted-foreground hover:text-white">
                                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>

                {!spacesJwt && !showSettings && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                            API Connection not configured. Click the gear icon.
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default AuthPage
