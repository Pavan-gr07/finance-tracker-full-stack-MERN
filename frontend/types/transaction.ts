export interface Transaction {
    _id: string;
    userId: string;
    amount: number;
    currency: string;
    type: "income" | "expense";
    category: string;
    date: string;
    notes?: string;
    isRecurring: boolean;
    recurringConfig?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        nextRunDate: string;
        isActive: boolean;
    };
    linkedGoalId?: string | null;
    createdAt: string;
}