import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import { Home, AlertCircle } from 'lucide-react'

const NotFound = () => {
    return (
        <div className="flex items-center justify-center min-h-[80vh] text-center px-4">
            <Helmet>
                <title>404 Not Found | Go-Biz</title>
            </Helmet>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <AlertCircle className="w-24 h-24 mx-auto text-red-500 opacity-80" />
                <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <div className="pt-4">
                    <Link to="/dashboard">
                        <Button size="lg" className="shadow-[0_0_20px_rgba(255,50,50,0.3)]">
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default NotFound
