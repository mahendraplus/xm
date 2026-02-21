import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const Dashboard = () => {
    const { navigate } = useAppStore()
    const { token } = useAuthStore()

    useEffect(() => {
        if (!token) {
            navigate('auth')
        } else {
            // Redirect to the new Overview page
            navigate('overview')
        }
    }, [token, navigate])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 text-muted-foreground"
            >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">Loading your dashboard...</p>
            </motion.div>
        </div>
    )
}

export default Dashboard
