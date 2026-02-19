import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Loader2, ShieldCheck, CreditCard, Users, KeyRound, BarChart3,
    CheckCircle, XCircle, DollarSign, Copy, RefreshCw, Eye, EyeOff,
    Lock, Settings, Bell, IndianRupee, UserCheck, Tag, Search, Wifi, Clock
} from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ADMIN_NOTIFY_EMAIL = 'mahendrakumargahelot@gmail.com'

function generatePassword(len = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    return Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => chars[b % chars.length]).join('')
}

interface Stats {
    total_users: number
    total_searches: number
    pending_activations: number
    pending_payments: number
    pending_password_resets: number
    total_revenue?: number
    system_health?: {
        cpu_percent: number
        memory: { percent: number; used_gb: number; total_gb: number }
        disk: { percent: number; used_gb: number; total_gb: number }
        network: { sent_mb: number; received_mb: number }
        platform: string
        uptime_seconds: number
    }
}
interface PendingUser { email: string; name: string; created_at: string; credits: number; account_status: string }
interface UserRecord { email: string; name: string; credits: number; searches: number; account_status: string; total_spent?: number }
interface Deposit { id: string; user_id: string; amount: number; utr_number: string; screenshot_url?: string; created_at: string }
interface ResetReq { id: string; email: string; note: string; created_at: string; status: string }
interface SystemSettings {
    auto_activate_users: boolean; welcome_credits: number; maintenance_mode: boolean;
    max_search_per_day: number; allow_api_key_access: boolean; search_log_full_mobile: boolean;
    min_deposit_amount: number; max_deposit_amount: number; max_login_attempts: number; block_duration_minutes: number;
    razorpay_mode: 'test' | 'live';
}
interface FieldPrices { base_search_fee: number; fields: Record<string, number> }
interface Notification { id: string; msg: string; created_at: string; read: boolean }

