import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
    name: string
    email: string
    role: string
    credits: number
    searches: number
    api_key: string | null
    created_at: string
    account_status?: string
    total_spent?: number
}

interface AuthState {
    spacesJwt: string | null
    apiUrl: string | null
    token: string | null
    user: User | null
    setSpacesJwt: (jwt: string) => void
    setApiUrl: (url: string) => void
    setToken: (token: string) => void
    setUser: (user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            spacesJwt: null,
            apiUrl: null,
            token: null,
            user: null,
            setSpacesJwt: (jwt) => set({ spacesJwt: jwt }),
            setApiUrl: (url) => set({ apiUrl: url }),
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
