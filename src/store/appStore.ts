import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'cyan'
export type DashboardTab = 'overview' | 'recharge' | 'api'
export type AuthMode = 'login' | 'register'
export type ProfileTab = 'info' | 'settings' | 'security'
export type Page = 'home' | 'auth' | 'dashboard' | 'search' | 'history' | 'admin' | 'forgot-password' | 'api-docs' | 'chat' | 'terms' | 'privacy' | 'refund' | 'contact' | 'overview' | 'recharge' | 'profile' | '404'

const ACCENT_COLORS: Record<AccentColor, { hue: number; sat: number; light: number }> = {
    blue: { hue: 217, sat: 91, light: 60 },
    purple: { hue: 265, sat: 80, light: 60 },
    green: { hue: 142, sat: 71, light: 45 },
    orange: { hue: 25, sat: 95, light: 53 },
    rose: { hue: 346, sat: 77, light: 50 },
    cyan: { hue: 186, sat: 80, light: 42 },
}

interface AppState {
    theme: Theme
    accentColor: AccentColor
    currentPage: Page
    dashboardTab: DashboardTab
    authMode: AuthMode
    setTheme: (theme: Theme) => void
    setAccentColor: (color: AccentColor) => void
    setDashboardTab: (tab: DashboardTab) => void
    setAuthMode: (mode: AuthMode) => void
    navigate: (page: Page, options?: { tab?: DashboardTab; mode?: AuthMode }) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            theme: 'dark',
            accentColor: 'blue',
            currentPage: 'home',
            dashboardTab: 'overview',
            authMode: 'login',
            setTheme: (theme) => {
                set({ theme })
                applyTheme(theme)
            },
            setAccentColor: (color) => {
                set({ accentColor: color })
                applyAccentColor(color)
            },
            setDashboardTab: (dashboardTab) => set({ dashboardTab }),
            setAuthMode: (authMode) => set({ authMode }),
            navigate: (page, options) => {
                const updates: Partial<AppState> = { currentPage: page }
                if (options?.tab) updates.dashboardTab = options.tab
                if (options?.mode) updates.authMode = options.mode

                set(updates)
                // Push state to browser history for back/forward support
                window.history.pushState({ page, ...options }, '', '')
            },
        }),
        {
            name: 'app-settings',
            partialize: (state) => ({
                theme: state.theme,
                accentColor: state.accentColor,
                currentPage: state.currentPage
            }),
        }
    )
)

// Sync popstate back to store
if (typeof window !== 'undefined') {
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            useAppStore.setState({ currentPage: event.state.page })
        }
    })

    // Initial push for the starting page
    const state = useAppStore.getState()
    if (!window.history.state) {
        window.history.replaceState({ page: state.currentPage }, '', '')
    }

    // Apply saved accent on load
    applyAccentColor(state.accentColor)
}

export function applyTheme(theme: Theme) {
    const root = document.documentElement
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } else {
        root.setAttribute('data-theme', theme)
    }
}

export function applyAccentColor(color: AccentColor) {
    const c = ACCENT_COLORS[color]
    if (!c) return
    const root = document.documentElement
    root.style.setProperty('--primary', `${c.hue} ${c.sat}% ${c.light}%`)
    root.style.setProperty('--ring', `${c.hue} ${c.sat}% ${c.light - 5}%`)
}

export { ACCENT_COLORS }
