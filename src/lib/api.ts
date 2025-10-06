import axios from "axios";

/**
 * Create a pre-configured Axios instance for all backend calls.
 * This helps keep your API calls consistent and automatically
 * adds the Authorization header once you log in.
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    timeout: 10000,
});

/**
 * Helper function to set or remove the Authorization header globally.
 * Call this after you receive the JWT from backend.
 */
export function setAuthToken(token?: string) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}
