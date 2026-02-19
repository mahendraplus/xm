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

            // API v2.1: data is now an array []
            const responseData = res.data

            if (responseData.status === 'no_results' || !responseData.data || (Array.isArray(responseData.data) && responseData.data.length === 0)) {
                setNoResults(true)
                // Use optional chaining for billing
                const charged = responseData.billing?.total_deducted?.toFixed(2) || '1.00'
                toast.info('No record found for this mobile number', { description: `Charged: ₹${charged} (base fee only)` })
            } else {
                setResult(responseData)
                const charged = responseData.billing?.total_deducted?.toFixed(2) || '0.00'
                toast.success('Record found!', { description: `Charged: ₹${charged}` })
            }

            // Refresh balance
            if (user) {
                apiClient.get('/api/user/profile').then(r => setUser(r.data)).catch(() => { })
            }
        } catch (err: any) {
            console.error(err)
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

    // Helper to treat data as array
    const resultList = Array.isArray(result?.data) ? result?.data : (result?.data ? [result.data] : [])
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
            <Card className="glass border-border/50">
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
                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border"
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
            <form onSubmit={handleSubmit(onSearch)} className="relative z-10">
                <div className="flex gap-3 p-1 rounded-xl bg-card/30 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] hover:shadow-[0_0_20px_-3px_rgba(var(--primary),0.5)] transition-shadow duration-300">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Enter 10-digit mobile number..."
                            className="h-14 text-lg pr-28 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            maxLength={10}
                            {...register('mobile', {
                                required: true,
                                pattern: /^[6-9]\d{9}$/
                            })}
                        />
                        {errors.mobile && (
                            <span className="hidden">Enter a valid 10-digit Indian mobile number</span>
                        )}
                    </div>
                    <Button type="submit" className="h-14 px-8 glow-primary rounded-lg text-base" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                        {!loading && 'Search'}
                    </Button>
                </div>
                {errors.mobile && (
                    <p className="text-destructive text-sm mt-2 ml-1">Please enter a valid 10-digit Indian mobile number.</p>
                )}
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
                                <SearchX className="w-16 h-16 text-yellow-500" />
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-foreground">No Record Found</h3>
                                    <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                                        We could not find any data associated with this mobile number in our database.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg">
                                        <IndianRupee className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                                        <span className="text-yellow-700 dark:text-yellow-400 font-medium">₹{BASE_FEE.toFixed(2)} base fee charged</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm bg-muted/50 border border-border px-3 py-2 rounded-lg">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Time:</span>
                                        <span className="font-mono text-xs">{result?.response_time ? `${(result.response_time * 1000).toFixed(0)}ms` : 'N/A'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {resultList.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* Billing Summary */}
                        <Card className="glass border-green-500/20">
                            <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <IndianRupee className="w-4 h-4 text-green-500" />
                                        <span className="text-muted-foreground">Charged:</span>
                                        <span className="font-bold text-green-400">₹{billing.total_deducted?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Remaining:</span>
                                        <span className="font-semibold">₹{result.wallet_remaining?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Time:</span>
                                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{result.response_time ? `${(result.response_time * 1000).toFixed(0)}ms` : 'N/A'}</span>
                                    </div>
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

                        {/* Result Items - Perfect ListView */}
                        <div className="space-y-4">
                            {resultList.map((item: any, idx: number) => (
                                <Card key={`${item.id}-${idx}`} className="glass border-primary/20 overflow-hidden shadow-lg hover:shadow-primary/5 transition-shadow">
                                    <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">Result #{idx + 1}</span>
                                            {item.carrier && <span className="text-xs text-muted-foreground border border-border px-1.5 rounded">{item.carrier}</span>}
                                            {item.circle && <span className="text-xs text-muted-foreground border border-border px-1.5 rounded">{item.circle}</span>}
                                        </div>
                                        <span className="text-sm font-bold text-primary font-mono tracking-wide">{item.mobile}</span>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
                                            {selectedFields.map(key => {
                                                if (['carrier', 'circle'].includes(key)) return null // Shown in header
                                                const field = FIELD_OPTIONS.find(f => f.key === key)
                                                const value = item[key]
                                                if (!field || value === undefined || value === null || value === '') return null

                                                const isWide = ['address'].includes(key)

                                                return (
                                                    <div key={key} className={cn("bg-background/40 p-3 flex items-start gap-3 hover:bg-background/60 transition-colors", isWide && "md:col-span-2 lg:col-span-3")}>
                                                        <div className="bg-primary/10 p-1.5 rounded-md mt-0.5 shrink-0">
                                                            <field.icon className="w-3.5 h-3.5 text-primary" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">{field.label}</p>
                                                            <p className="text-sm font-medium break-words leading-snug">{String(value)}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    )
}

export default SearchPage
