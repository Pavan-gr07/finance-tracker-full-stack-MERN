import apiClient from "@/lib/api-client";

export interface NotificationItem {
    _id: string;
    type: "budget_alert" | "goal_milestone" | "bill_reminder";
    title: string;
    message: string;
    read: boolean; // Matches the new Schema field
    createdAt: string;
    payload?: any;
}

// Define the shape of the API Response Object
interface NotificationListResponse {
    notes: NotificationItem[];
}

interface UnreadCountResponse {
    count: number;
}

export const NotificationService = {

    getAll: async () => {
        // We tell TypeScript: "Expect this specific object structure"
        const response = await apiClient.get<NotificationListResponse>("/notifications");
        // We cast it to ensure TS knows 'notes' exists on 'response'
        return (response as unknown as NotificationListResponse).notes;
    },

    getUnreadCount: async () => {
        const response = await apiClient.get<UnreadCountResponse>("/notifications/unread");
        return (response as unknown as UnreadCountResponse).count;
    },

    markRead: async (id: string) => {
        const response = await apiClient.put("/notifications/read", { id });
        return response;
    },

    markAllRead: async () => {
        const response = await apiClient.put("/notifications/read", { id: 'all' });
        return response;
    },
    deleteNotification: async (selectedIds: any) => {
        // 1. Notice the structure: { data: { ids: ... } }
        // 2. Also ensure the key 'ids' matches what your backend expects (req.body.ids)
        const response = await apiClient.delete("/notifications", {
            data: { selectedIds: selectedIds }
        });

        return response;
    }
};