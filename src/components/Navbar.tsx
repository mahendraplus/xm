import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Rocket, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const Navbar = () => {
    const { user, logout } = useAuthStore()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => setIsOpen(false), [location.pathname])

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Pricing', path: '/#pricing' }, // We might need hash link handling
    ]

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-background/70 backdrop-blur-xl border-white/5 shadow-md py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                            <Rocket className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Go-Biz
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard">
                                    <Button variant="ghost" size="sm">Dashboard</Button>
                                </Link>
                                <Button variant="destructive" size="sm" onClick={logout}>
                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/auth">
                                    <Button variant="ghost" size="sm">Log In</Button>
                                </Link>
                                <Link to="/auth?mode=register">
                                    <Button variant="default" size="sm" className="shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md hover:bg-white/5 transition-colors text-foreground"
                        >
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
                        className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="block text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                {user ? (
                                    <>
                                        <Link to="/dashboard" className="block w-full">
                                            <Button className="w-full" variant="secondary">Dashboard</Button>
                                        </Link>
                                        <Button className="w-full" variant="destructive" onClick={logout}>Logout</Button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/auth" className="block w-full">
                                            <Button className="w-full" variant="ghost">Log In</Button>
                                        </Link>
                                        <Link to="/auth?mode=register" className="block w-full">
                                            <Button className="w-full" variant="default">Get Started</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
