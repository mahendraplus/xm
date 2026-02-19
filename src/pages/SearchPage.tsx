import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import apiClient from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, User, Users, Home, Mail, Phone, Calendar, Wifi, MapPin, Hash, CheckSquare, Square, AlertCircle, SearchX, IndianRupee } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FIELD_OPTIONS = [
    { key: 'name', label: 'Name', price: 5.0, icon: User },
    { key: 'fname', label: 'Father Name', price: 10.0, icon: Users },
    { key: 'address', label: 'Address', price: 25.0, icon: Home },
    { key: 'email', label: 'Email', price: 15.0, icon: Mail },
    { key: 'alt', label: 'Alt Mobile', price: 20.0, icon: Phone },
    { key: 'dob', label: 'Date of Birth', price: 5.0, icon: Calendar },
    { key: 'gender', label: 'Gender', price: 2.0, icon: User },
    { key: 'carrier', label: 'Carrier', price: 1.0, icon: Wifi },
    { key: 'circle', label: 'Circle/State', price: 1.0, icon: MapPin },
    { key: 'id', label: 'ID (Aadhaar)', price: 100.0, icon: Hash },
]

const BASE_FEE = 1.0

const SearchPage = () => {
    const { user, setUser } = useAuthStore()
    const { navigate } = useAppStore()
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [selectedFields, setSelectedFields] = useState<string[]>(FIELD_OPTIONS.map(f => f.key))
    const [noResults, setNoResults] = useState(false)

    const allSelected = selectedFields.length === FIELD_OPTIONS.length

    const toggleField = (key: string) => {
        setSelectedFields(prev =>
            prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key]
        )
    }

    const toggleAll = () => {
        setSelectedFields(allSelected ? [FIELD_OPTIONS[0].key] : FIELD_OPTIONS.map(f => f.key))
    }

    const estimatedCost = () => {
        const fieldTotal = selectedFields.reduce((sum, key) => {
            const f = FIELD_OPTIONS.find(o => o.key === key)
            return sum + (f?.price || 0)
        }, 0)
        return BASE_FEE + fieldTotal
    }

    const onSearch = async (data: any) => {
        if (!user) { navigate('auth'); return }
        setLoading(true)
        setError('')
        setResult(null)
        setNoResults(false)
        const requested_fields = allSelected ? ['ALL'] : selectedFields

        try {
            const res = await apiClient.post('/api/user/search', { mobile: data.mobile, requested_fields })

            if (res.data.status === 'no_results' || res.data.data === null) {
                setNoResults(true)
                toast.info('No record found for this mobile number', { description: `Charged: ₹${res.data.billing?.total_deducted?.toFixed(2)} (base fee only)` })
            } else {
                setResult(res.data)
                toast.success('Record found!', { description: `Charged: ₹${res.data.billing?.total_deducted?.toFixed(2)}` })
            }

            // Refresh balance
            if (user) {
                apiClient.get('/api/user/profile').then(r => setUser(r.data)).catch(() => { })
            }
        } catch (err: any) {
            const detail = err.response?.data?.detail || err.response?.data?.msg
            if (err.response?.status === 402) {
                const m = 'Insufficient credits. Please top up your wallet.'
                setError(m); toast.error(m)
            } else {
                const m = typeof detail === 'string' ? detail : 'Search failed.'
                setError(m); toast.error(m)
            }
        } finally {
            setLoading(false)
        }
    }

    const resultData = result?.data || {}
    const billing = result?.billing || {}

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Helmet><title>Search | Go-Biz</title></Helmet>

            <div>
                <h1 className="text-3xl font-bold gradient-text">Mobile Data Search</h1>
                <p className="text-muted-foreground mt-1">Lookup telecom & profile data by mobile number</p>
            </div>

            {/* Balance Banner */}
            {user && (
                <div className="flex items-center justify-between glass rounded-xl px-5 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Wallet Balance:</span>
                        <span className="font-bold text-lg text-primary">₹{user.credits?.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Est. cost: <span className="font-semibold text-foreground">₹{estimatedCost().toFixed(2)}</span>
                    </div>
                </div>
            )}

            {/* Field Selector */}
            <Card className="glass border-white/10">
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        Select Data Fields
                        <button onClick={toggleAll} className="flex items-center gap-1.5 text-sm font-normal text-primary hover:text-primary/80 transition-colors">
                            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {FIELD_OPTIONS.map(f => {
                            const selected = selectedFields.includes(f.key)
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => toggleField(f.key)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all",
                                        selected
                                            ? "border-primary bg-primary/15 text-primary"
                                            : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/20"
                                    )}
                                >
                                    <f.icon className="w-4 h-4" />
                                    <span>{f.label}</span>
                                    <span className="text-[10px] opacity-70">+₹{f.price.toFixed(0)}</span>
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Base fee: ₹{BASE_FEE} + selected fields (charged only for found data)
                    </p>
                </CardContent>
            </Card>

            {/* Search Form */}
            <form onSubmit={handleSubmit(onSearch)}>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Enter 10-digit mobile number..."
                            className="h-12 text-lg"
                            maxLength={10}
                            {...register('mobile', {
                                required: true,
                                pattern: /^[6-9]\d{9}$/
                            })}
                        />
                        {errors.mobile && (
                            <span className="text-destructive text-xs mt-1">Enter a valid 10-digit Indian mobile number</span>
                        )}
                    </div>
                    <Button type="submit" className="h-12 px-8 glow-primary" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                        {!loading && 'Search'}
                    </Button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive"
                >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                    {error.includes('credit') && (
                        <Button size="sm" variant="outline" className="ml-auto border-destructive/50" onClick={() => navigate('dashboard')}>
                            Add Credits
                        </Button>
                    )}
                </motion.div>
            )}

            {/* No Results */}
            <AnimatePresence>
                {noResults && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className="glass border-yellow-500/20">
                            <CardContent className="flex flex-col items-center gap-4 py-10">
                                <SearchX className="w-16 h-16 text-yellow-500 opacity-70" />
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">No Record Found</h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        This number is not in our database. Only the base fee was charged.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg">
                                    <IndianRupee className="w-4 h-4 text-yellow-500" />
                                    <span className="text-yellow-400">₹{BASE_FEE.toFixed(2)} base fee charged</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && result.data && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Billing Summary */}
                        <Card className="glass border-green-500/20">
                            <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2 text-sm">
                                    <IndianRupee className="w-4 h-4 text-green-500" />
                                    <span className="text-muted-foreground">Charged:</span>
                                    <span className="font-bold text-green-400">₹{billing.total_deducted?.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Remaining:</span>
                                    <span className="font-semibold">₹{result.wallet_remaining?.toFixed(2)}</span>
                                </div>
                                {billing.field_charges && Object.keys(billing.field_charges).length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(billing.field_charges).map(([field, cost]) => (
                                            <span key={field} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                {field}: ₹{String(cost)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Data Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedFields.map(key => {
                                const field = FIELD_OPTIONS.find(f => f.key === key)
                                const value = resultData[key]
                                if (!field || value === undefined || value === null || value === '') return null
                                return (
                                    <Card key={key} className="glass">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <field.icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">{field.label}</p>
                                                <p className="font-semibold text-sm truncate">{String(value)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SearchPage
