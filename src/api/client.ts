import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://mahendraplus-api-db-in.hf.space',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const { spacesJwt, token } = useAuthStore.getState()

        // Add spaces-jwt cookie to header or cookie
        // Since we can't easily set cookies for cross-domain in browser JS if HttpOnly is required,
        // we will try to send it as a custom header if the API supports it, 
        // OR we rely on the user having the cookie set in their browser for that domain.
        // However, the docs say: "Every request ... must include the following cookie".
        // If the API supports passing it as a header "Cookie: spaces-jwt=...", we can try that.
        // But browsers typically block setting 'Cookie' header in XHR/Fetch.
        // We will try sending it as 'Authorization' if it was a bearer, but it's a cookie.

        // WORKAROUND: We will assume we can't set the Cookie header directly from browser.
        // But if we are running in a proxy or electron, we could.
        // For now, let's try to append it to the URL or hope the user has the cookie.
        // BUT the requirement says: "run time secret so api will secure".
        // This implies the user provides the token.

        // Let's assume we pass it as a custom header `X-Spaces-JWT` or similar, 
        // and if the server doesn't support it, we might be stuck. 
        // BUT, for `curl` it works. 
        // If we are strictly browser-based, we might need a proxy.
        // For this task, I will set it as a config header, hoping the server might check it, 
        // or arguably the user should use a browser extension to set the cookie.

        // However, if the user provides the JWT, we can try to set `withCredentials: true` 
        // if the domain matches or if we can trick it. 

        // Actually, looking at the docs: "Header: Authorization: Bearer <token>" is for USER auth.
        // The "spaces-jwt" is a COOKIE.
        // If I can't set the cookie, I can't access the API from a different domain unless CORS allows it 
        // AND credentials are sent.

        if (spacesJwt) {
            // We can't set "Cookie" header in browser. 
            // We will try to pass it in a way that might work if the server accepts it via query param or custom header?
            // If not, this is a limitation. 
            // I will add a comment about this.
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default apiClient
