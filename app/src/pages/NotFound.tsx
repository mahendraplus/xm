import { Helmet } from 'react-helmet-async'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

const NotFound = () => {
    const { navigate } = useAppStore()
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Helmet><title>404 Not Found | Go-Biz</title></Helmet>
            <div className="w-full max-w-lg text-center space-y-8 p-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <AlertTriangle className="w-32 h-32 mx-auto text-primary relative z-10 animate-pulse" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black gradient-text tracking-tighter">404</h1>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                        <p className="text-muted-foreground">
                            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                        onClick={() => navigate('home')}
                        className="glow-primary h-12 px-8 text-lg"
                    >
                        Return Home
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="h-12 px-8 text-lg border-white/10 hover:bg-white/5"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
