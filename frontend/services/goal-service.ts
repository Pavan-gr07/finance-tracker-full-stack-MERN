import apiClient from "@/lib/api-client";

export interface Goal {
    _id: string;
    userId: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string;
    linkedCategory?: string;
    notifyAtPercent: number[];
    completed: boolean;
}

// FIX: Response is just an array, not an object with a 'goals' key
export type GoalResponse = Goal[];

export const GoalService = {

    getAll: async () => {
        // Expect an array directly
        const response = await apiClient.get<Goal[]>("/goals");
        return response as unknown as Goal[];
    },

    create: async (data: Partial<Goal>) => {
        const response = await apiClient.post("/goals", data);
        return response;
    },

    update: async (id: string, data: Partial<Goal>) => {
        const response = await apiClient.patch(`/goals/${id}`, data);
        return response;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/goals/${id}`);
        return response;
    }
};