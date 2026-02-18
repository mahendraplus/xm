import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const apiClient = axios.create({
    baseURL: 'https://mahendraplus-api-db-in.hf.space',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        // For this task, I will set it as a config header, hoping the server might check it, 
        const { spacesJwt, apiUrl, token: authToken } = useAuthStore.getState()

        // Runtime API URL Override
        if (apiUrl) {
            config.baseURL = apiUrl
        }

        // Handle Authorization
        // 1. If we have a user token, that takes precedence for user-specific endpoints
        // Handle Authorization
        // 1. If we have a user token, that takes precedence for user-specific endpoints
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`
        }
        // 2. If no user token but we have spacesJwt, send that to access the Space
        else if (spacesJwt) {
            config.headers['Authorization'] = `Bearer ${spacesJwt}`
        }

        // 3. For some HF Spaces, they might expect the cookie value in a custom header
        // if Authorization is reserved. We'll add a custom header just in case.
        if (spacesJwt) {
            config.headers['X-Space-Token'] = spacesJwt
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default apiClient
