import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, CreditCard, Users, KeyRound, BarChart3, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'

interface UserData {
    email: string
    name: string
    account_status: string
    credits: number
    total_spent?: number
}

interface AdminStats {
    total_users: number
    total_searches: number
    pending_activations: number
    pending_payments: number
    pending_password_resets: number
}

interface DepositRequest {
    id: string
    user_id: string
    amount: number
    utr_number: string
    status: string
}

interface PasswordResetRequest {
    id: string
    email: string
    note: string
    status: string
}

const AdminPage = () => {
    const [adminToken, setAdminToken] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    // Feature Tabs
    const [activeTab, setActiveTab] = useState('stats')

    // State for each tab
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<UserData[]>([])
    const [pendingUsers, setPendingUsers] = useState<UserData[]>([])
    const [deposits, setDeposits] = useState<DepositRequest[]>([])
    const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([])

    // Credits form
    const [creditEmail, setCreditEmail] = useState('')
    const [creditAmount, setCreditAmount] = useState('')
    const [creditReason, setCreditReason] = useState('')

    // Password reset resolve form
    const [resetTempPass, setResetTempPass] = useState('')
    const [selectedResetId, setSelectedResetId] = useState('')

    const authHeader = { headers: { 'Authorization': `Bearer ${adminToken}` } }

    const handleLogin = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        try {
            const password = e.target.password.value
            const res = await apiClient.post('/api/auth/admin-login', { password })
            const token = res.data.token || password
            setAdminToken(token)
            setIsLoggedIn(true)
            fetchStats(token)
        } catch (err: any) {
            setMsg('Admin Login Failed: ' + (err.response?.data?.detail || 'wrong password'))
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async (token?: string) => {
        const t = token || adminToken
        try {
            const res = await apiClient.get('/api/admin/stats', { headers: { 'Authorization': `Bearer ${t}` } })
            setStats(res.data)
        } catch (e) { console.error(e) }
    }

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get('/api/admin/users', authHeader)
            setUsers(res.data.users || [])
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const fetchPendingUsers = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get('/api/admin/users/pending', authHeader)
            setPendingUsers(res.data.pending_users || [])
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const activateUser = async (email: string) => {
        try {
            await apiClient.post(`/api/admin/users/${email}/activate`, {}, authHeader)
            fetchPendingUsers()
            setMsg(`✓ ${email} activated`)
        } catch (e: any) { setMsg('Failed: ' + e.response?.data?.detail) }
    }

    const deactivateUser = async (email: string) => {
        try {
            await apiClient.post(`/api/admin/users/${email}/deactivate`, {}, authHeader)
            fetchUsers()
            setMsg(`✓ ${email} deactivated`)
        } catch (e: any) { setMsg('Failed: ' + e.response?.data?.detail) }
    }

    const handleAddCredits = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        setMsg('')
        try {
            const res = await apiClient.post(
                `/api/admin/users/${creditEmail}/credits/add`,
                { amount: parseFloat(creditAmount), reason: creditReason || 'Admin manual credit' },
                authHeader
            )
            setMsg(res.data.msg || 'Credits added')
            setCreditEmail(''); setCreditAmount(''); setCreditReason('')
        } catch (err: any) {
            setMsg(err.response?.data?.detail || 'Failed')
        } finally { setLoading(false) }
    }

    const fetchDeposits = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get('/api/admin/finance/pending-deposits', authHeader)
            setDeposits(res.data.pending_deposits || [])
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const handleDeposit = async (id: string, action: 'CREDIT' | 'REJECT', amount?: number) => {
        try {
            await apiClient.post(
                `/api/admin/finance/deposits/${id}/approve`,
                action === 'CREDIT' ? { action: 'CREDIT', amount } : { action: 'REJECT' },
                authHeader
            )
            fetchDeposits()
            setMsg(`Deposit ${action === 'CREDIT' ? 'approved' : 'rejected'}`)
        } catch (e: any) { setMsg('Failed: ' + e.response?.data?.detail) }
    }

    const fetchResetRequests = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get('/api/admin/requests/password-resets', authHeader)
            setResetRequests(res.data.requests || [])
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const resolveReset = async (id: string) => {
        if (!resetTempPass) return
        try {
            await apiClient.post(
                `/api/admin/requests/password-resets/${id}/resolve`,
                { new_temp_password: resetTempPass },
                authHeader
            )
            setMsg('Password reset resolved. Send temp password to user manually.')
            fetchResetRequests()
            setResetTempPass(''); setSelectedResetId('')
        } catch (e: any) { setMsg('Failed: ' + e.response?.data?.detail) }
    }

    const rejectReset = async (id: string) => {
        try {
            await apiClient.post(`/api/admin/requests/password-resets/${id}/reject`, {}, authHeader)
            fetchResetRequests()
            setMsg('Reset request rejected')
        } catch (e: any) { setMsg('Failed') }
    }

    const tabs = [
        { key: 'stats', label: 'Stats', icon: BarChart3 },
        { key: 'activate', label: 'Activate', icon: CheckCircle },
        { key: 'users', label: 'Users', icon: Users },
        { key: 'credits', label: 'Credits', icon: CreditCard },
        { key: 'deposits', label: 'Deposits', icon: DollarSign },
        { key: 'resets', label: 'Resets', icon: KeyRound },
    ]

    const switchTab = (key: string) => {
        setActiveTab(key)
        setMsg('')
        if (key === 'stats') fetchStats()
        else if (key === 'activate') fetchPendingUsers()
        else if (key === 'users') fetchUsers()
        else if (key === 'deposits') fetchDeposits()
        else if (key === 'resets') fetchResetRequests()
    }

    return (
        <div className="max-w-5xl mx-auto py-10 space-y-8 px-4">
            <Helmet><title>Admin | Go-Biz</title></Helmet>

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
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <Button
                                key={key}
                                size="sm"
                                variant={activeTab === key ? 'default' : 'secondary'}
                                onClick={() => switchTab(key)}
                            >
                                <Icon className="w-3 h-3 mr-1" /> {label}
                            </Button>
                        ))}
                    </div>

                    {msg && (
                        <p className="text-center bg-white/5 border border-white/10 rounded p-2 text-sm">{msg}</p>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Users', value: stats.total_users },
                                { label: 'Total Searches', value: stats.total_searches },
                                { label: 'Pending Activations', value: stats.pending_activations, warn: true },
                                { label: 'Pending Payments', value: stats.pending_payments, warn: true },
                                { label: 'Pending Resets', value: stats.pending_password_resets, warn: true },
                            ].map(({ label, value, warn }) => (
                                <Card key={label} className={`text-center ${warn && value > 0 ? 'border-yellow-500/40' : 'border-white/10'} bg-black/40`}>
                                    <CardContent className="pt-6">
                                        <p className={`text-3xl font-bold ${warn && value > 0 ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Activate Pending Users */}
                    {activeTab === 'activate' && (
                        <Card className="border-yellow-500/20 bg-black/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Pending Activations ({pendingUsers.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? <Loader2 className="mx-auto animate-spin" /> :
                                    pendingUsers.length === 0 ? <p className="text-center text-muted-foreground">No pending users.</p> : (
                                        <div className="space-y-2">
                                            {pendingUsers.map((u, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5">
                                                    <div>
                                                        <p className="font-bold">{u.email}</p>
                                                        <p className="text-xs text-muted-foreground">{u.name}</p>
                                                    </div>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => activateUser(u.email)}>
                                                        Activate
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    )}

                    {/* All Users */}
                    {activeTab === 'users' && (
                        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>All Users ({users.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? <Loader2 className="mx-auto animate-spin" /> : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {users.map((u, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5">
                                                <div>
                                                    <p className="font-bold text-sm">{u.email}</p>
                                                    <p className="text-xs text-muted-foreground">{u.name} • ₹{u.credits} • {u.account_status}</p>
                                                </div>
                                                <Button size="sm" variant={u.account_status === 'ACTIVE' ? 'destructive' : 'default'}
                                                    onClick={() => u.account_status === 'ACTIVE' ? deactivateUser(u.email) : activateUser(u.email)}>
                                                    {u.account_status === 'ACTIVE' ? 'Ban' : 'Activate'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Credits */}
                    {activeTab === 'credits' && (
                        <Card className="border-green-500/20 bg-black/40 backdrop-blur-xl max-w-md mx-auto">
                            <CardHeader>
                                <CardTitle>Add Credits to User</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddCredits} className="space-y-4">
                                    <Input placeholder="User Email" value={creditEmail} onChange={e => setCreditEmail(e.target.value)} required />
                                    <Input placeholder="Amount (e.g. 5000)" type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} required />
                                    <Input placeholder="Reason (e.g. UPI payment SBI123 verified)" value={creditReason} onChange={e => setCreditReason(e.target.value)} />
                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add Credits
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Deposits */}
                    {activeTab === 'deposits' && (
                        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Pending Deposits ({deposits.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? <Loader2 className="mx-auto animate-spin" /> :
                                    deposits.length === 0 ? <p className="text-center text-muted-foreground">No pending deposits.</p> : (
                                        <div className="space-y-3">
                                            {deposits.map((d, i) => (
                                                <div key={i} className="p-4 rounded bg-white/5 space-y-2">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <p className="font-bold">{d.user_id}</p>
                                                            <p className="text-xs text-muted-foreground">UTR: {d.utr_number}</p>
                                                        </div>
                                                        <p className="font-bold text-green-400">₹{d.amount}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1"
                                                            onClick={() => handleDeposit(d.id, 'CREDIT', d.amount)}>
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="flex-1"
                                                            onClick={() => handleDeposit(d.id, 'REJECT')}>
                                                            <XCircle className="w-3 h-3 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Password Resets */}
                    {activeTab === 'resets' && (
                        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Password Reset Requests ({resetRequests.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? <Loader2 className="mx-auto animate-spin" /> :
                                    resetRequests.length === 0 ? <p className="text-center text-muted-foreground">No pending resets.</p> : (
                                        <div className="space-y-4">
                                            {resetRequests.map((r, i) => (
                                                <div key={i} className="p-4 rounded bg-white/5 space-y-3">
                                                    <div>
                                                        <p className="font-bold">{r.email}</p>
                                                        <p className="text-xs text-muted-foreground">Note: {r.note}</p>
                                                    </div>
                                                    {selectedResetId === r.id ? (
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Temp password to set"
                                                                value={resetTempPass}
                                                                onChange={e => setResetTempPass(e.target.value)}
                                                                className="flex-1"
                                                            />
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => resolveReset(r.id)}>
                                                                Set
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" className="flex-1"
                                                                onClick={() => setSelectedResetId(r.id)}>
                                                                Resolve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" className="flex-1"
                                                                onClick={() => rejectReset(r.id)}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminPage
