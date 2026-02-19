import { Rocket } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="border-t border-border/30 bg-card/30 backdrop-blur-lg mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <Rocket className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Go-Biz</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            — Modern API solutions for business intelligence.
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Go-Biz Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
