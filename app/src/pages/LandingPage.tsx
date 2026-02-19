import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Database, Shield, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

// Stats Interface
interface Stats {
    total_users: number
    total_searches: number
    recent?: Array<{
        created_at: string
        mobile_mask: string
        result_count: number
        billing: { total_deducted: number }
    }>
}
interface Pricing { basic: number; address: number; full_kyc: number; deep: number }

const LandingPage = () => {
    const { navigate } = useAppStore()
    const [stats, setStats] = useState<Stats | null>(null)
    const [pricing, setPricing] = useState<Pricing | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pricingRes] = await Promise.all([
                    apiClient.get('/api/stats').catch(() => null), // Graceful fail
                    apiClient.get('/api/pricing').catch(() => null)
                ])

                if (statsRes) setStats(statsRes.data)
                if (pricingRes) setPricing(pricingRes.data)
            } catch (error) {
                console.error("Failed to fetch public data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    const features = [
        {
            icon: Search,
            title: "Deep Search",
            description: "Find details by mobile number with high accuracy."
        },
        {
            icon: Database,
            title: "Massive Database",
            description: "Access millions of records instantly."
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Your searches are private and secure."
        },
        {
            icon: Zap,
            title: "Real-time API",
            description: "Lightning fast responses for your applications."
        }
    ]

    return (
        <>
            <Helmet>
                <title>Go-Biz | Modern API Solutions</title>
                <meta name="description" content="Secure, fast, and reliable API for business intelligence." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
                </div>

                <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                    >
                        Data Intelligence <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Access comprehensive data with our powerful API.
                        Secure, scalable, and designed for modern businesses.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 glow-primary" onClick={() => navigate('auth')}>
                            Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                            View Pricing
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-white">{stats ? stats.total_users.toLocaleString() : '100+'}</h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider">Active Users</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-white">{stats ? stats.total_searches.toLocaleString() : '5k+'}</h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider">Total Searches</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-white">99.9%</h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider">Uptime</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-white">24/7</h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider">Support</p>
                    </div>
                </div>
            </section>

            {/* Features & Activity Section */}
            <section id="features" className="py-20 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Live Activity (30%) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary animate-pulse" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Live Search Activity</h2>
                        </div>
                        <div className="space-y-3">
                            {stats?.recent ? stats.recent.map((r, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-3 rounded-xl glass border-white/5 flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{r.mobile_mask}</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-400 font-bold">{r.result_count} Matches</p>
                                        <p className="text-[10px] text-muted-foreground">₹{r.billing.total_deducted.toFixed(0)} Charged</p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-8 text-center glass rounded-xl text-muted-foreground text-sm">
                                    Waiting for live activity...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Features (70%) */}
                    <div className="lg:col-span-8">
                        <div className="mb-8 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold">Built for Scale</h2>
                            <p className="text-muted-foreground text-lg italic">Enterprise-grade security meets lightning-fast data intelligence.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="h-full hover:bg-white/5 transition-all border-white/10 group cursor-default">
                                        <CardHeader>
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                                                <feature.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <CardTitle className="mt-4">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-black/20">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">Simple Pricing</h2>
                    <p className="text-muted-foreground">Pay only for what you verify.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {pricing ? (
                        Object.entries(pricing).map(([plan, cost], index) => (
                            <motion.div
                                key={plan}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={cn(
                                    "relative h-full border-white/10",
                                    plan === 'full_kyc' ? "border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]" : ""
                                )}>
                                    {plan === 'full_kyc' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                                            POPULAR
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="capitalize">{plan.replace('_', ' ')}</CardTitle>
                                        <div className="text-3xl font-bold mt-2">
                                            {cost} <span className="text-lg font-normal text-muted-foreground">Credits</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-4 text-sm text-muted-foreground">
                                            <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-primary" /> Instant Results</li>
                                            <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-primary" /> Secure Access</li>
                                        </ul>
                                        <Button className="w-full mt-8" variant={plan === 'full_kyc' ? 'default' : 'outline'} onClick={() => navigate('auth')}>
                                            Get {plan.replace('_', ' ')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-4 text-center text-muted-foreground">
                            Loading pricing...
                        </div>
                    )}
                </div>
            </section>
            {/* Footer */}
            <footer className="py-8 border-t border-white/5 bg-black/20 text-center">
                <p className="text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} Go-Biz. All rights reserved.
                </p>
                <p className="text-xs text-muted-foreground/50 mt-2 font-mono">
                    System Version v2.6 (Cache Bust) • Last Updated: {new Date().toLocaleString()}
                </p>
            </footer>
        </>
    )
}

export default LandingPage
