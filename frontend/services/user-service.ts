import apiClient from "@/lib/api-client";

// Matches your MongoDB User Schema
export interface UserSettings {
    currency: string;
    timezone?: string;
    notificationPrefs?: any;
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    settings?: UserSettings;
    bio?: any;
}

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    settings?: Partial<UserSettings>;
}

export interface PasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export const UserService = {

    // 1. Get Profile (Reuse /auth/me or a dedicated /users/profile)
    getProfile: async () => {
        const response = await apiClient.get<UserProfile>("/user");
        return response as unknown as UserProfile;
    },

    // 2. Update Profile (Name, Email, Settings)
    updateProfile: async (data: UpdateProfilePayload) => {
        // Assuming PUT /api/users/profile exists
        const response = await apiClient.put<UserProfile>("/user/update", data,);
        return response as unknown as UserProfile;
    },

    // 3. Change Password
    changePassword: async (data: PasswordPayload) => {
        // Assuming PUT /api/users/password exists
        return await apiClient.put("/user/password-change", data);
    }
};