import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    Copy, Play, ChevronDown, ChevronUp, Terminal, Globe,
    Lock, Shield, CreditCard, Search, User, Settings, BookOpen, Loader2
} from 'lucide-react'

const BASE_URL = 'https://mahendraplus-api-db-in.hf.space'

interface Endpoint {
    method: 'GET' | 'POST'
    path: string
    label: string
    description: string
    auth: 'none' | 'user' | 'admin'
    body?: string
}

const SECTIONS: { title: string; icon: typeof Globe; endpoints: Endpoint[] }[] = [
    {
        title: 'Public',
        icon: Globe,
        endpoints: [
            {
                method: 'GET', path: '/api/stats', label: 'Public Stats',
                description: 'Get total users, searches, and recent search activity.',
                auth: 'none'
            },
            {
                method: 'GET', path: '/api/pricing', label: 'Pricing Table',
                description: 'Get the current pricing model for search tiers.',
                auth: 'none'
            },
        ]
    },
    {
        title: 'Authentication',
        icon: Lock,
        endpoints: [
            {
                method: 'POST', path: '/api/auth/register', label: 'Register',
                description: 'Create a new user account.',
                auth: 'none',
                body: JSON.stringify({ name: "John Doe", email: "john@example.com", password: "secret123" }, null, 2)
            },
            {
                method: 'POST', path: '/api/auth/login', label: 'Login',
                description: 'Authenticate and receive a JWT token.',
                auth: 'none',
                body: JSON.stringify({ email: "john@example.com", password: "secret123" }, null, 2)
            },
        ]
    },
    {
        title: 'User Endpoints',
        icon: User,
        endpoints: [
            {
                method: 'GET', path: '/api/user/profile', label: 'Get Profile',
                description: 'Get the authenticated user\'s profile, credits, and search count.',
                auth: 'user'
            },
            {
                method: 'POST', path: '/api/user/search', label: 'Search by Mobile',
                description: 'Search for data by mobile number. Returns matched fields and billing info.',
                auth: 'user',
                body: JSON.stringify({ mobile: "9876543210", requested_fields: ["ALL"] }, null, 2)
            },
            {
                method: 'GET', path: '/api/user/history', label: 'Search History',
                description: 'Get the user\'s search history with billing details.',
                auth: 'user'
            },
            {
                method: 'POST', path: '/api/user/generate-key', label: 'Generate API Key',
                description: 'Generate or regenerate a personal API key.',
                auth: 'user'
            },
            {
                method: 'POST', path: '/api/user/add-credits', label: 'Add Credits (Manual)',
                description: 'Submit a payment request with UTR for admin verification.',
                auth: 'user',
                body: JSON.stringify({ amount: 1000, utr_number: "UTR123456789" }, null, 2)
            },
        ]
    },
    {
        title: 'Payments',
        icon: CreditCard,
        endpoints: [
            {
                method: 'POST', path: '/api/payments/create-order', label: 'Create Razorpay Order',
                description: 'Create a Razorpay payment order for instant recharge.',
                auth: 'user',
                body: JSON.stringify({ amount: 500 }, null, 2)
            },
            {
                method: 'POST', path: '/api/payments/verify', label: 'Verify Payment',
                description: 'Verify a completed Razorpay payment.',
                auth: 'user',
                body: JSON.stringify({ razorpay_order_id: "order_xxx", razorpay_payment_id: "pay_xxx", razorpay_signature: "sig_xxx" }, null, 2)
            },
            {
                method: 'GET', path: '/api/payments/history', label: 'Payment History',
                description: 'Get payment and deposit history.',
                auth: 'user'
            },
        ]
    },
    {
        title: 'Chat / Help Desk',
        icon: Search,
        endpoints: [
            {
                method: 'POST', path: '/api/chat/send', label: 'Send Message',
                description: 'Send a message to the support help desk.',
                auth: 'user',
                body: JSON.stringify({ text: "Hello, I need help." }, null, 2)
            },
            {
                method: 'GET', path: '/api/chat/history', label: 'Chat History',
                description: 'Get your chat message history.',
                auth: 'user'
            },
        ]
    },
    {
        title: 'Admin',
        icon: Shield,
        endpoints: [
            {
                method: 'GET', path: '/api/admin/stats', label: 'System Health',
                description: 'Get system stats including CPU, memory, disk, and platform info.',
                auth: 'admin'
            },
            {
                method: 'GET', path: '/api/admin/settings', label: 'Get Settings',
                description: 'Get current system configuration and settings.',
                auth: 'admin'
            },
            {
                method: 'GET', path: '/api/admin/config/prices', label: 'Price Config',
                description: 'Get the per-field pricing model configuration.',
                auth: 'admin'
            },
            {
                method: 'GET', path: '/api/admin/logs/requests', label: 'Request Logs',
                description: 'Get recent API request/network logs.',
                auth: 'admin'
            },
            {
                method: 'GET', path: '/api/admin/logs/system', label: 'System Info',
                description: 'Get system info (neofetch-style) and container environment.',
                auth: 'admin'
            },
        ]
    },
]

