import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    User, Mail, Shield, BadgeCheck, Camera, Save, RefreshCw
} from 'lucide-react'
import apiClient from '@/api/client'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'

const ProfilePage = () => {
    const { user, setUser, token } = useAuthStore()
    const { navigate } = useAppStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    })

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
            })
        }
    }, [user, token, navigate])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await apiClient.post('/api/user/update-profile', formData)
            setUser(res.data)
            toast.success('Profile updated successfully!')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            toast.error(error.response?.data?.detail || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    // Avatar initial
    const initial = user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'

    return (
        <div className="space-y-6">
            <Helmet><title>Profile | Go-Biz</title></Helmet>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">My Profile</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account information and preferences</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card className="glass relative overflow-hidden group">
                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="relative mx-auto w-24 h-24 mb-4">
                            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background shadow-xl">
                                {initial}
                            </div>
                            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-lg border border-border">
                                <Camera className="w-4 h-4" />
                            </Button>
                        </div>
                        <h2 className="text-xl font-bold">{user.name || user.email}</h2>
                        <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground">
                            <BadgeCheck className="w-4 h-4 text-primary" />
                            <span className="text-sm">Verified Account</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Credits</p>
                                <p className="text-lg font-bold text-primary">₹{user.credits?.toFixed(2)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Requests</p>
                                <p className="text-lg font-bold text-purple-400">{user.searches || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Section */}
                <Card className="glass lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-primary" /> Account Details
                        </CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username (Read-only)</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 bg-muted/20"
                                            value={user.email}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Account ID</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 bg-muted/20"
                                            value={`USR-${user.email?.slice(0, 5).toUpperCase()}`}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="glow-primary px-8" disabled={loading}>
                                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ProfilePage
