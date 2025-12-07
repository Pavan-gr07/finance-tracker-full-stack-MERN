import apiClient from "@/lib/api-client";
import { Transaction } from "@/types/transaction";

interface CreateTransactionPayload {
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    notes?: string;
    linkedGoalId?: string;
    recurring?: any;
}

interface TransactionFilters {
    startDate?: string;
    endDate?: string;
    type?: string;
}

export const TransactionService = {

    getAll: async (filters?: TransactionFilters) => {
        const response = await apiClient.get<Transaction[]>("/transactions", { params: filters });
        // FIX: Cast it because our interceptor already unwrapped the data
        return response as unknown as Transaction[];
    },

    getById: async () => {
        const response = await apiClient.get<Transaction>(`/transactions}`);
        return response as unknown as Transaction;
    },

    create: async (data: CreateTransactionPayload) => {
        const response = await apiClient.post<Transaction>("/transactions", data);
        return response as unknown as Transaction;
    },

    update: async (data: Partial<CreateTransactionPayload>) => {
        const response = await apiClient.put<Transaction>(`/transactions}`, data);
        return response as unknown as Transaction;
    },

    delete: async () => {
        const response = await apiClient.delete(`/transactions}`);
        return response as unknown as any;
    },

    getSummary: async () => {
        const response = await apiClient.get("/transactions/summary");
        return response as unknown as any;
    }
};