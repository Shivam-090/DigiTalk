import axios from 'axios'

const rawBaseUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BASE_URL ||
    "http://localhost:3000";

const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/$/, "")}/api`;

export const axiosInstance = axios.create({
    baseURL: normalizedBaseUrl,
    withCredentials: true,
});