const AdminPage = () => {
    const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '')
    const [adminPwd, setAdminPwd] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [activeTab, setActiveTab] = useState('stats')
    const [loading, setLoading] = useState(false)

    const [stats, setStats] = useState<Stats | null>(null)
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
    const [users, setUsers] = useState<UserRecord[]>([])
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [allDeposits, setAllDeposits] = useState<any[]>([])
    const [depositSummary, setDepositSummary] = useState<any>(null)
    const [resets, setResets] = useState<ResetReq[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [prices, setPrices] = useState<FieldPrices | null>(null)
    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [settingsDraft, setSettingsDraft] = useState<Partial<SystemSettings>>({})
    const [pricesDraft, setPricesDraft] = useState<Partial<FieldPrices>>({})

    // Credits form
    const [creditEmail, setCreditEmail] = useState('')
    const [creditAmount, setCreditAmount] = useState('')
    const [creditReason, setCreditReason] = useState('')
    const [creditOp, setCreditOp] = useState<'add' | 'deduct'>('add')

    // Custom price per user
    const [customPriceEmail, setCustomPriceEmail] = useState('')
    const [customDiscount, setCustomDiscount] = useState('')

    // Direct user password reset
    const [resetEmail, setResetEmail] = useState('')
    const [resetTempPass, setResetTempPass] = useState('')

    // Generated passwords for reset requests
    const [genPasswords, setGenPasswords] = useState<Record<string, string>>({})
    const [showGenPass, setShowGenPass] = useState<Record<string, boolean>>({})

    const isLoggedIn = !!adminToken
    const authHeader = { headers: { 'Authorization': `Bearer ${adminToken}` } }

    // ── ADMIN LOGIN ──────────────────────────────────────────
    const handleAdminLogin = async () => {
        setLoginLoading(true); setLoginError('')
        try {
            // API v2: /api/auth/admin-login
            const res = await apiClient.post('/api/auth/admin-login', { password: adminPwd })
            const tok = res.data.token || res.data.access_token
            setAdminToken(tok)
            localStorage.setItem('admin_token', tok)
            toast.success('Admin login successful!')
        } catch (e: any) {
            const m = e.response?.data?.detail || 'Login failed'
            setLoginError(m); toast.error(m)
        } finally { setLoginLoading(false) }
    }

    // ── FETCH HELPERS ────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/stats', authHeader); setStats(r.data) } catch { }
    }, [adminToken])

    const fetchPending = useCallback(async () => {
        try {
            const r = await apiClient.get('/api/admin/users/pending', authHeader)
            // API v2: key is "pending_users"
            setPendingUsers(r.data.pending_users || r.data.users || r.data || [])
        } catch { }
    }, [adminToken])

    const fetchUsers = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/users', authHeader); setUsers(r.data.users || r.data || []) } catch { }
    }, [adminToken])

    const fetchDeposits = useCallback(async () => {
        try {
            const r = await apiClient.get('/api/admin/finance/pending-deposits', authHeader)
            setDeposits(r.data.pending_deposits || r.data.deposits || r.data || [])
        } catch { }
    }, [adminToken])

    const fetchAllDeposits = useCallback(async () => {
        try {
            const r = await apiClient.get('/api/admin/finance/all-deposits', authHeader)
            setAllDeposits(r.data.deposits || [])
            setDepositSummary(r.data.summary || null)
        } catch { }
    }, [adminToken])

    const fetchResets = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/requests/password-resets', authHeader); setResets(r.data.requests || []) } catch { }
    }, [adminToken])

    const fetchNotifications = useCallback(async () => {
        try { const r = await apiClient.get('/api/admin/notifications', authHeader); setNotifications(r.data.notifications || r.data || []) } catch { }
    }, [adminToken])

    const fetchPrices = useCallback(async () => {
        try {
            const r = await apiClient.get('/api/admin/config/prices', authHeader)
            const pm = r.data.pricing_model || r.data
            setPrices(pm)
            setPricesDraft({ base_search_fee: pm.base_search_fee, fields: { ...pm.fields } })
        } catch { }
    }, [adminToken])

    const fetchSettings = useCallback(async () => {
        try {
            const r = await apiClient.get('/api/admin/settings', authHeader)
            const s = r.data.settings || r.data
            setSettings(s); setSettingsDraft(s)
        } catch { }
    }, [adminToken])

    useEffect(() => {
        if (!isLoggedIn) return
        fetchStats(); fetchPending(); fetchUsers(); fetchDeposits(); fetchResets()
        fetchNotifications(); fetchPrices(); fetchSettings()
    }, [isLoggedIn])

    // ── ACTIONS ──────────────────────────────────────────────
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
            setCreditEmail(''); setCreditAmount(''); setCreditReason(''); fetchUsers()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') } finally { setLoading(false) }
    }

    const handleDeposit = async (id: string, action: 'CREDIT' | 'REJECT', amount?: number) => {
        try {
            await apiClient.post(`/api/admin/finance/deposits/${id}/approve`,
                action === 'CREDIT' ? { action: 'CREDIT', amount } : { action: 'REJECT' }, authHeader)
            toast.success(`Deposit ${action === 'CREDIT' ? 'approved' : 'rejected'}`)
            fetchDeposits(); fetchAllDeposits()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const generateAndResolve = async (req: ResetReq) => {
        const newPass = generatePassword(12)
        setGenPasswords(p => ({ ...p, [req.id]: newPass }))
        setShowGenPass(p => ({ ...p, [req.id]: true }))
        try {
            // API v2: body field is "new_temp_password"
            await apiClient.post(`/api/admin/requests/password-resets/${req.id}/resolve`,
                { new_temp_password: newPass }, authHeader)
            toast.success(`Password set for ${req.email} — copy and send it!`)
            fetchResets()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const rejectReset = async (id: string) => {
        try { await apiClient.post(`/api/admin/requests/password-resets/${id}/reject`, {}, authHeader); toast.success('Reset request rejected'); fetchResets() } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    // Direct user password reset (Section 8)
    const handleDirectPasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await apiClient.post(`/api/admin/users/${resetEmail}/reset-password`, { new_temp_password: resetTempPass }, authHeader)
            toast.success(`Password set for ${resetEmail}! Send it to them.`)
            setResetEmail(''); setResetTempPass('')
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    // Custom price per user
    const handleCustomPrice = async (e: React.FormEvent) => {
        e.preventDefault()
        const discount = parseFloat(customDiscount)
        if (!discount || discount < 0 || discount > 100) { toast.error('Discount must be 0-100%'); return }
        try {
            await apiClient.post(`/api/admin/users/${customPriceEmail}/custom-price`, { discount_percent: discount }, authHeader)
            toast.success(`Custom price set for ${customPriceEmail}`)
            setCustomPriceEmail(''); setCustomDiscount('')
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    // Update prices
    const handleUpdatePrices = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await apiClient.post('/api/admin/config/prices/update', { pricing_model: pricesDraft }, authHeader)
            toast.success('Prices updated! Takes effect immediately.')
            fetchPrices()
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    // Update settings
    const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
        try {
            const res = await apiClient.post('/api/admin/settings', updates, authHeader)
            const newSettings = res.data.current_settings || res.data.settings || res.data
            if (newSettings) { setSettings(newSettings); setSettingsDraft(newSettings) }
            toast.success(`Settings updated: ${Object.keys(updates).join(', ')}`)
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const handleResetSettings = async () => {
        try {
            const res = await apiClient.post('/api/admin/settings/reset', {}, authHeader)
            const s = res.data.settings || res.data
            setSettings(s); setSettingsDraft(s)
            toast.success('Settings reset to factory defaults')
        } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed') }
    }

    const markNotificationRead = async (id: string) => {
        try {
            await apiClient.post(`/api/admin/notifications/${id}/read`, {}, authHeader)
            setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
        } catch { }
    }

    const copyPass = (pass: string, email: string) => {
        navigator.clipboard.writeText(pass)
        toast.success(`Password copied! Send to ${email}`)
    }

    const adminLogout = () => {
        setAdminToken(''); localStorage.removeItem('admin_token'); toast.info('Admin logged out')
    }

    const unreadCount = notifications.filter(n => !n.read).length

    const tabs = [
        { key: 'stats', label: 'Stats', icon: BarChart3 },
        { key: 'notifications', label: `Notifs${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: Bell },
        { key: 'activate', label: `Activate (${pendingUsers.length})`, icon: CheckCircle },
        { key: 'users', label: 'Users', icon: Users },
        { key: 'credits', label: 'Credits', icon: CreditCard },
        { key: 'custom-price', label: 'Custom Price', icon: Tag },
        { key: 'deposits', label: `Deposits (${deposits.length})`, icon: DollarSign },
        { key: 'all-deposits', label: 'All Deposits', icon: IndianRupee },
        { key: 'resets', label: `Resets (${resets.length})`, icon: KeyRound },
        { key: 'direct-reset', label: 'Set Password', icon: UserCheck },
        { key: 'prices', label: 'Prices', icon: Tag },
        { key: 'settings', label: 'Settings', icon: Settings },
    ]

    // ── LOGIN SCREEN ─────────────────────────────────────────
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
                                <Input type={showPwd ? 'text' : 'password'} placeholder="Admin Password"
                                    value={adminPwd} onChange={e => setAdminPwd(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
                            <Button className="w-full glow-primary" onClick={handleAdminLogin} disabled={loginLoading}>
                                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />} Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // ── MAIN PANEL ───────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Helmet><title>Admin Panel | Go-Biz</title></Helmet>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
                        <p className="text-xs text-muted-foreground">Contact: {ADMIN_NOTIFY_EMAIL}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={adminLogout}>Logout</Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0",
                            activeTab === t.key ? "bg-primary text-primary-foreground shadow-md" : "glass hover:bg-white/10 text-muted-foreground")}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ── STATS ── */}
            {activeTab === 'stats' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Users', val: stats?.total_users ?? '—', icon: Users, color: 'text-blue-400' },
                            { label: 'Total Searches', val: stats?.total_searches ?? '—', icon: Search, color: 'text-purple-400' },
                            { label: 'Pending Pymts', val: stats?.pending_payments ?? '—', icon: IndianRupee, color: 'text-yellow-400' },
                            { label: 'Pending Resets', val: stats?.pending_password_resets ?? '—', icon: KeyRound, color: 'text-red-400' },
                        ].map(s => (
                            <Card key={s.label} className="glass border-primary/10 overflow-hidden relative group">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", s.color)}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{s.label}</p>
                                        <p className="text-xl font-bold">{s.val}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {stats?.system_health && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" /> Server Status & Health
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CPU */}
                                <Card className="glass border-primary/20 bg-primary/5">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">CPU Usage</span>
                                            <span className="text-xs font-bold">{stats.system_health.cpu_percent}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${stats.system_health.cpu_percent}%` }} />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{stats.system_health.platform} Server</p>
                                    </CardContent>
                                </Card>
                                {/* Memory */}
                                <Card className="glass border-purple-500/20 bg-purple-500/5">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">RAM Allocation</span>
                                            <span className="text-xs font-bold">{stats.system_health.memory.percent}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${stats.system_health.memory.percent}%` }} />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{stats.system_health.memory.used_gb.toFixed(1)}GB / {stats.system_health.memory.total_gb.toFixed(1)}GB used</p>
                                    </CardContent>
                                </Card>
                                {/* Disk */}
                                <Card className="glass border-orange-500/20 bg-orange-500/5">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">Disk Usage</span>
                                            <span className="text-xs font-bold">{stats.system_health.disk.percent}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${stats.system_health.disk.percent}%` }} />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{stats.system_health.disk.used_gb.toFixed(0)}GB / {stats.system_health.disk.total_gb.toFixed(0)}GB</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
                                <div className="flex items-center gap-1.5"><Wifi className="w-3 h-3" /> Net Sent: {stats.system_health.network.sent_mb.toFixed(2)} MB</div>
                                <div className="flex items-center gap-1.5"><Wifi className="w-3 h-3" /> Net Recv: {stats.system_health.network.received_mb.toFixed(2)} MB</div>
                                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Uptime: {(stats.system_health.uptime_seconds / 3600).toFixed(1)} hours</div>
                            </div>
                        </div>
                    )}

                    <Button variant="secondary" size="sm" onClick={() => { fetchStats(); toast('Stats refreshed') }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh Dashboard
                    </Button>
                </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">Notifications ({notifications.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchNotifications}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-muted-foreground">No notifications</div>
                    ) : notifications.map(n => (
                        <Card key={n.id} className={cn("glass", n.read ? 'opacity-50' : 'border-primary/30')}>
                            <CardContent className="p-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm">{n.msg}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                                {!n.read && <Button size="sm" variant="secondary" onClick={() => markNotificationRead(n.id)}>Mark Read</Button>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── ACTIVATE ── */}
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
                                    <p className="text-xs text-muted-foreground">{u.email} · Credits: {u.credits}</p>
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

            {/* ── USERS ── */}
            {activeTab === 'users' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">All Users ({users.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchUsers}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    <div className="overflow-x-auto rounded-xl glass">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-white/10 dark:border-white/10">
                                {['Name', 'Email', 'Credits', 'Spent', 'Searches', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.email} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">{u.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                        <td className="px-4 py-3">₹{u.credits?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-orange-400">₹{(u.total_spent || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3">{u.searches}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                                                u.account_status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                    u.account_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400')}>{u.account_status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.account_status !== 'ACTIVE'
                                                ? <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => activateUser(u.email)}>Activate</Button>
                                                : <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => deactivateUser(u.email)}>Ban</Button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <div className="text-center py-8 text-muted-foreground">No users found</div>}
                    </div>
                </div>
            )}

            {/* ── CREDITS ── */}
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
                                <Input placeholder="Reason (e.g. UPI SBI123 verified)" value={creditReason} onChange={e => setCreditReason(e.target.value)} />
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

            {/* ── CUSTOM PRICE PER USER ── */}
            {activeTab === 'custom-price' && (
                <div className="max-w-md space-y-4">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Custom User Pricing</CardTitle>
                            <CardDescription>Apply a discount or fixed prices for a specific user</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCustomPrice} className="space-y-4">
                                <Input placeholder="User Email" value={customPriceEmail} onChange={e => setCustomPriceEmail(e.target.value)} required />
                                <Input placeholder="Discount % (0-100)" type="number" min="0" max="100" step="1"
                                    value={customDiscount} onChange={e => setCustomDiscount(e.target.value)} required />
                                <p className="text-xs text-muted-foreground">E.g. 10 = 10% off all field prices for this user</p>
                                <Button type="submit" className="w-full">Apply Custom Price</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── PENDING DEPOSITS ── */}
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
                                        <p className="font-medium">{d.user_id}</p>
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

            {/* ── ALL DEPOSITS ── */}
            {activeTab === 'all-deposits' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">All Deposits</h2>
                        <Button size="sm" variant="secondary" onClick={fetchAllDeposits}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {depositSummary && (
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Approved', val: `₹${(depositSummary.approved || 0).toFixed(2)}`, color: 'text-green-400' },
                                { label: 'Pending', val: `₹${(depositSummary.pending || 0).toFixed(2)}`, color: 'text-yellow-400' },
                                { label: 'Rejected', val: `₹${(depositSummary.rejected || 0).toFixed(2)}`, color: 'text-red-400' },
                            ].map(s => (
                                <Card key={s.label} className="glass"><CardContent className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className={cn("text-xl font-bold mt-1", s.color)}>{s.val}</p>
                                </CardContent></Card>
                            ))}
                        </div>
                    )}
                    <div className="overflow-x-auto rounded-xl glass">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border/50">
                                {['User', 'Amount', 'UTR', 'Status', 'Date'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {allDeposits.map((d, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground">{d.user_id}</td>
                                        <td className="px-4 py-3 font-medium">₹{d.amount}</td>
                                        <td className="px-4 py-3 text-xs">{d.utr_number}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                                d.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    d.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400')}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {allDeposits.length === 0 && <div className="text-center py-8 text-muted-foreground"><Button onClick={fetchAllDeposits} variant="secondary" size="sm">Load All Deposits</Button></div>}
                    </div>
                </div>
            )}

            {/* ── PASSWORD RESET REQUESTS ── */}
            {activeTab === 'resets' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">Password Reset Requests ({resets.length})</h2>
                        <Button size="sm" variant="secondary" onClick={fetchResets}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {resets.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-muted-foreground">No reset requests 🎉</div>
                    ) : resets.map(r => (
                        <Card key={r.id} className={cn("glass", r.status !== 'pending' && 'opacity-60')}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{r.email}</p>
                                        <p className="text-xs text-muted-foreground">Note: {r.note || 'No note'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                                    </div>
                                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                                        r.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                            r.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400')}>
                                        {r.status}
                                    </span>
                                </div>
                                {genPasswords[r.id] && (
                                    <div className="bg-black/40 border border-green-500/30 rounded-lg p-3 space-y-2">
                                        <p className="text-xs text-muted-foreground">Generated password (send to {r.email}):</p>
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
                                        <p className="text-xs text-yellow-400">⚠ Send to {r.email} via WhatsApp/Email. Admin: {ADMIN_NOTIFY_EMAIL}</p>
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

            {/* ── DIRECT PASSWORD RESET ── */}
            {activeTab === 'direct-reset' && (
                <div className="max-w-md space-y-4">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Set User Password Directly</CardTitle>
                            <CardDescription>Set a temporary password for any user by email</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDirectPasswordReset} className="space-y-4">
                                <Input placeholder="User Email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                                <div className="relative">
                                    <Input placeholder="New Temp Password" value={resetTempPass} onChange={e => setResetTempPass(e.target.value)} required />
                                </div>
                                <Button type="button" variant="secondary" className="w-full" onClick={() => setResetTempPass(generatePassword(12))}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Auto-Generate Password
                                </Button>
                                {resetTempPass && (
                                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded p-2">
                                        <code className="text-green-400 text-sm flex-1 font-mono">{resetTempPass}</code>
                                        <button type="button" onClick={() => { navigator.clipboard.writeText(resetTempPass); toast.success('Copied!') }}>
                                            <Copy className="w-4 h-4 text-primary" />
                                        </button>
                                    </div>
                                )}
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    <UserCheck className="w-4 h-4 mr-2" /> Set Password
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">After setting, manually send the password to the user via WhatsApp/Email to {ADMIN_NOTIFY_EMAIL}</p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── PRICES ── */}
            {activeTab === 'prices' && prices && (
                <div className="max-w-lg">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Field Pricing Configuration</CardTitle>
                            <CardDescription>Changes take effect immediately for all searches</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePrices} className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Base Search Fee (₹)</label>
                                    <Input type="number" min="0" step="0.1" value={pricesDraft.base_search_fee ?? ''} onChange={e => setPricesDraft(p => ({ ...p, base_search_fee: parseFloat(e.target.value) }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {prices.fields && Object.entries(prices.fields).map(([field, price]) => (
                                        <div key={field}>
                                            <label className="text-xs text-muted-foreground mb-1 block capitalize">{field} (₹)</label>
                                            <Input type="number" min="0" step="0.1"
                                                value={(pricesDraft.fields as any)?.[field] ?? price}
                                                onChange={e => setPricesDraft(p => ({ ...p, fields: { ...(p.fields || {}), [field]: parseFloat(e.target.value) } }))} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Save Prices</Button>
                                    <Button type="button" variant="secondary" onClick={fetchPrices}><RefreshCw className="w-4 h-4" /></Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && settings && (
                <div className="max-w-lg space-y-4">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                            <CardDescription>All changes take effect immediately</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Toggle settings */}
                            {([
                                { key: 'auto_activate_users', label: 'Auto-Activate Users', desc: 'Users log in immediately after registration' },
                                { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Blocks all search requests (503)' },
                                { key: 'allow_api_key_access', label: 'Allow API Key Auth', desc: 'Enable Bearer ApiKey as auth method' },
                                { key: 'search_log_full_mobile', label: 'Log Full Mobile', desc: 'Store full mobile number in search logs' },
                            ] as { key: keyof SystemSettings, label: string, desc: string }[]).map(s => (
                                <div key={s.key} className="flex items-center justify-between p-3 rounded-lg glass">
                                    <div>
                                        <p className="text-sm font-medium">{s.label}</p>
                                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateSettings({ [s.key]: !settingsDraft[s.key] })}
                                        className={cn("custom-switch transition-all duration-200",
                                            settingsDraft[s.key] ? 'bg-primary' : 'bg-muted-foreground/20')}
                                    >
                                        <span className={cn("custom-switch-thumb shadow-md",
                                            settingsDraft[s.key] ? 'translate-x-5' : 'translate-x-0')} />
                                    </button>
                                </div>
                            ))}

                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <div>
                                    <p className="text-sm font-medium">Razorpay Gateway Mode</p>
                                    <p className="text-xs text-muted-foreground">Currently: {settingsDraft.razorpay_mode?.toUpperCase()}</p>
                                </div>
                                <div className="flex bg-muted rounded-md p-1">
                                    {(['test', 'live'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => handleUpdateSettings({ razorpay_mode: m })}
                                            className={cn("px-3 py-1 text-xs font-bold rounded uppercase transition-all",
                                                settingsDraft.razorpay_mode === m ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Numeric settings */}
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { key: 'welcome_credits', label: 'Welcome Credits (₹)', min: 0 },
                                    { key: 'max_search_per_day', label: 'Max Searches/Day (0=∞)', min: 0 },
                                    { key: 'min_deposit_amount', label: 'Min Deposit (₹)', min: 0 },
                                    { key: 'max_deposit_amount', label: 'Max Deposit (₹)', min: 0 },
                                    { key: 'max_login_attempts', label: 'Max Login Attempts', min: 1 },
                                    { key: 'block_duration_minutes', label: 'Block Duration (min)', min: 1 },
                                ] as { key: keyof SystemSettings, label: string, min: number }[]).map(s => (
                                    <div key={s.key}>
                                        <label className="text-xs text-muted-foreground block mb-1">{s.label}</label>
                                        <div className="flex gap-1">
                                            <Input type="number" min={s.min} value={(settingsDraft[s.key] as number) ?? 0}
                                                onChange={e => setSettingsDraft(p => ({ ...p, [s.key]: parseFloat(e.target.value) }))} />
                                            <Button size="icon" variant="secondary"
                                                onClick={() => handleUpdateSettings({ [s.key]: settingsDraft[s.key] })}>✓</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="destructive" className="w-full" onClick={handleResetSettings}>
                                Reset All to Factory Defaults
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
            }
        </div >
    )
}

export default AdminPage
