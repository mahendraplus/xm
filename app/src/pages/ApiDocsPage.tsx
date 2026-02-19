import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Key, Shield, Database, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ApiDocsPage = () => {
    const { user } = useAuthStore()
    const apiKey = user?.api_key || 'YOUR_API_KEY'

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    const endpoints = {
        search: {
            title: 'Search Mobile Data',
            method: 'POST',
            url: '/api/user/search',
            desc: 'Search for telecom and profile data by mobile number.',
            cmd: `curl -X POST 'https://mahendraplus-api-db-in.hf.space/api/user/search' \\
  -H 'Authorization: Bearer ${apiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "mobile": "9876543210",
    "requested_fields": ["name", "address", "email"]
  }'`
        },
        profile: {
            title: 'Get User Profile',
            method: 'GET',
            url: '/api/user/profile',
            desc: 'Retrieve your account details, wallet balance, and usage stats.',
            cmd: `curl -X GET 'https://mahendraplus-api-db-in.hf.space/api/user/profile' \\
  -H 'Authorization: Bearer ${apiKey}'`
        },
        history: {
            title: 'Search History',
            method: 'GET',
            url: '/api/user/history',
            desc: 'Get a list of your past searches.',
            cmd: `curl -X GET 'https://mahendraplus-api-db-in.hf.space/api/user/history' \\
  -H 'Authorization: Bearer ${apiKey}'`
        },
        payments: {
            title: 'Payment History',
            method: 'GET',
            url: '/api/payments/history',
            desc: 'Get a list of all your payment transactions.',
            cmd: `curl -X GET 'https://mahendraplus-api-db-in.hf.space/api/payments/history' \\
  -H 'Authorization: Bearer ${apiKey}'`
        },
        generate_key: {
            title: 'Rotate API Key',
            method: 'POST',
            url: '/api/user/generate-key',
            desc: 'Generate a new API key. Old key will remain valid for a grace period (if configured) or invalidate immediately.',
            cmd: `curl -X POST 'https://mahendraplus-api-db-in.hf.space/api/user/generate-key' \\
  -H 'Authorization: Bearer ${apiKey}'`
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <Helmet><title>API Documentation | Go-Biz</title></Helmet>

            <div className="text-center space-y-4 pt-8">
                <h1 className="text-4xl font-bold gradient-text">API Reference</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Seamlessly integrate Go-Biz data into your applications.
                    All endpoints require an API Key passed in the <code className="text-primary">Authorization</code> header.
                </p>
            </div>

            <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 glass h-auto p-1">
                    <TabsTrigger value="search" className="gap-2 py-3"><SearchIcon className="w-4 h-4" /> Search</TabsTrigger>
                    <TabsTrigger value="profile" className="gap-2 py-3"><UserIcon className="w-4 h-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 py-3"><HistoryIcon className="w-4 h-4" /> History</TabsTrigger>
                    <TabsTrigger value="payments" className="gap-2 py-3"><CreditCardIcon className="w-4 h-4" /> Payments</TabsTrigger>
                    <TabsTrigger value="generate_key" className="gap-2 py-3"><Key className="w-4 h-4" /> Auth</TabsTrigger>
                </TabsList>

                {Object.entries(endpoints).map(([key, data]) => (
                    <TabsContent key={key} value={key}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="glass border-primary/20">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-2xl flex items-center gap-3">
                                                {data.title}
                                                <span className={`text-xs px-2 py-1 rounded-md font-mono ${data.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {data.method}
                                                </span>
                                            </CardTitle>
                                            <CardDescription className="mt-2 text-base">
                                                {data.desc}
                                            </CardDescription>
                                        </div>
                                        <div className="font-mono text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-muted-foreground">
                                            {data.url}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="secondary" onClick={() => copyToClipboard(data.cmd)}>
                                                <Copy className="w-4 h-4 mr-2" /> Copy
                                            </Button>
                                        </div>
                                        <pre className="bg-black/80 text-green-400 p-6 rounded-xl overflow-x-auto font-mono text-sm border border-white/10 shadow-inner">
                                            {data.cmd}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                ))}
            </Tabs>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Shield className="w-5 h-5 text-primary" /> Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Use <code>Authorization: Bearer YOUR_API_KEY</code>. You can generate and revoke keys from your dashboard.
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Database className="w-5 h-5 text-purple-500" /> Rate Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Standard accounts are limited to 60 requests/minute. Enterprise plans offer higher limits.
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><LayoutDashboard className="w-5 h-5 text-green-500" /> Errors</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Standard HTTP codes: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 402 (Payment Required), 404 (Not Found).
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Icons for tabs
import { Search as SearchIcon, User as UserIcon, History as HistoryIcon, CreditCard as CreditCardIcon } from 'lucide-react'

export default ApiDocsPage
