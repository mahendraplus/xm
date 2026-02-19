import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { useAppStore, applyTheme } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/api/client'
import RootLayout from '@/layouts/RootLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import AuthPage from '@/pages/AuthPage'
import SearchPage from '@/pages/SearchPage'
import HistoryPage from '@/pages/HistoryPage'
import AdminPage from '@/pages/AdminPage'
import NotFound from '@/pages/NotFound'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ApiDocsPage from '@/pages/ApiDocsPage'

function App() {
  const { theme, currentPage } = useAppStore()
  const { token, setUser, logout } = useAuthStore()

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme)
    // Watch system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Re-hydrate user profile on page load if token exists
  useEffect(() => {
    if (token) {
      apiClient.get('/api/user/profile').then(res => setUser(res.data)).catch(() => logout())
    }
  }, []) // intentionally only on mount

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <LandingPage />
      case 'auth': return <AuthPage />
      case 'dashboard': return <Dashboard />
      case 'search': return <SearchPage />
      case 'history': return <HistoryPage />
      case 'admin': return <AdminPage />
      case 'forgot-password': return <ForgotPasswordPage />
      case 'api-docs': return <ApiDocsPage />
      default: return <NotFound />
    }
  }

  return (
    <HelmetProvider>
      <RootLayout>
        {renderPage()}
      </RootLayout>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(220 25% 9%)',
            border: '1px solid hsl(217 25% 16%)',
            color: 'hsl(213 31% 91%)',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </HelmetProvider>
  )
}

export default App
