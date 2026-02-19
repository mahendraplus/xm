import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import apiClient from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Send, Loader2, MessageCircle, RefreshCw, HelpCircle, User, Shield } from 'lucide-react'

interface ChatMessage {
    id: string
    sender: 'user' | 'admin'
    text: string
    created_at: string
    read: boolean
}

const ChatPage = () => {
    const { user, token } = useAuthStore()
    const { navigate } = useAppStore()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [text, setText] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchMessages = async (showLoader = false) => {
        if (showLoader) setLoading(true)
        try {
            const res = await apiClient.get('/api/chat/history')
            const data = Array.isArray(res.data) ? res.data : (res.data.messages || res.data.history || [])
            setMessages(data)
        } catch (err: any) {
            if (showLoader) {
                console.error('Failed to load chat history', err)
            }
        } finally {
            if (showLoader) setLoading(false)
        }
    }

    useEffect(() => {
        if (!token) { navigate('auth'); return }
        fetchMessages(true)

        // Auto-refresh every 10s
        intervalRef.current = setInterval(() => fetchMessages(false), 10000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [token])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) return
        setSending(true)
        try {
            await apiClient.post('/api/chat/send', { text: text.trim() })
            setText('')
            toast.success('Message sent!')
            // Immediately refresh
            await fetchMessages(false)
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to send message')
        } finally {
            setSending(false)
        }
    }

    if (!user) return null

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
            <Helmet><title>Help Desk | Go-Biz</title></Helmet>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                        <MessageCircle className="w-6 h-6" /> Help Desk
                    </h1>
                    <p className="text-muted-foreground text-sm">Chat with our support team</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => fetchMessages(true)}>
                    <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} /> Refresh
                </Button>
            </div>

            {/* Chat Messages Area */}
            <Card className="glass flex-1 overflow-hidden flex flex-col border-border/50">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                            <HelpCircle className="w-16 h-16 opacity-30" />
                            <div className="text-center">
                                <p className="font-medium text-foreground">No messages yet</p>
                                <p className="text-sm mt-1">Send a message to start a conversation with our support team.</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-2",
                                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {msg.sender === 'admin' && (
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Shield className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                                        msg.sender === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-muted text-foreground rounded-bl-md'
                                    )}>
                                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                        <p className={cn(
                                            "text-[10px] mt-1",
                                            msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                        )}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-border/50 p-3">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                            disabled={sending}
                            autoFocus
                        />
                        <Button type="submit" disabled={sending || !text.trim()} className="glow-primary px-4">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </form>
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                        Messages auto-refresh every 10 seconds • Our team typically responds within minutes
                    </p>
                </div>
            </Card>
        </div>
    )
}

export default ChatPage
