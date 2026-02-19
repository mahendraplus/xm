import { Rocket } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-black/20 backdrop-blur-lg mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Rocket className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-lg font-bold">Go-Biz</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Modern API solutions for business intelligence and data access.
                            Secure, fast, and reliable.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#374151]">Product</h4>
                        <ul className="space-y-2 text-sm text-[#4b5563]">
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">Features</li>
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">Pricing</li>
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">API Docs</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#374151]">Company</h4>
                        <ul className="space-y-2 text-sm text-[#4b5563]">
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">About</li>
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">Blog</li>
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">Careers</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#374151]">Legal</h4>
                        <ul className="space-y-2 text-sm text-[#4b5563]">
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">Privacy</li>
                            <li className="hover:text-[#6d28d9] transition-colors cursor-pointer">Terms</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Go-Biz Inc. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
