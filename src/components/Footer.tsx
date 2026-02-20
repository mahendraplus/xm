import { Rocket, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

const APP_VERSION = 'v3.0'
const BUILD_DATE = '20/02/2026, 20:35:00'

const Footer = () => {
    const { navigate } = useAppStore()

    return (
        <footer className="border-t border-border/30 bg-card/30 backdrop-blur-lg mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                {/* Bottom Bar */}
                <div className="mt-8 pt-4 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Go-Biz. All rights reserved.
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                        System {APP_VERSION} • Last Updated: {BUILD_DATE}
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
