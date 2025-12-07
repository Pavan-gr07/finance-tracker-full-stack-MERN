export interface Transaction {
    _id: string;
    amount: number;
    currency: string;
    type: "income" | "expense";
    category: string;
    date: string; // ISO string from backend
    notes?: string;
}
