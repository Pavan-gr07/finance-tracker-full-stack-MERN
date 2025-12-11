// import axios from "axios";
// import { toast } from "sonner"; // Import toast for the notification

// const apiClient = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     withCredentials: true,
// });

// apiClient.interceptors.response.use(
//     (response) => response.data,
//     async (error) => {
//         console.log(error, "error")
//         const message = error.response?.data?.error || "Something went wrong";

//         // IF TOKEN EXPIRES (401)
//         if (error.response?.status === 401) {
//             if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {

//                 // 1. Notify the user gently
//                 toast.error("Session expired. Redirecting to login...", {
//                     duration: 2000, // Keep toast visible during the delay
//                 });

//                 // 2. Create a delay (e.g., 2 seconds) to let them read the message
//                 await new Promise((resolve) => setTimeout(resolve, 3000));

//                 try {
//                     // 3. Attempt to clear cookies on server
//                     await axios.post(
//                         (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/auth/logout",
//                         {},
//                         { withCredentials: true }
//                     );
//                 } catch (logoutError) {
//                     console.error("Logout cleanup failed:", logoutError);
//                 } finally {
//                     // 4. Redirect
//                     window.location.href = "/login";
//                 }
//             }
//         }

//         return Promise.reject(message);
//     }
// );

// export default apiClient;


import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie"; // <--- IMPORT THIS

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ 1. REQUEST INTERCEPTOR: Attach Token from Cookie
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            // Read token from Cookie instead of LocalStorage
            const token = Cookies.get("finance_token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ 2. RESPONSE INTERCEPTOR: Handle Errors & Token Expiry
apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        console.log(error, "error");
        const message = error.response?.data?.error || "Something went wrong";

        // IF TOKEN EXPIRES (401)
        if (error.response?.status === 401) {
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {

                toast.error("Session expired. Redirecting to login...", {
                    duration: 2000,
                });

                await new Promise((resolve) => setTimeout(resolve, 2000));

                // ⚡ CLEAR COOKIE & USER DATA
                Cookies.remove("finance_token"); // Remove the token cookie
                localStorage.removeItem("finance_token"); // Remove from LS just in case
                localStorage.removeItem("finance_user");  // Remove user data

                window.location.href = "/login";
            }
        }

        return Promise.reject(message);
    }
);

export default apiClient;