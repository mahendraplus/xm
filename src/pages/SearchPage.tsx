import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, AlertTriangle, CheckCircle, User, Phone, Home, Mail, Hash, MapPin, Calendar, Users, Wifi, CreditCard } from 'lucide-react'
import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

// Available fields with labels, icons and prices (defaults from API doc)
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

const FIELD_ICONS: Record<string, any> = {
    name: User, fname: Users, address: Home, email: Mail, alt: Phone,
    dob: Calendar, gender: User, carrier: Wifi, circle: MapPin, id: Hash,
}

interface SearchData {
    status: string
    data: Record<string, any>
    billing: {
        base_fee: number
        field_charges: Record<string, number>
        total_deducted: number
    }
    wallet_remaining: number
    response_time: number
}

const SearchPage = () => {
    const { user, setUser } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SearchData | null>(null)
    const [searchError, setSearchError] = useState<any>(null)
    const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'fname', 'address', 'email', 'alt', 'id'])

    const { register, handleSubmit, formState: { errors } } = useForm()

    const toggleField = (key: string) => {
        setSelectedFields(prev =>
            prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
        )
    }

    const selectAll = () => setSelectedFields(FIELD_OPTIONS.map(f => f.key))
    const clearAll = () => setSelectedFields(['name']) // name is minimum

    const estimatedCost = () => {
        return 1.0 + selectedFields.reduce((sum, key) => {
            const f = FIELD_OPTIONS.find(f => f.key === key)
            return sum + (f?.price ?? 0)
        }, 0)
    }

    const onSearch = async (data: any) => {
        setLoading(true)
        setResult(null)
        setSearchError(null)

        const requested_fields = selectedFields.length === FIELD_OPTIONS.length
            ? ['ALL']
            : selectedFields

        try {
            const res = await apiClient.post('/api/user/search', {
                mobile: data.mobile,
                requested_fields,
            })

            setResult(res.data)

            // Refresh balance
            if (user) {
                const profileRes = await apiClient.get('/api/user/profile')
                setUser(profileRes.data)
            }
        } catch (err: any) {
            console.error(err)
            if (err.response?.status === 402) {
                setSearchError({ type: 'insufficient_funds', detail: err.response?.data?.detail })
            } else {
                setSearchError({
                    type: 'general',
                    message: err.response?.data?.detail || 'Search failed. Please try again.'
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Helmet>
                <title>Search | Go-Biz</title>
            </Helmet>

            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Deep Search
                </h1>
                <p className="text-muted-foreground">
                    Select fields to retrieve. You only pay for data that's <strong className="text-white">actually found</strong>.
                </p>
            </div>

            <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                <CardContent className="pt-6 space-y-6">
                    {/* Mobile Input */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 w-full space-y-2">
                            <Input
                                placeholder="Enter 10-digit mobile number"
                                {...register('mobile', {
                                    required: true,
                                    pattern: /^[0-9]{10}$/
                                })}
                                className="h-12 text-lg"
                            />
                            {errors.mobile && <span className="text-red-400 text-sm">Please enter a valid 10-digit number</span>}
                        </div>
                        <Button size="lg" className="h-12" onClick={handleSubmit(onSearch)} disabled={loading || selectedFields.length === 0}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
                            Search
                        </Button>
                    </div>

                    {/* Field Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Select Fields to Retrieve</p>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={selectAll}>All</Button>
                                <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {FIELD_OPTIONS.map(({ key, label, price, icon: Icon }) => {
                                const active = selectedFields.includes(key)
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleField(key)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all cursor-pointer ${active
                                                ? 'border-primary bg-primary/10 text-white'
                                                : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/30'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="font-medium">{label}</span>
                                        <span className="text-[10px] opacity-70">₹{price}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Estimated Cost */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="w-4 h-4" />
                            Estimated cost (if all fields found)
                        </div>
                        <span className="font-bold text-white">₹{estimatedCost().toFixed(1)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            <AnimatePresence>
                {searchError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {searchError.type === 'insufficient_funds' ? (
                            <Card className="border-red-500/50 bg-red-500/10">
                                <CardContent className="flex items-center p-6 text-red-200">
                                    <AlertTriangle className="w-10 h-10 mr-4 text-red-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Insufficient Credits</h4>
                                        <p>You have ₹{searchError.detail?.current} but this search needs ~₹{searchError.detail?.estimated_cost}.</p>
                                        <p className="text-xs mt-1 opacity-70">Add credits via Dashboard → Add Credits.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-red-500/50 bg-red-500/10">
                                <CardContent className="p-6 text-red-200">{searchError.message}</CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-primary/30 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center text-primary">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Result Found  •  {result.response_time?.toFixed(3)}s
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Data Fields */}
                                <div className="grid gap-3 md:grid-cols-2">
                                    {Object.entries(result.data).filter(([, v]) => v !== null).map(([key, value]) => {
                                        const Icon = FIELD_ICONS[key] || Hash
                                        const label = FIELD_OPTIONS.find(f => f.key === key)?.label || key
                                        return (
                                            <div key={key} className={`flex items-center space-x-4 p-4 rounded-lg bg-black/20 ${key === 'address' ? 'md:col-span-2' : ''}`}>
                                                <div className="bg-primary/20 p-3 rounded-full shrink-0">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                                                    <p className="font-bold break-words">{String(value)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Billing Breakdown */}
                                <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-2">
                                    <p className="text-sm font-semibold text-muted-foreground">💳 Billing Breakdown</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Base fee</span>
                                        <span>₹{result.billing?.base_fee}</span>
                                    </div>
                                    {Object.entries(result.billing?.field_charges || {}).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground capitalize">{k}</span>
                                            <span>₹{v}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                                        <span>Total Deducted</span>
                                        <span className="text-red-400">-₹{result.billing?.total_deducted}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Wallet remaining</span>
                                        <span className="text-green-400">₹{result.wallet_remaining}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SearchPage
