import { Rocket } from 'lucide-react'

const APP_VERSION = 'v2.8'
const BUILD_DATE = '20/02/2026, 01:57:00'

const Footer = () => {
    return (
        <footer className="border-t border-border/30 bg-card/30 backdrop-blur-lg mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary/20 p-1.5 rounded-lg">
                            <Rocket className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Go-Biz</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            — Modern API solutions for business intelligence.
                        </span>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Go-Biz Inc. All rights reserved.
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                            System {APP_VERSION} • Last Updated: {BUILD_DATE}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
