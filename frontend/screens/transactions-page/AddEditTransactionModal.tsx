"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Repeat,
    Clock,
    CheckCircle2
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

import type { Transaction } from "@/types/transaction";

interface AddEditTransactionModalProps {
    open: boolean;
    onClose: () => void;
    txn: Transaction | null;
}

export default function AddEditTransactionModal({
    open,
    onClose,
    txn,
}: AddEditTransactionModalProps) {

    // Form State
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");

    // RECURRING STATE (The new feature)
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState("monthly"); // daily, weekly, monthly, yearly

    // Load data if editing
    useEffect(() => {
        if (txn) {
            setAmount(txn.amount.toString());
            setType(txn.type);
            setCategory(txn.category);
            setDate(txn.date); // Ensure date format matches input type="date" (YYYY-MM-DD)
            setNotes(txn.notes || "");
            // In a real app, you'd load the existing recurrence settings here
            setIsRecurring(false);
        } else {
            // Reset for new entry
            setAmount("");
            setType("expense");
            setCategory("");
            setDate(new Date().toISOString().split("T")[0]); // Default to Today
            setNotes("");
            setIsRecurring(false);
        }
    }, [txn, open]);

    const handleSubmit = () => {
        // 1. Construct the payload
        const payload = {
            amount: Number(amount),
            type,
            category,
            date,
            notes,
            recurring: isRecurring ? { frequency } : null
        };

        console.log("Saving Transaction:", payload);
        // 2. Call your API or Context here...

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">

                {/* HEADER WITH COLORED BG */}
                <DialogHeader className={cn(
                    "p-6 text-white",
                    type === 'income' ? "bg-emerald-600" : "bg-rose-600"
                )}>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {txn ? "Edit Transaction" : "New Transaction"}
                    </DialogTitle>
                    <DialogDescription className="text-white/80">
                        {type === 'income' ? "Record money coming in." : "Record money going out."}
                    </DialogDescription>

                    {/* Type Toggle embedded in Header */}
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
                    {/* AMOUNT INPUT */}
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
                                    <SelectItem value="Salary">Salary</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
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

                    {/* --- RECURRING SECTION (THE NEW FEATURE) --- */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Repeat className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Recurring Payment?</span>
                                    <span className="text-xs text-muted-foreground">Repeat this transaction automatically</span>
                                </div>
                            </div>
                            <Switch
                                checked={isRecurring}
                                onCheckedChange={setIsRecurring}
                            />
                        </div>

                        {/* Hidden Animation Area for Frequency */}
                        {isRecurring && (
                            <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div className="flex items-center gap-4">
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Repeat every:</Label>
                                    <Select value={frequency} onValueChange={setFrequency}>
                                        <SelectTrigger className="h-8 bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Day</SelectItem>
                                            <SelectItem value="weekly">Week</SelectItem>
                                            <SelectItem value="monthly">Month (on the {date ? new Date(date).getDate() : '1st'})</SelectItem>
                                            <SelectItem value="yearly">Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 pl-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Next payment will be automatically added on {date}.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* NOTES */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Notes (Optional)</Label>
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
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} className={type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save Transaction
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}