import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const apiClient = axios.create({
    baseURL: 'https://mahendraplus-api-db-in.hf.space',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Critical: Allows sending cookies (spaces-jwt) with cross-origin requests
})

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const { spacesJwt, apiUrl, token: authToken } = useAuthStore.getState()

        // Runtime API URL Override
        if (apiUrl) {
            config.baseURL = apiUrl
        }

        // 1. Always send custom header if we have the Spaces JWT (Manual override)
        // Kept for backward compatibility if user has cookies, but effectively unused if public.
        if (spacesJwt) {
            config.headers['X-Space-Token'] = spacesJwt
        }

        // 2. Handle standard Authorization
        if (authToken) {
            // User is logged in to the App
            config.headers['Authorization'] = `Bearer ${authToken}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default apiClient
