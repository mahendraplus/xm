import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, CreditCard, Users, KeyRound } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'

interface UserData {
    email: string
    name: string
    is_active: boolean
    credits: number
}

const AdminPage = () => {
    const [adminToken, setAdminToken] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    // Feature Tabs: 'credits' | 'users' | 'resets'
    const [activeTab, setActiveTab] = useState('credits')

    // Credits State
    const [targetUser, setTargetUser] = useState('')
    const [amount, setAmount] = useState('')

    // Users State
    const [users, setUsers] = useState<UserData[]>([])

    // Handlers
    const handleLogin = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        try {
            const password = (e.target.password.value)
            // Use password as token for now based on previous assumption, or if API returns token
            const res = await apiClient.post('/api/auth/admin-login', { password })
            // Checking if response has token or just success
            const token = res.data.token || password
            setAdminToken(token)
            setIsLoggedIn(true)
            setMsg('Logged in as Admin')
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
            }, { headers: { 'Authorization': `Bearer ${adminToken}` } })
            setMsg(res.data.msg || 'Credits added successfully')
        } catch (err: any) {
            setMsg(err.response?.data?.detail || 'Failed to add credits')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        if (!isLoggedIn) return
        setLoading(true)
        try {
            const res = await apiClient.get('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            setUsers(res.data.users || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const toggleUserStatus = async (userId: string) => {
        try {
            await apiClient.post('/api/admin/toggle-user-status', { user_id: userId }, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            fetchUsers() // Refresh list
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8 px-4">
            <Helmet>
                <title>Admin | Go-Biz</title>
            </Helmet>

            <div className="text-center">
                <ShieldCheck className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>

            {!isLoggedIn ? (
                <Card className="max-w-md mx-auto border-red-500/20 bg-black/40 backdrop-blur-xl">
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
                <div className="space-y-6">
                    {/* Navigation */}
                    <div className="flex justify-center space-x-2">
                        <Button variant={activeTab === 'credits' ? 'default' : 'secondary'} onClick={() => setActiveTab('credits')}>
                            <CreditCard className="w-4 h-4 mr-2" /> Add Credits
                        </Button>
                        <Button variant={activeTab === 'users' ? 'default' : 'secondary'} onClick={() => { setActiveTab('users'); fetchUsers(); }}>
                            <Users className="w-4 h-4 mr-2" /> Manage Users
                        </Button>
                        <Button variant={activeTab === 'resets' ? 'default' : 'secondary'} onClick={() => setActiveTab('resets')}>
                            <KeyRound className="w-4 h-4 mr-2" /> Password Resets
                        </Button>
                    </div>

                    {/* Content */}
                    {activeTab === 'credits' && (
                        <Card className="border-green-500/20 bg-black/40 backdrop-blur-xl max-w-md mx-auto">
                            <CardHeader>
                                <CardTitle>Add User Credits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddCredits} className="space-y-4">
                                    <Input
                                        placeholder="User Email"
                                        value={targetUser}
                                        onChange={e => setTargetUser(e.target.value)}
                                        required
                                    />
                                    <Input
                                        placeholder="Amount"
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add Credits
                                    </Button>
                                </form>
                                {msg && <p className="text-center mt-4 text-green-400">{msg}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'users' && (
                        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? <Loader2 className="mx-auto animate-spin" /> : (
                                    <div className="space-y-2">
                                        {users.map((u, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5">
                                                <div>
                                                    <p className="font-bold">{u.email}</p>
                                                    <p className="text-xs text-muted-foreground">{u.name} • {u.credits} Credits</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={u.is_active ? "destructive" : "default"}
                                                    onClick={() => toggleUserStatus(u.email)}
                                                >
                                                    {u.is_active ? "Ban" : "Unban"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'resets' && (
                        <Card className="border-white/10 bg-black/40 backdrop-blur-xl max-w-md mx-auto">
                            <CardHeader>
                                <CardTitle>Password Reset Requests</CardTitle>
                                <CardDescription>Enter Request ID to approve</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={async (e: any) => {
                                    e.preventDefault()
                                    setLoading(true)
                                    try {
                                        const res = await apiClient.post('/api/admin/approve-password-reset', {
                                            request_id: e.target.rid.value,
                                            action: 'approve'
                                        }, { headers: { 'Authorization': `Bearer ${adminToken}` } })
                                        setMsg(res.data.msg || 'Approved')
                                    } catch (err: any) { setMsg('Failed') }
                                    setLoading(false)
                                }} className="space-y-4">
                                    <Input name="rid" placeholder="Request ID" required />
                                    <Button type="submit" className="w-full">Approve Reset</Button>
                                </form>
                                {msg && <p className="text-center mt-4">{msg}</p>}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminPage
