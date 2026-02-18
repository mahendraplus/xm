import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import RootLayout from '@/layouts/RootLayout'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import AuthPage from '@/pages/AuthPage'
import SearchPage from '@/pages/SearchPage'
import HistoryPage from '@/pages/HistoryPage'
import AdminPage from '@/pages/AdminPage'
import NotFound from '@/pages/NotFound'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
// import { Toaster } from '@/components/ui/toaster' // Will create this later or use library

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
