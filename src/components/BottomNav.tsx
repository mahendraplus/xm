import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, MessageCircle, User, History, Menu, X, LogOut, BookOpen, BarChart3, CreditCard } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import type { Page } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { toast } from 'sonner'

const BottomNav = () => {
    const { currentPage, navigate } = useAppStore()
    const { user, logout } = useAuthStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    if (!user) return null

    const navItems = [
        { id: 'overview', icon: Home, label: 'Home' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'menu', icon: Menu, label: 'Menu', isCenter: true },
        { id: 'history', icon: History, label: 'History' },
        { id: 'profile', icon: User, label: 'Profile' },
    ]

    const handleLogout = () => {
        logout()
        navigate('home')
        toast.success('Logged out')
        setIsMenuOpen(false)
    }

    const menuItems = [
        { id: 'overview', icon: BarChart3, label: 'Overview', color: 'text-blue-400' },
        { id: 'recharge', icon: CreditCard, label: 'Recharge', color: 'text-green-400' },
        { id: 'search', icon: Search, label: 'Validate Query', color: 'text-orange-400' },
        { id: 'history', icon: History, label: 'Usage History', color: 'text-cyan-400' },
        { id: 'chat', icon: MessageCircle, label: 'Support Chat', color: 'text-pink-400' },
        { id: 'api-docs', icon: BookOpen, label: 'API & Docs', color: 'text-purple-400' },
    ]

    return (
        <>
            {/* Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = currentPage === item.id

                        if (item.isCenter) {
                            return (
                                <div key={item.id} className="relative -top-5">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className={cn(
                                            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                                            isMenuOpen ? "bg-red-500 rotate-0" : "bg-primary glow-primary"
                                        )}
                                    >
                                        {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Icon className="w-6 h-6 text-white" />}
                                    </button>
                                </div>
                            )
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => { navigate(item.id as Page); setIsMenuOpen(false) }}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-12 h-12 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavDot"
                                        className="w-1 h-1 rounded-full bg-primary"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Central Drawer / Side View Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-xs md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[90] glass border-t border-border/50 md:hidden p-6 pb-12 rounded-t-[2.5rem] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]"
                        >
                            <div className="w-12 h-1.5 bg-border/50 rounded-full mx-auto mb-8" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground">{user.name || 'User'}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        className={cn(
                                            "justify-start h-12 gap-3 text-sm rounded-xl",
                                            currentPage === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground"
                                        )}
                                        onClick={() => { navigate(item.id as Page); setIsMenuOpen(false) }}
                                    >
                                        <item.icon className={cn("w-5 h-5", item.color)} />
                                        {item.label}
                                    </Button>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-border/50">
                                <Button
                                    variant="destructive"
                                    className="w-full h-12 gap-3 rounded-xl"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-5 h-5" /> Logout
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default BottomNav
