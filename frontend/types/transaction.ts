export interface Transaction {
    _id: string;
    amount: number;
    currency: string;
    type: "income" | "expense";
    category: string;
    date: string; // ISO string from backend
    notes?: string;
    isRecurring: boolean;
    recurringConfig?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        nextRunDate: string; // ISO string from backend
        isActive: boolean;
    };
    linkedGoalId?: string;
    balance: string;
    stats?: Object;
    txns?: Object;
}