const buildCurl = (ep: Endpoint) => {
    const headers = ep.method === 'POST'
        ? `-H 'Content-Type: application/json'`
        : ''
    const authHeader = ep.auth !== 'none'
        ? ` \\\n  -H 'Authorization: Bearer YOUR_TOKEN'`
        : ''
    const bodyPart = ep.body
        ? ` \\\n  -d '${ep.body.replace(/\n/g, '')}'`
        : ''
    return `curl -X ${ep.method} '${BASE_URL}${ep.path}'${authHeader}${headers ? ` \\\n  ${headers}` : ''}${bodyPart}`
}

const MethodBadge = ({ method }: { method: string }) => (
    <span className={cn(
        "font-mono text-xs font-bold px-2 py-0.5 rounded",
        method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
    )}>
        {method}
    </span>
)

const AuthBadge = ({ auth }: { auth: string }) => {
    if (auth === 'none') return <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full font-medium">Public</span>
    if (auth === 'admin') return <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full font-medium">Admin</span>
    return <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full font-medium">Auth Required</span>
}

const EndpointCard = ({ ep }: { ep: Endpoint }) => {
    const [expanded, setExpanded] = useState(false)
    const [response, setResponse] = useState<string | null>(null)
    const [testing, setTesting] = useState(false)

    const curl = buildCurl(ep)

    const handleTest = async () => {
        setTesting(true)
        setResponse(null)
        try {
            const startTime = Date.now()
            const opts: RequestInit = {
                method: ep.method,
                headers: { 'Content-Type': 'application/json' },
            }
            if (ep.body && ep.method === 'POST') {
                opts.body = ep.body
            }
            const res = await fetch(`${BASE_URL}${ep.path}`, opts)
            const json = await res.json()
            const elapsed = Date.now() - startTime
            setResponse(`// ${res.status} ${res.statusText} (${elapsed}ms)\n${JSON.stringify(json, null, 2)}`)
            toast.success(`${ep.label}: ${res.status}`)
        } catch (err: any) {
            setResponse(`// Error\n${err.message}`)
            toast.error(`Test failed: ${err.message}`)
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30 hover:bg-card/50 transition-colors">
            {/* Header */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
                <MethodBadge method={ep.method} />
                <code className="text-sm font-mono text-primary flex-1 truncate">{ep.path}</code>
                <AuthBadge auth={ep.auth} />
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                            <p className="text-sm text-muted-foreground">{ep.description}</p>

                            {/* cURL */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Terminal className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-medium text-muted-foreground">cURL</span>
                                </div>
                                <pre className="text-xs text-green-300 bg-black/40 border border-border/50 rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                                    {curl}
                                </pre>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(curl); toast.success('Copied!') }}
                                    className="absolute top-8 right-2 p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy cURL"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Request Body */}
                            {ep.body && (
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground mb-1 block">Request Body</span>
                                    <pre className="text-xs text-yellow-300 bg-black/30 border border-border/50 rounded-lg p-3 overflow-x-auto font-mono">
                                        {ep.body}
                                    </pre>
                                </div>
                            )}

                            {/* Test Button */}
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleTest}
                                disabled={testing}
                                className="w-full"
                            >
                                {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                                {testing ? 'Testing...' : 'Test Endpoint'}
                            </Button>

                            {/* Response */}
                            {response && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <span className="text-xs font-medium text-muted-foreground mb-1 block">Response</span>
                                    <pre className="text-xs text-green-300 bg-black/50 border border-border/50 rounded-lg p-3 overflow-x-auto max-h-64 font-mono whitespace-pre-wrap">
                                        {response}
                                    </pre>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const ApiDocsPage = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Helmet><title>API Documentation | Go-Biz</title></Helmet>

            <div>
                <h1 className="text-3xl font-bold gradient-text">API Documentation</h1>
                <p className="text-muted-foreground mt-1">
                    Complete reference for the Go-Biz API. Click any endpoint to see its cURL example and test it live.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Base URL: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{BASE_URL}</code>
                </p>
            </div>

            {/* Auth Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl glass border-primary/20 border bg-primary/5 text-sm">
                <Settings className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-foreground">Authentication</p>
                    <p className="text-muted-foreground mt-0.5">
                        Endpoints marked <span className="text-yellow-400 font-medium">Auth Required</span> need a JWT token.
                        Pass it as: <code className="text-primary text-xs">Authorization: Bearer YOUR_TOKEN</code>
                    </p>
                </div>
            </div>

            {SECTIONS.map(section => (
                <Card key={section.title} className="glass border-border/50 overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <section.icon className="w-5 h-5 text-primary" />
                            {section.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        {section.endpoints.map(ep => (
                            <EndpointCard key={ep.path + ep.method} ep={ep} />
                        ))}
                    </CardContent>
                </Card>
            ))}

            <div className="text-center text-[10px] text-muted-foreground/30 mt-8">
                API Documentation v2.6 • <BookOpen className="w-3 h-3 inline" /> Generated from api_doc.txt
            </div>
        </div>
    )
}

export default ApiDocsPage
