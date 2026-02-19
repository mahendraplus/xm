import { Helmet } from 'react-helmet-async'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

const NotFound = () => {
    const { navigate } = useAppStore()
    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <Helmet><title>404 Not Found | Go-Biz</title></Helmet>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
            >
                <div className="flex justify-center">
                    <AlertTriangle className="w-24 h-24 text-yellow-500 opacity-60" />
                </div>
                <div>
                    <h1 className="text-8xl font-black gradient-text mb-2">404</h1>
                    <p className="text-xl text-muted-foreground">Page not found</p>
                    <p className="text-sm text-muted-foreground mt-1">The page you're looking for doesn't exist.</p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('home')}>← Go Home</Button>
                    <Button variant="outline" onClick={() => navigate('auth')}>Login</Button>
                </div>
            </motion.div>
        </div>
    )
}

export default NotFound
