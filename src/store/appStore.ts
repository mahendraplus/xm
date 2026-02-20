import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'cyan'
export type Page = 'home' | 'auth' | 'dashboard' | 'search' | 'history' | 'admin' | 'forgot-password' | 'api-docs' | 'chat' | 'terms' | 'privacy' | 'refund' | 'contact' | '404'

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
    setTheme: (theme: Theme) => void
    setAccentColor: (color: AccentColor) => void
    navigate: (page: Page) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            accentColor: 'blue',
            currentPage: 'home',
            setTheme: (theme) => {
                set({ theme })
                applyTheme(theme)
            },
            setAccentColor: (color) => {
                set({ accentColor: color })
                applyAccentColor(color)
            },
            navigate: (page) => {
                const prev = get().currentPage
                if (prev === page) return
                set({ currentPage: page })
                // Push state to browser history for back/forward support
                window.history.pushState({ page }, '', '')
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
