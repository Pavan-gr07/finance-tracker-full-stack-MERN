import apiClient from "@/lib/api-client";

export interface Budget {
    _id: string;
    name: string;
    category: string;
    limit: number;
    period: "monthly" | "weekly" | "daily";
    notifyAtPercent: number[]; // e.g. [80, 90]
    startDate?: string;
    spent?: number; // Calculated on frontend or backend?
}

export interface BudgetResponse {
    budgets: Budget[];
}

export const BudgetService = {

    getAll: async () => {
        // Returns { budgets: [...] }
        const response = await apiClient.get<BudgetResponse>("/budgets");
        return response as unknown as BudgetResponse;
    },

    create: async (data: Partial<Budget>) => {
        const response = await apiClient.post("/budgets", data);
        return response;
    },

    update: async (id: string, data: Partial<Budget>) => {
        const response = await apiClient.patch(`/budgets/${id}`, data);
        return response;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/budgets/${id}`);
        return response;
    }
};