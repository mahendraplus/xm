import { Rocket, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useState } from 'react'
import { motion } from 'framer-motion'

const APP_VERSION = 'v3.2'

const Footer = () => {
    const { navigate } = useAppStore()
    const [buildDate] = useState(() => {
        const now = new Date()
        const day = now.getDate().toString().padStart(2, '0')
        const month = now.toLocaleString('en-GB', { month: 'short' })
        const year = now.getFullYear().toString().slice(2)
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        return `${day} ${month} '${year} · ${time}`
    })

    return (
        <footer className="border-t border-border/30 bg-card/30 backdrop-blur-lg mt-auto pb-24 md:pb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-blob-2 opacity-[0.03] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand + Legal Info */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary/20 p-1.5 rounded-lg">
                                <Rocket className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-bold text-foreground">Go-Biz</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Modern API solutions for data validation and developer tools.
                        </p>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1.5 text-[10px]">
                                <MessageCircle className="w-3 h-3 text-green-500" />
                                <a href="https://wa.me/919824584454" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    WhatsApp Support
                                </a>
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-primary/70" />
                                <a href="mailto:mahendrakumargahelot@gmail.com" className="hover:text-primary transition-colors">
                                    mahendrakumargahelot@gmail.com
                                </a>
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-primary/70" />
                                <a href="tel:+919824584454" className="hover:text-primary transition-colors">
                                    +91 98245 84454
                                </a>
                            </p>
                            <p className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-primary/70" />
                                Bhabhar, Gujarat, 385320, India
                            </p>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                        <div className="space-y-2">
                            <button onClick={() => navigate('terms')} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                                Terms & Conditions
                            </button>
                            <button onClick={() => navigate('privacy')} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                                Privacy Policy
                            </button>
                            <button onClick={() => navigate('refund')} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                                Refund & Cancellation Policy
                            </button>
                            <button onClick={() => navigate('contact')} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                                Contact Us
                            </button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
                        <div className="space-y-2">
                            <button onClick={() => navigate('api-docs')} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                                API Documentation
                            </button>
                            <button onClick={() => navigate('auth')} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                                Sign In / Register
                            </button>
                        </div>
                    </div>
                </div>

                {/* Premium System Pill & Developer Credits */}
                <div className="mt-8 pt-8 border-t border-border/20 flex flex-col items-center gap-6 text-center relative z-10">

                    {/* System Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex px-6 py-2.5 rounded-full border border-border/50 bg-card/80 text-xs font-semibold text-muted-foreground items-center gap-3 relative overflow-hidden cursor-default shadow-sm"
                    >
                        <span className="font-black text-foreground tracking-wide">System {APP_VERSION}</span>
                        <div className="w-px h-3.5 bg-border" />
                        <span className="font-mono text-muted-foreground/80">Last Updated: {buildDate}</span>
                    </motion.div>

                    {/* Developer Credits - Hacker Theme */}
                    <div className="flex flex-col gap-3 items-center mt-2 group">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            className="flex flex-wrap items-center justify-center gap-2 tracking-widest uppercase"
                        >
                            <span className="text-[10px] font-bold text-muted-foreground/60">Engineered with</span>
                            <div className="relative">
                                <span className="relative bg-muted text-foreground border border-border px-3 py-1 rounded font-black text-[11px] tracking-[0.2em]">
                                    LETHAL PRECISION
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/60">by</span>
                        </motion.div>

                        <p className="text-sm font-black text-foreground flex items-center gap-3">
                            <span className="text-primary hover:text-primary/80 hover:scale-105 transition-all duration-300">Mahendra Mali (Max)</span>
                            <span className="text-muted-foreground/40 font-mono text-xs">x</span>
                            <span className="text-primary hover:text-primary/80 hover:scale-105 transition-all duration-300">Satyam Raj (RootX)</span>
                        </p>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-muted-foreground/60 mt-4 tracking-wide font-medium">
                        © {new Date().getFullYear()} Go-Biz. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
