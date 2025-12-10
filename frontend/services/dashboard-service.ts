import apiClient from "@/lib/api-client";

// --- TYPES MATCHING YOUR BACKEND JSON ---

export interface MonthlyData {
    _id: {
        year: number;
        month: number; // 1-12
    };
    total: number;
    type: "income" | "expense";
}

export interface CategoryData {
    _id: string; // Category Name
    total: number;
}

export interface DashboardStatsResponse {
    totalIncome: number;
    totalExpense: number;
    last12Months: any[]; // Now correctly typed
    categoryChart: CategoryData[]; // Now correctly typed
    monthSummary: {
        monthIncome: number;
        monthExpense: number;
    };
}

export const DashboardService = {
    getStats: async (filters: string) => {
        const response = await apiClient.get<DashboardStatsResponse>("/dashboard",
            { params: { filters } }
        );
        return response as unknown as DashboardStatsResponse;
    }
};