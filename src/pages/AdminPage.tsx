import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, CreditCard, Users, KeyRound, BarChart3, CheckCircle, XCircle, DollarSign, Copy, RefreshCw, Eye, EyeOff, Lock } from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ADMIN_NOTIFY_EMAIL = 'mahendrakumargahelot@gmail.com'

function generatePassword(len = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    return Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => chars[b % chars.length]).join('')
}

interface Stats { total_users: number; active_users: number; total_searches: number; total_revenue: number }
interface PendingUser { email: string; name: string; created_at: string }
interface UserRecord { email: string; name: string; credits: number; searches: number; account_status: string }
interface Deposit { id: string; email: string; amount: number; utr_number: string; screenshot_url?: string; created_at: string }
interface ResetReq { id: string; email: string; note: string; created_at: string; status: string }

const AdminPage = () => {
    const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '')
    const [adminPwd, setAdminPwd] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [activeTab, setActiveTab] = useState('stats')

    const [stats, setStats] = useState<Stats | null>(null)
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
    const [users, setUsers] = useState<UserRecord[]>([])
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [resets, setResets] = useState<ResetReq[]>([])

    const [creditEmail, setCreditEmail] = useState('')
    const [creditAmount, setCreditAmount] = useState('')
    const [creditReason, setCreditReason] = useState('')
    const [creditOp, setCreditOp] = useState<'add' | 'deduct'>('add')

    const [loading, setLoading] = useState(false)
    const [genPasswords, setGenPasswords] = useState<Record<string, string>>({})
    const [showGenPass, setShowGenPass] = useState<Record<string, boolean>>({})

    const isLoggedIn = !!adminToken
    const authHeader = { headers: { 'Authorization': `Bearer ${adminToken}` } }

    const handleAdminLogin = async () => {
        setLoginLoading(true); setLoginError('')
        try {
            const res = await apiClient.post('/api/admin/login', { password: adminPwd })
            const tok = res.data.token || res.data.access_token
            setAdminToken(tok)
            localStorage.setItem('admin_token', tok)
            toast.success('Admin login successful!')
        } catch (e: any) {
            const m = e.response?.data?.detail || 'Login failed'
            setLoginError(m); toast.error(m)
        } finally {
            setLoginLoading(false)
        }
    }

    const fetchStats = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/stats', authHeader); setStats(r.data) } catch { }
    }, [adminToken])

    const fetchPending = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/users/pending', authHeader); setPendingUsers(r.data.users || r.data || []) } catch { }
    }, [adminToken])

    const fetchUsers = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/users', authHeader); setUsers(r.data.users || r.data || []) } catch { }
    }, [adminToken])

    const fetchDeposits = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/finance/pending-deposits', authHeader); setDeposits(r.data.deposits || r.data || []) } catch { }
    }, [adminToken])

    const fetchResets = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/requests/password-resets', authHeader); setResets(r.data.requests || r.data || []) } catch { }
    }, [adminToken])

    useEffect(() => {
        if (!isLoggedIn) return
        fetchStats(); fetchPending(); fetchUsers(); fetchDeposits(); fetchResets()
    }, [isLoggedIn])

    const activateUser = async (email: string) => {
        try { await apiClient.post(`/api/admin/users/${email}/activate`, {}, authHeader); toast.success(`Activated ${email}`); fetchPending(); fetchUsers() } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }
    const deactivateUser = async (email: string) => {
        try { await apiClient.post(`/api/admin/users/${email}/deactivate`, {}, authHeader); toast.success(`Deactivated ${email}`); fetchUsers() } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const handleAddCredits = async (e: React.FormEvent) => {
        e.preventDefault()
        const amt = parseFloat(creditAmount)
        if (!amt || amt <= 0) { toast.error('Amount must be > 0'); return }
        setLoading(true)
        try {
            const endpoint = creditOp === 'add' ? 'add' : 'deduct'
            await apiClient.post(`/api/admin/users/${creditEmail}/credits/${endpoint}`, { amount: amt, reason: creditReason }, authHeader)
            toast.success(`Credits ${creditOp === 'add' ? 'added' : 'deducted'} for ${creditEmail}`)
            setCreditEmail(''); setCreditAmount(''); setCreditReason('')
            fetchUsers()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') } finally { setLoading(false) }
    }

    const handleDeposit = async (id: string, action: 'CREDIT' | 'REJECT', amount?: number) => {
        try {
            await apiClient.post(`/api/admin/finance/deposits/${id}/approve`,
                action === 'CREDIT' ? { action: 'CREDIT', amount } : { action: 'REJECT' },
                authHeader)
            toast.success(`Deposit ${action === 'CREDIT' ? 'approved' : 'rejected'}`)
            fetchDeposits()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const generateAndResolve = async (req: ResetReq) => {
        const newPass = generatePassword(12)
        setGenPasswords(p => ({ ...p, [req.id]: newPass }))
        setShowGenPass(p => ({ ...p, [req.id]: true }))
        try {
            await apiClient.post(`/api/admin/requests/password-resets/${req.id}/resolve`,
                { new_password: newPass }, authHeader)
            toast.success(`Password set for ${req.email} — copy and send it!`)
            fetchResets()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const rejectReset = async (id: string) => {
        try {
            await apiClient.post(`/api/admin/requests/password-resets/${id}/reject`, {}, authHeader)
            toast.success('Reset request rejected')
            fetchResets()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const copyPass = (pass: string, email: string) => {
        navigator.clipboard.writeText(pass)
        toast.success(`Password copied! Send to ${email}`)
    }

    const adminLogout = () => {
        setAdminToken('')
        localStorage.removeItem('admin_token')
        toast.info('Admin logged out')
    }

    const tabs = [
        { key: 'stats', label: 'Stats', icon: BarChart3 },
        { key: 'activate', label: `Activate (${pendingUsers.length})`, icon: CheckCircle },
        { key: 'users', label: 'Users', icon: Users },
        { key: 'credits', label: 'Credits', icon: CreditCard },
        { key: 'deposits', label: `Deposits (${deposits.length})`, icon: DollarSign },
        { key: 'resets', label: `Resets (${resets.length})`, icon: KeyRound },
    ]

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Helmet><title>Admin | Go-Biz</title></Helmet>
                <div className="w-full max-w-sm">
                    <Card className="glass border-primary/20">
                        <CardHeader className="text-center">
                            <ShieldCheck className="w-12 h-12 mx-auto text-primary mb-2" />
                            <CardTitle>Admin Panel</CardTitle>
                            <CardDescription>Enter admin password to continue</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Admin Password"
                                    value={adminPwd}
                                    onChange={e => setAdminPwd(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
                            <Button className="w-full glow-primary" onClick={handleAdminLogin} disabled={loginLoading}>
                                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Helmet><title>Admin Panel | Go-Biz</title></Helmet>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
                        <p className="text-xs text-muted-foreground">Notifications → {ADMIN_NOTIFY_EMAIL}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={adminLogout}>Logout</Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === t.key ? "bg-primary text-primary-foreground shadow-md" : "glass hover:bg-white/10 text-muted-foreground"
                        )}
                    >
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            {activeTab === 'stats' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Users', val: stats?.total_users ?? '—', icon: Users, color: 'text-blue-400' },
                            { label: 'Active Users', val: stats?.active_users ?? '—', icon: CheckCircle, color: 'text-green-400' },
                            { label: 'Total Searches', val: stats?.total_searches ?? '—', icon: BarChart3, color: 'text-purple-400' },
                            { label: 'Revenue', val: stats?.total_revenue != null ? `₹${stats.total_revenue.toFixed(2)}` : '—', icon: DollarSign, color: 'text-yellow-400' },
                        ].map(s => (
                            <Card key={s.label} className="glass">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground">{s.label}</span>
                                        <s.icon className={cn("w-4 h-4", s.color)} />
                                    </div>
                                    <div className="text-2xl font-bold">{s.val}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Button variant="secondary" onClick={() => { fetchStats(); toast('Stats refreshed') }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            )}

            {/* Activate */}
            {activeTab === 'activate' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">Pending Activation ({pendingUsers.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchPending}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {pendingUsers.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-muted-foreground">No pending users 🎉</div>
                    ) : pendingUsers.map(u => (
                        <Card key={u.email} className="glass">
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => activateUser(u.email)}>
                                        <CheckCircle className="w-4 h-4 mr-1" /> Activate
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => deactivateUser(u.email)}>
                                        <XCircle className="w-4 h-4 mr-1" /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* User Management */}
            {activeTab === 'users' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">All Users ({users.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchUsers}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    <div className="overflow-x-auto rounded-xl glass">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {['Name', 'Email', 'Credits', 'Searches', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.email} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                        <td className="px-4 py-3 font-medium">{u.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                        <td className="px-4 py-3">₹{u.credits?.toFixed(2)}</td>
                                        <td className="px-4 py-3">{u.searches}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                                                u.account_status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                    u.account_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400')}>
                                                {u.account_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {u.account_status !== 'ACTIVE' && (
                                                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => activateUser(u.email)}>Activate</Button>
                                                )}
                                                {u.account_status === 'ACTIVE' && (
                                                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => deactivateUser(u.email)}>Ban</Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No users found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Credits */}
            {activeTab === 'credits' && (
                <div className="max-w-md">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Manage Credits</CardTitle>
                            <CardDescription>Add or deduct credits from any user</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddCredits} className="space-y-4">
                                <Input placeholder="User Email" value={creditEmail} onChange={e => setCreditEmail(e.target.value)} required />
                                <Input placeholder="Amount (must be > 0)" type="number" min="0.01" step="0.01" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} required />
                                <Input placeholder="Reason (e.g. UPI payment verified)" value={creditReason} onChange={e => setCreditReason(e.target.value)} />
                                <div className="flex gap-2">
                                    <Button type="button" variant={creditOp === 'add' ? 'default' : 'outline'} className="flex-1" onClick={() => setCreditOp('add')}>+ Add</Button>
                                    <Button type="button" variant={creditOp === 'deduct' ? 'destructive' : 'outline'} className="flex-1" onClick={() => setCreditOp('deduct')}>- Deduct</Button>
                                </div>
                                <Button type="submit" className={cn("w-full", creditOp === 'add' ? 'bg-green-600 hover:bg-green-700' : '')} variant={creditOp === 'deduct' ? 'destructive' : 'default'} disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {creditOp === 'add' ? 'Add Credits' : 'Deduct Credits'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Deposits */}
            {activeTab === 'deposits' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">Pending Deposits ({deposits.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchDeposits}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {deposits.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-muted-foreground">No pending deposits 🎉</div>
                    ) : deposits.map(d => (
                        <Card key={d.id} className="glass">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{d.email}</p>
                                        <p className="text-xs text-muted-foreground">UTR: {d.utr_number}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                                    </div>
                                    <p className="text-xl font-bold text-green-400">₹{d.amount}</p>
                                </div>
                                {d.screenshot_url && <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View Screenshot</a>}
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleDeposit(d.id, 'CREDIT', d.amount)}>
                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve (₹{d.amount})
                                    </Button>
                                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeposit(d.id, 'REJECT')}>
                                        <XCircle className="w-4 h-4 mr-1" /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Password Resets */}
            {activeTab === 'resets' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">Password Reset Requests ({resets.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchResets}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {resets.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-muted-foreground">No reset requests 🎉</div>
                    ) : resets.map(r => (
                        <Card key={r.id} className={cn("glass", r.status === 'resolved' ? 'opacity-60' : '')}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{r.email}</p>
                                        <p className="text-xs text-muted-foreground">Note: {r.note || 'No note'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                                    </div>
                                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                                        r.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                            r.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400')}>
                                        {r.status}
                                    </span>
                                </div>

                                {/* Generated password box */}
                                {genPasswords[r.id] && (
                                    <div className="bg-black/40 border border-green-500/30 rounded-lg p-3 space-y-2">
                                        <p className="text-xs text-muted-foreground">Generated Password (send to {r.email}):</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 font-mono text-green-400 text-sm break-all">
                                                {showGenPass[r.id] ? genPasswords[r.id] : '••••••••••••'}
                                            </code>
                                            <button onClick={() => setShowGenPass(p => ({ ...p, [r.id]: !p[r.id] }))} className="text-muted-foreground hover:text-foreground">
                                                {showGenPass[r.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => copyPass(genPasswords[r.id], r.email)} className="text-primary hover:text-primary/80">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-yellow-400">⚠ Copy now and send to {r.email} via WhatsApp/Email. Admin: {ADMIN_NOTIFY_EMAIL}</p>
                                    </div>
                                )}

                                {r.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => generateAndResolve(r)}>
                                            <RefreshCw className="w-4 h-4 mr-1" /> Generate & Set Password
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => rejectReset(r.id)}>
                                            <XCircle className="w-4 h-4 mr-1" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminPage
