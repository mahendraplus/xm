import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'
export type Page = 'home' | 'auth' | 'dashboard' | 'search' | 'history' | 'admin' | 'forgot-password' | '404'

interface AppState {
    theme: Theme
    currentPage: Page
    setTheme: (theme: Theme) => void
    navigate: (page: Page) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            currentPage: 'home',
            setTheme: (theme) => {
                set({ theme })
                applyTheme(theme)
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
