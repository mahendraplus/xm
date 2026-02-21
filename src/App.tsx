import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { useAppStore, applyTheme, applyAccentColor } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/api/client'
import RootLayout from '@/layouts/RootLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import OverviewPage from '@/pages/OverviewPage'
import RechargePage from '@/pages/RechargePage'
import ProfilePage from '@/pages/ProfilePage'
import Dashboard from '@/pages/Dashboard'
import AuthPage from '@/pages/AuthPage'
import SearchPage from '@/pages/SearchPage'
import HistoryPage from '@/pages/HistoryPage'
import AdminPage from '@/pages/AdminPage'
import NotFound from '@/pages/NotFound'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ApiDocsPage from '@/pages/ApiDocsPage'
import ChatPage from '@/pages/ChatPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import RefundPolicyPage from '@/pages/RefundPolicyPage'
import ContactUsPage from '@/pages/ContactUsPage'
import BottomNav from '@/components/BottomNav'

function App() {
  const { theme, accentColor, currentPage, navigate } = useAppStore()
  const { token, setUser, logout } = useAuthStore()

  // Apply theme + accent on mount and changes
  useEffect(() => {
    applyTheme(theme)
    applyAccentColor(accentColor)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, accentColor])

  // Re-hydrate user profile on page load if token exists
  useEffect(() => {
    if (token) {
      apiClient.get('/api/user/profile').then(res => setUser(res.data)).catch(() => logout())

      // Auto-redirect from home to search if logged in
      if (currentPage === 'home') {
        navigate('search')
      }
    }
  }, [token, setUser, logout, currentPage, navigate])

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <LandingPage />
      case 'auth': return <AuthPage />
      case 'dashboard': return <Dashboard />
      case 'overview': return <OverviewPage />
      case 'recharge': return <RechargePage />
      case 'profile': return <ProfilePage />
      case 'search': return <SearchPage />
      case 'history': return <HistoryPage />
      case 'admin': return <AdminPage />
      case 'forgot-password': return <ForgotPasswordPage />
      case 'api-docs': return <ApiDocsPage />
      case 'chat': return <ChatPage />
      case 'terms': return <TermsPage />
      case 'privacy': return <PrivacyPolicyPage />
      case 'refund': return <RefundPolicyPage />
      case 'contact': return <ContactUsPage />
      default: return <NotFound />
    }
  }

  return (
    <HelmetProvider>
      <RootLayout>
        {renderPage()}
        <BottomNav />
      </RootLayout>
      <Toaster
        position="bottom-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </HelmetProvider>
  )
}

export default App
