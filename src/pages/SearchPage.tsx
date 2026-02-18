import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, AlertTriangle, CheckCircle, User, Phone } from 'lucide-react'
import apiClient from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
    mobile: string
    name: string
    [key: string]: any
}

const SearchPage = () => {
    const { user, setUser } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([])
    const [searchError, setSearchError] = useState<any>(null)

    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSearch = async (data: any) => {
        setLoading(true)
        setResults([])
        setSearchError(null)

        try {
            const res = await apiClient.post('/api/user/search', {
                mobile: data.mobile,
                type: 'mobile_to_name'
            })

            setResults(res.data.results)

            // Update credits locally if possible, or fetch profile
            if (user) {
                // Optimistic update or fetch new profile
                const profileRes = await apiClient.get('/api/user/profile')
                setUser(profileRes.data)
            }

        } catch (err: any) {
            console.error(err)
            if (err.response?.status === 402 || err.response?.data?.detail?.error === 'Insufficient credits') {
                setSearchError({
                    type: 'insufficient_funds',
                    detail: err.response?.data?.detail
                })
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

            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Deep Search
                </h1>
                <p className="text-muted-foreground">
                    Enter a mobile number to retrieve identity details.
                </p>
            </div>

            <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSearch)} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter 10-digit mobile number"
                                {...register('mobile', {
                                    required: true,
                                    pattern: /^[0-9]{10}$/
                                })}
                                className="h-12 text-lg"
                            />
                            {errors.mobile && <span className="text-red-400 text-sm mt-1">Please enter a valid 10-digit number</span>}
                        </div>
                        <Button size="lg" className="h-12" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
                            Search
                        </Button>
                    </form>
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
                                    <AlertTriangle className="w-10 h-10 mr-4 text-red-500" />
                                    <div>
                                        <h4 className="font-bold text-lg">Insufficient Credits</h4>
                                        <p>You have {searchError.detail.current} credits, but this search costs {searchError.detail.needed}.</p>
                                        <Button variant="destructive" size="sm" className="mt-2">Add Credits</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-red-500/50 bg-red-500/10">
                                <CardContent className="p-6 text-red-200">
                                    {searchError.message}
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <div className="grid gap-4">
                <AnimatePresence>
                    {results.map((result, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-primary">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Result Found
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-black/20">
                                        <div className="bg-primary/20 p-3 rounded-full">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Name</p>
                                            <p className="text-lg font-bold">{result.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-black/20">
                                        <div className="bg-primary/20 p-3 rounded-full">
                                            <Phone className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Mobile</p>
                                            <p className="text-lg font-bold">{result.mobile}</p>
                                        </div>
                                    </div>

                                    {/* Fallback for other fields */}
                                    {Object.entries(result).filter(([k]) => k !== 'name' && k !== 'mobile').map(([key, value]) => (
                                        <div key={key} className="p-4 rounded-lg bg-black/20">
                                            <p className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                                            <p className="text-md font-medium">{String(value)}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default SearchPage
