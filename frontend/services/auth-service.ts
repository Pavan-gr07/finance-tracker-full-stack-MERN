import apiClient from "@/lib/api-client";

// --- TYPES (Define what the API expects and returns) ---

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthResponse {
    user: User;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

// --- THE SERVICE ---

export const AuthService = {

    // 1. REGISTER
    register: async (data: RegisterPayload) => {
        return await apiClient.post<AuthResponse>("/auth/register", data);
    },

    // 2. LOGIN
    login: async (data: LoginPayload) => {
        const response = await apiClient.post<AuthResponse>("/auth/login", data);

        return response;
    },

    logout: async () => {
        try {
            // 1. Tell the server to delete the HttpOnly cookie
            await apiClient.post("/auth/logout");
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            // 2. Clear client-side state
            if (typeof window !== "undefined") {
                localStorage.clear(); // Clear any non-sensitive cached data
                window.location.href = "/login"; // Force redirect
            }
        }
    },

    // 4. GET CURRENT USER (Profile)
    getMe: async () => {
        return await apiClient.get<User>("/auth/me");
    },

    // 5. UPDATE PASSWORD (Optional security feature)
    updatePassword: async (data: { current: string; new: string }) => {
        return await apiClient.put("/auth/password", data);
    }
};