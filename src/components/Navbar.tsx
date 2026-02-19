import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import type { Theme } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Rocket, LogOut, Sun, Moon, Monitor } from 'lucide-react'
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
    const { currentPage, navigate, theme, setTheme } = useAppStore()
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [showThemeMenu, setShowThemeMenu] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => setIsOpen(false), [currentPage])

    const handleLogout = () => {
        logout()
        navigate('home')
        toast.success('Logged out successfully')
    }

    const themes: Theme[] = ['dark', 'light', 'system']

    const navTo = (page: any) => { navigate(page); setIsOpen(false) }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled ? "glass border-border/50 shadow-lg py-3" : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button onClick={() => navTo('home')} className="flex items-center space-x-2 group">
                        <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors pulse-ring">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Go-Biz</span>
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Theme Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowThemeMenu(v => !v)}
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
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => navTo('dashboard')}>Dashboard</Button>
                                <Button variant="ghost" size="sm" onClick={() => navTo('search')}>Search</Button>
                                <Button variant="ghost" size="sm" onClick={() => navTo('history')}>History</Button>
                                <Button variant="destructive" size="sm" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-1" /> Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button variant="ghost" size="sm" onClick={() => navTo('auth')}>Log In</Button>
                                <Button size="sm" className="glow-primary" onClick={() => navTo('auth')}>Get Started</Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => { const t: Theme[] = ['dark', 'light', 'system']; const idx = t.indexOf(theme); setTheme(t[(idx + 1) % 3]) }}
                            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                        >
                            <ThemeIcon theme={theme} />
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-muted transition-colors text-foreground">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border/50 glass"
                    >
                        <div className="px-4 py-6 space-y-3">
                            {user ? (
                                <>
                                    <Button className="w-full" variant="secondary" onClick={() => navTo('dashboard')}>Dashboard</Button>
                                    <Button className="w-full" variant="secondary" onClick={() => navTo('search')}>Search</Button>
                                    <Button className="w-full" variant="secondary" onClick={() => navTo('history')}>History</Button>
                                    <Button className="w-full" variant="destructive" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" /> Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button className="w-full" variant="ghost" onClick={() => navTo('auth')}>Log In</Button>
                                    <Button className="w-full glow-primary" onClick={() => navTo('auth')}>Get Started</Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
