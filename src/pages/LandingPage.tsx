import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Database, Shield, Zap, Loader2, ShieldCheck, Timer, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

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

const LandingPage = () => {
    const { navigate } = useAppStore()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await apiClient.get('/api/stats').catch(() => null)
                if (statsRes) setStats(statsRes.data)
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
            icon: Zap,
            title: "API Uptime",
            description: "99.9% uptime guaranteed with auto-failover and redundant infrastructure."
        },
        {
            icon: Shield,
            title: "Secure Routing",
            description: "End-to-end encrypted API requests with TLS 1.3 and IP whitelisting."
        },
        {
            icon: CheckCircle,
            title: "Syntax Checking",
            description: "Validate input formats, data types, and schema compliance in real-time."
        },
        {
            icon: Database,
            title: "Developer Tools",
            description: "SDKs, interactive docs, and sandbox environments for rapid integration."
        }
    ]

    return (
        <>
            <Helmet>
                <title>Go-Biz | Modern API Solutions</title>
                <meta name="description" content="Secure, fast, and reliable API for business intelligence." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[140px]"
                    />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                </div>

                <div className="relative z-10 text-center space-y-10 max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <Zap className="w-3 h-3 fill-current" /> Next-Gen API Infrastructure
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
                    >
                        Precision Data <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent italic">
                            Redefined.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    >
                        Empower your enterprise with lightning-fast validation,
                        automated schema checking, and ultra-secure network routing.
                        The developer's choice for scalable data integrity.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-6"
                    >
                        <Button size="lg" className="group relative overflow-hidden text-lg h-14 px-10 rounded-2xl glow-primary" onClick={() => navigate('auth', { mode: 'register' })}>
                            <span className="relative z-10 flex items-center gap-2">
                                Register <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-white/10"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl border-white/10 hover:bg-white/5 backdrop-blur-sm" onClick={() => {
                            const el = document.getElementById('features')
                            el?.scrollIntoView({ behavior: 'smooth' })
                        }}>
                            Explore Features
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 relative overflow-hidden bg-primary/5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { label: 'Network Uptime', value: '99.99%', icon: ShieldCheck, color: 'text-green-400' },
                            { label: 'Global Latency', value: '< 45ms', icon: Timer, color: 'text-blue-400' },
                            { label: 'Daily Queries', value: stats ? stats.total_searches.toLocaleString() : '50k+', icon: Globe, color: 'text-purple-400' },
                            { label: 'Active Keys', value: stats ? stats.total_users.toLocaleString() : '1k+', icon: Lock, color: 'text-indigo-400' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="p-6 md:p-8 rounded-3xl glass-modern border-white/5 text-center group hover:border-primary/30 transition-all duration-500"
                            >
                                <stat.icon className={cn("w-6 h-6 md:w-8 md:h-8 mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity", stat.color)} />
                                <div className="text-2xl md:text-3xl font-black mb-1 group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features & Activity Section */}
            <section id="features" className="py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Live Activity (40%) */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                    Live Nodes
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Real-time <br />Verification</h2>
                            </div>

                            <div className="space-y-4 relative">
                                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-transparent to-transparent" />
                                {stats?.recent ? stats.recent.map((r, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="relative pl-12"
                                    >
                                        <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary border-4 border-background" />
                                        <div className="p-4 rounded-2xl glass-modern border-white/5 flex items-center justify-between group hover:border-primary/20 transition-colors">
                                            <div className="space-y-1">
                                                <p className="font-mono text-sm font-bold text-primary">{r.mobile_mask}</p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Timer className="w-3 h-3" /> {new Date(r.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-flex px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold">
                                                    Verified
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="p-12 text-center glass-modern rounded-3xl text-muted-foreground text-sm border-dashed border-white/10">
                                        Synchronizing global nodes...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features (60%) */}
                        <div className="lg:col-span-8 space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">Designed for <br /><span className="text-primary italic">High-Throughput.</span></h2>
                                <p className="text-xl text-muted-foreground max-w-xl">
                                    Our core infrastructure is optimized for sub-millisecond
                                    validation speeds across a distributed mesh network.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-8 rounded-[2rem] glass-modern border-white/5 hover:border-primary/20 group transition-all"
                                    >
                                        <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                            <feature.icon className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed italic">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LandingPage
