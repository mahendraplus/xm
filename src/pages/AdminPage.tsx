import { useState } from 'react'
// import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'

const AdminPage = () => {
    const [adminToken, setAdminToken] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(false)
    // const [error, setError] = useState('')
    const [msg, setMsg] = useState('')
    const [targetUser, setTargetUser] = useState('')
    const [amount, setAmount] = useState('')

    const handleLogin = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        // Note: The API doc says /api/auth/admin-login requires 'password' in body.
        // It returns { "token": "..." } or similar check?
        // Actually the doc says response is not fully verified but implies success.
        // For simplicity, we will just use the password as the token if the API uses it as Bearer too?
        // Wait, the doc says /api/admin/add-credits-direct requires Authorization: Bearer <ADMIN_TOKEN>
        // So we need to get that token.

        // Let's assume the user enters the Admin Password to get a token.
        // Or if the user already has the token, they can paste it? 
        // Let's implement Login flow.
        try {
            // We'll use the input as password
            const password = (e.target.password.value)
            const res = await apiClient.post('/api/auth/admin-login', { password })
            if (res.data.token) {
                setAdminToken(res.data.token)
                setIsLoggedIn(true)
                setMsg('Logged in as Admin')
            } else {
                setMsg('Login failed: No token returned')
            }
        } catch (err: any) {
            setMsg('Admin Login Failed')
        } finally {
            setLoading(false)
        }
    }

    const handleAddCredits = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        setMsg('')
        try {
            const res = await apiClient.post('/api/admin/add-credits-direct', {
                user_id: targetUser,
                amount: parseFloat(amount)
            }, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            })
            setMsg(res.data.msg || 'Credits added successfully')
        } catch (err: any) {
            setMsg(err.response?.data?.detail || 'Failed to add credits')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-10 space-y-8">
            <Helmet>
                <title>Admin Dashboard | Go-Biz</title>
            </Helmet>

            <div className="text-center">
                <ShieldCheck className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>

            {!isLoggedIn ? (
                <Card className="border-red-500/20 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Admin Access</CardTitle>
                        <CardDescription>Enter admin password to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input name="password" type="password" placeholder="Admin Password" required />
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Login
                            </Button>
                        </form>
                        {msg && <p className="text-center text-red-400 mt-4">{msg}</p>}
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-green-500/20 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                            Add User Credits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCredits} className="space-y-4">
                            <Input
                                placeholder="User Email (e.g. user@example.com)"
                                value={targetUser}
                                onChange={e => setTargetUser(e.target.value)}
                                required
                            />
                            <Input
                                placeholder="Amount (e.g. 500)"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add Credits
                            </Button>
                        </form>
                        {msg && <p className="text-center text-white mt-4 bg-white/10 p-2 rounded">{msg}</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default AdminPage
