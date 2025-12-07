import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
    // CRITICAL: This allows the browser to send/receive cookies
    withCredentials: true,
});

// Response Interceptor (The "Reactive Check")
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong";

        // IF TOKEN EXPIRES: Backend sends 401
        if (error.response?.status === 401) {
            // We don't need to remove 'token' from localStorage because it's not there.
            // We just redirect.
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(new Error(message));
    }
);

export default apiClient;