import apiClient from "@/lib/api-client";
import { Transaction } from "@/types/transaction";

// --- TYPES ---



export interface TransactionStats {
    income: number;
    expense: number;
    balance: number;
}

// The new response structure from your API
export interface TransactionsAPIResponse {
    txns: Transaction[];
    stats: TransactionStats;
}

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

// --- SERVICE ---

export const TransactionService = {

    getAll: async (filters?: TransactionFilters) => {
        // We expect the new object structure { txns, stats }
        const response = await apiClient.get<TransactionsAPIResponse>("/transactions", { params: filters });
        return response as unknown as TransactionsAPIResponse;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Transaction>(`/transactions`);
        return response as unknown as Transaction;
    },

    create: async (data: CreateTransactionPayload) => {
        const response = await apiClient.post<Transaction>("/transactions", data);
        return response as unknown as Transaction;
    },

    update: async (id: string, data: Partial<CreateTransactionPayload>) => {
        // Sends request to: PUT /api/transactions?id=6753f...
        const response = await apiClient.patch<Transaction>(
            "/transactions",
            data,
            { params: { id } } // This adds ?id=... to the URL
        );
        return response as unknown as Transaction;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/transactions`, { params: { id } });
        return response as unknown as any;
    },

    getSummary: async () => {
        const response = await apiClient.get("/transactions/summary");
        return response as unknown as any;
    }
};