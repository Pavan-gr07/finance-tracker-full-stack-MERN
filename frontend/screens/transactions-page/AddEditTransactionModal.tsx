"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Repeat,
    Clock,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { TransactionService } from "@/services/transaction-service"; // Import the service
import type { Transaction } from "@/types/transaction";

interface AddEditTransactionModalProps {
    open: boolean;
    onClose: () => void;
    txn: Transaction | null;
    onSuccess?: () => void; // Trigger to refresh the list after saving
}

export default function AddEditTransactionModal({
    open,
    onClose,
    txn,
    onSuccess
}: AddEditTransactionModalProps) {

    // UI State
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");

    // Goal Linking State
    const [linkedGoalId, setLinkedGoalId] = useState<string>("");
    const [goals, setGoals] = useState<{ id: string, name: string }[]>([]);

    // Recurring State
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState("monthly");

    // Load Data on Open
    useEffect(() => {
        if (open) {
            // Fetch goals for the dropdown (Mocking for now, replace with GoalService.getAll())
            setGoals([
                { id: "6754a8b29c1d2e3f4a5b6c7d", name: "New Car Fund" },
                { id: "goal_2", name: "Bali Trip" }
            ]);

            if (txn) {
                // Edit Mode
                setAmount(txn.amount.toString());
                setType(txn.type);
                setCategory(txn.category);
                setDate(txn.date ? new Date(txn.date).toISOString().split("T")[0] : "");
                setNotes(txn.notes || "");
                setLinkedGoalId(txn.linkedGoalId || "");

                // If backend sends recurring info, populate it here
                // setIsRecurring(!!txn.recurringConfig?.isActive);
                // setFrequency(txn.recurringConfig?.frequency || "monthly");
            } else {
                // Add Mode (Reset)
                setAmount("");
                setType("expense");
                setCategory("");
                setDate(new Date().toISOString().split("T")[0]);
                setNotes("");
                setLinkedGoalId("");
                setIsRecurring(false);
                setFrequency("monthly");
            }
        }
    }, [txn, open]);

    const handleSubmit = async () => {
        // 1. Validation
        if (!amount || !category || !date) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            // 2. Construct Payload
            const payload: any = {
                amount: Number(amount),
                type,
                category,
                date, // string 'YYYY-MM-DD' is usually fine, or new Date(date)
                notes,
                // Only send goal ID if category is savings
                linkedGoalId: category === "Savings" ? linkedGoalId : null,
                // Map frontend recurring state to backend expectation
                recurring: isRecurring ? { frequency } : null
            };

            // 3. Call API
            if (txn?._id) {
                // UPDATE
                await TransactionService.update(payload);
                toast.success("Transaction updated successfully");
            } else {
                // CREATE
                await TransactionService.create(payload);
                toast.success("Transaction created successfully");
            }

            // 4. Cleanup & Refresh
            if (onSuccess) onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save transaction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">

                {/* HEADER */}
                <DialogHeader className={cn(
                    "p-6 text-white transition-colors duration-300",
                    type === 'income' ? "bg-emerald-600" : "bg-rose-600"
                )}>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {txn ? "Edit Transaction" : "New Transaction"}
                    </DialogTitle>
                    <DialogDescription className="text-white/80">
                        {type === 'income' ? "Money flowing in." : "Money flowing out."}
                    </DialogDescription>

                    {/* Type Toggle */}
                    <div className="flex bg-black/20 p-1 rounded-lg mt-4 w-fit">
                        <button
                            onClick={() => setType("income")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                type === "income" ? "bg-white text-emerald-700 shadow-sm" : "text-white/70 hover:text-white"
                            )}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setType("expense")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                type === "expense" ? "bg-white text-rose-700 shadow-sm" : "text-white/70 hover:text-white"
                            )}
                        >
                            Expense
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* AMOUNT */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-semibold uppercase text-muted-foreground">
                            Amount
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-lg font-bold text-muted-foreground">₹</span>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="pl-8 text-lg font-bold h-12"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* CATEGORY */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food">Food & Dining</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                    <SelectItem value="Shopping">Shopping</SelectItem>
                                    <SelectItem value="Salary">Salary</SelectItem>
                                    <SelectItem value="Savings">Savings / Investment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* DATE */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-10"
                            />
                        </div>
                    </div>

                    {/* CONDITIONAL: GOAL LINKING */}
                    {category === "Savings" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label className="text-xs font-semibold uppercase text-emerald-600">Link to Goal (Optional)</Label>
                            <Select value={linkedGoalId} onValueChange={setLinkedGoalId}>
                                <SelectTrigger className="border-emerald-200 bg-emerald-50 text-emerald-900">
                                    <SelectValue placeholder="Choose a Goal..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {goals.map(goal => (
                                        <SelectItem key={goal.id} value={goal.id}>
                                            {goal.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* RECURRING TOGGLE */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Repeat className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Recurring?</span>
                                    <span className="text-xs text-muted-foreground">Repeat automatically</span>
                                </div>
                            </div>
                            <Switch
                                checked={isRecurring}
                                onCheckedChange={setIsRecurring}
                            />
                        </div>

                        {isRecurring && (
                            <div className="flex items-center gap-4 animate-in slide-in-from-top-2 fade-in">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap">Every:</Label>
                                <Select value={frequency} onValueChange={setFrequency}>
                                    <SelectTrigger className="h-8 bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Day</SelectItem>
                                        <SelectItem value="weekly">Week</SelectItem>
                                        <SelectItem value="monthly">Month</SelectItem>
                                        <SelectItem value="yearly">Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* NOTES */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Notes</Label>
                        <Textarea
                            placeholder="E.g. Lunch with team..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-slate-50 dark:bg-slate-900/20">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Save Transaction
                            </>
                        )}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}