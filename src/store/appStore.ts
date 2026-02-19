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
        (set) => ({
            theme: 'dark',
            currentPage: 'home',
            setTheme: (theme) => {
                set({ theme })
                applyTheme(theme)
            },
            navigate: (page) => set({ currentPage: page }),
        }),
        {
            name: 'app-settings',
            partialize: (state) => ({ theme: state.theme }),
        }
    )
)

export function applyTheme(theme: Theme) {
    const root = document.documentElement
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } else {
        root.setAttribute('data-theme', theme)
    }
}
