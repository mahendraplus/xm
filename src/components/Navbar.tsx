import { useAuthStore } from '@/store/authStore'
import { useAppStore, ACCENT_COLORS } from '@/store/appStore'
import type { Page, Theme, AccentColor } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, LogOut, Sun, Moon, Monitor, BookOpen, MessageCircle, Palette, BarChart3, CreditCard, Search, History } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ThemeIcon = ({ theme }: { theme: Theme }) => {
    if (theme === 'light') return <Sun className="w-4 h-4" />
    if (theme === 'dark') return <Moon className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
}

const Navbar = () => {
    const { user, logout } = useAuthStore()
    const { currentPage, navigate, theme, setTheme, accentColor, setAccentColor } = useAppStore()
    const [isScrolled, setIsScrolled] = useState(false)
    const [showThemeMenu, setShowThemeMenu] = useState(false)
    const [showColorMenu, setShowColorMenu] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // useEffect(() => setIsOpen(false), [currentPage]) // Removed to follow react-hooks/set-state-in-effect

    const handleLogout = () => {
        logout()
        navTo('home')
        toast.success('Logged out successfully')
    }

    const themes: Theme[] = ['dark', 'light', 'system']
    const accentColors: AccentColor[] = ['blue', 'purple', 'green', 'orange', 'rose', 'cyan']

    const navTo = (page: Page) => { navigate(page) }

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                    isScrolled ? "glass border-border/50 shadow-lg py-3" : "bg-transparent border-transparent py-5"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <button onClick={() => navTo(user ? 'search' : 'home')} className="flex items-center space-x-2 group">
                            <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors pulse-ring">
                                <Rocket className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Go-Biz</span>
                        </button>

                        {/* User Info Summary (Desktop) */}
                        {user && (
                            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full glass border-primary/20 bg-primary/5 mr-auto ml-8 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate('profile')}>
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
                                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground mr-1">
                                    <span className="text-foreground">{user.name || user.email.split('@')[0]}</span> ·
                                    <span className="text-primary ml-1">₹{user.credits?.toFixed(2)}</span>
                                </span>
                            </div>
                        )}

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-1">
                            {/* Accent Color Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowColorMenu(v => !v); setShowThemeMenu(false) }}
                                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title="Accent color"
                                >
                                    <Palette className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                    {showColorMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                            className="absolute right-0 mt-2 w-44 glass rounded-lg shadow-lg p-2 z-50 border border-border/50"
                                        >
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5 px-1">Accent Color</p>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {accentColors.map(c => {
                                                    const { hue, sat, light } = ACCENT_COLORS[c]
                                                    return (
                                                        <button
                                                            key={c}
                                                            onClick={() => { setAccentColor(c); setShowColorMenu(false); toast(`Accent: ${c}`) }}
                                                            className={cn(
                                                                "flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] capitalize transition-all",
                                                                accentColor === c ? "bg-primary/15 ring-1 ring-primary/50" : "hover:bg-muted"
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "w-5 h-5 rounded-full transition-transform hover:scale-110",
                                                                    accentColor === c && "ring-2 ring-offset-1 ring-offset-background"
                                                                )}
                                                                style={{
                                                                    background: `hsl(${hue}, ${sat}%, ${light}%)`,
                                                                    ...(accentColor === c ? { outlineColor: `hsl(${hue}, ${sat}%, ${light}%)` } : {}),
                                                                }}
                                                            />
                                                            {c}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Theme Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowThemeMenu(v => !v); setShowColorMenu(false) }}
                                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title="Toggle theme"
                                >
                                    <ThemeIcon theme={theme} />
                                </button>
                                <AnimatePresence>
                                    {showThemeMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                            className="absolute right-0 mt-2 w-32 glass rounded-lg shadow-lg p-1 z-50 border border-border/50"
                                        >
                                            {themes.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setTheme(t); setShowThemeMenu(false); toast(`Theme: ${t}`) }}
                                                    className={cn(
                                                        "flex items-center gap-2 w-full px-3 py-2 rounded text-sm capitalize",
                                                        theme === t ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <ThemeIcon theme={t} /> {t}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {user ? (
                                <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm" onClick={() => navigate('overview')} className={cn(currentPage === 'overview' && "bg-primary/15 text-primary")}>
                                        <BarChart3 className="w-4 h-4 mr-1.5 text-blue-400" /> Overview
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => navigate('recharge')} className={cn(currentPage === 'recharge' && "bg-primary/15 text-primary")}>
                                        <CreditCard className="w-4 h-4 mr-1.5 text-green-400" /> Recharge
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => navTo('api-docs')}>
                                        <BookOpen className="w-4 h-4 mr-1.5 text-purple-400" /> API & Docs
                                    </Button>
                                    <div className="w-px h-4 bg-border/50 mx-2" />
                                    <Button variant="ghost" size="sm" onClick={() => navTo('search')}>
                                        <Search className="w-4 h-4 mr-1.5 text-orange-400" /> Validate
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => navTo('history')}>
                                        <History className="w-4 h-4 mr-1.5 text-cyan-400" /> History
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => navTo('chat')} className={cn(currentPage === 'chat' && "bg-primary/15 text-primary")}>
                                        <MessageCircle className="w-4 h-4 mr-1.5 text-pink-400" /> Chat
                                    </Button>
                                    <div className="w-px h-6 bg-border/50 mx-2" />
                                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-1" /> Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => navTo('auth')}>Log In</Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-1">
                            <button
                                onClick={() => { const t: Theme[] = ['dark', 'light', 'system']; const idx = t.indexOf(theme); setTheme(t[(idx + 1) % 3]) }}
                                className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                            >
                                <ThemeIcon theme={theme} />
                            </button>
                            <button
                                onClick={() => { const cols: AccentColor[] = ['blue', 'purple', 'green', 'orange', 'rose', 'cyan']; const idx = cols.indexOf(accentColor); setAccentColor(cols[(idx + 1) % cols.length]) }}
                                className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                            >
                                <Palette className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </nav>

            {/* Mobile Bottom Auth Buttons (Unauthenticated Only) */}
            {!user && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-6 bg-background/95 backdrop-blur-md border-t border-border/50 z-[100] flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    {currentPage === 'auth' ? (
                        <Button className="w-full rounded-xl h-12 font-bold bg-muted text-foreground hover:bg-muted/80 transition-all border border-border flex items-center justify-center gap-2" onClick={() => navigate('home')}>
                            <span className="text-xl leading-none mb-0.5">←</span> Back
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold bg-background text-foreground hover:bg-muted transition-all border-border" onClick={() => navigate('auth')}>
                                Login
                            </Button>
                            <Button className="flex-1 rounded-xl h-12 font-bold glow-primary text-primary-foreground transition-all" onClick={() => navigate('auth', { mode: 'register' })}>
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default Navbar
