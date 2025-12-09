"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Target,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    MoreVertical,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Import Services & Types
import { BudgetService, Budget } from "@/services/budget-service";
import { GoalService, Goal } from "@/services/goal-service";
import { CATEGORIES } from "@/data/static_data"; // Assuming you have this, or use the array below

// Fallback if file doesn't exist yet
const STATIC_CATEGORIES = [
    "Food", "Groceries", "Transport", "Utilities", "Shopping",
    "Entertainment", "Medical", "Travel", "Savings", "Investments"
];

type ItemType = "budget" | "goal";

export default function BudgetsGoalsScreen() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<ItemType>("budget");
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        amount: "",     // Limit (Budget) OR Target (Goal)
        current: "0",   // Spent (Budget) OR Saved (Goal)
        deadline: "",   // Goals only
        alerts: "80, 90", // Budgets only
    });

    // --- API FETCH ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [budgetRes, goalRes] = await Promise.all([
                BudgetService.getAll(),
                GoalService.getAll()
            ]);

            // Budget is likely still wrapped: { budgets: [...] } based on your controller
            setBudgets(budgetRes.budgets || []);

            // FIX: Goal is now a direct array, so we pass it directly
            // We cast to 'any' temporarily if TS still complains about the dual-type history
            setGoals((goalRes as any) || []);

        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---

    const openAdd = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            name: "", category: "", amount: "", current: "0",
            deadline: "", alerts: "50, 80, 90"
        });
        setIsModalOpen(true);
    };

    const openEdit = (item: any) => {
        setIsEditing(true);
        setCurrentId(item._id); // Ensure we use _id from MongoDB

        if (activeTab === "budget") {
            setFormData({
                name: item.name,
                category: item.category,
                amount: item.limit.toString(),
                current: (item.spent || 0).toString(),
                deadline: "",
                alerts: item.notifyAtPercent?.join(", ") || "80, 90",
            });
        } else {
            // Goal
            setFormData({
                name: item.name,
                category: "", // Goals might not use category in UI yet
                amount: item.targetAmount.toString(),
                current: item.savedAmount.toString(),
                deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : "",
                alerts: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const amountVal = Number(formData.amount);
        // const currentVal = Number(formData.current); // Usually calculated by backend, but kept if manual override needed

        if (!formData.name || !amountVal) {
            toast.error("Name and Amount are required");
            return;
        }

        setIsSaving(true);
        try {
            if (activeTab === "budget") {
                const alertArray = formData.alerts.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));

                const payload = {
                    name: formData.name,
                    category: formData.category,
                    limit: amountVal,
                    notifyAtPercent: alertArray,
                    period: "monthly" as const
                };

                if (isEditing && currentId) {
                    await BudgetService.update(currentId, payload);
                    toast.success("Budget updated");
                } else {
                    await BudgetService.create(payload);
                    toast.success("Budget created");
                }
            } else {
                // GOAL LOGIC
                const payload = {
                    name: formData.name,
                    targetAmount: amountVal,
                    // We typically don't update 'savedAmount' manually here, 
                    // it comes from transactions, but if you want manual override:
                    // savedAmount: currentVal, 
                    deadline: formData.deadline
                };

                if (isEditing && currentId) {
                    await GoalService.update(currentId, payload);
                    toast.success("Goal updated");
                } else {
                    await GoalService.create(payload);
                    toast.success("Goal created");
                }
            }

            setIsModalOpen(false);
            fetchData(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (activeTab === "budget") {
                await BudgetService.delete(id);
                toast.success("Budget deleted");
            } else {
                await GoalService.delete(id);
                toast.success("Goal deleted");
            }
            fetchData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Budgets & Goals</h2>
                    <p className="text-muted-foreground">Control spending and track your dreams.</p>
                </div>
                <Button onClick={openAdd} className="bg-primary shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> Create {activeTab === 'budget' ? 'Budget' : 'Goal'}
                </Button>
            </div>

            {/* TABS */}
            <Tabs defaultValue="budget" onValueChange={(val) => setActiveTab(val as ItemType)} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
                    <TabsTrigger value="budget">Budgets</TabsTrigger>
                    <TabsTrigger value="goal">Goals</TabsTrigger>
                </TabsList>

                {/* --- BUDGETS GRID --- */}
                <TabsContent value="budget" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                    ) : budgets.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">No budgets set. Create one to start tracking!</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                            {budgets.map((budget) => {
                                const spent = budget.spent || 0;
                                const percentage = Math.min(100, (spent / budget.limit) * 100);
                                const isOver = spent > budget.limit;

                                return (
                                    <Card key={budget._id} className={`group relative overflow-hidden transition-all hover:shadow-md border-l-4 ${isOver ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">{budget.name}</CardTitle>
                                                <Badge variant="outline" className="mt-1 text-xs font-normal text-muted-foreground">
                                                    {budget.category}
                                                </Badge>
                                            </div>
                                            <ActionMenu onEdit={() => openEdit(budget)} onDelete={() => handleDelete(budget._id)} />
                                        </CardHeader>

                                        <CardContent>
                                            <div className="flex items-baseline justify-between mb-2">
                                                <span className="text-2xl font-bold">₹{spent.toLocaleString()}</span>
                                                <span className="text-sm text-muted-foreground">of ₹{budget.limit.toLocaleString()}</span>
                                            </div>

                                            <Progress
                                                value={percentage}
                                                className="h-2 mb-2"
                                                indicatorClassName={isOver ? "bg-red-500" : percentage > 85 ? "bg-amber-500" : "bg-emerald-500"}
                                            />

                                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-4">
                                                <div className="flex gap-1">
                                                    {budget.notifyAtPercent.map(t => (
                                                        <span key={t} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border">
                                                            🔔 {t}%
                                                        </span>
                                                    ))}
                                                </div>
                                                {isOver && <span className="text-red-600 font-medium flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Over Limit</span>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* --- GOALS GRID --- */}
                <TabsContent value="goal" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">No goals yet. Set a target to save for!</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                            {goals.map((goal) => {
                                const percentage = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
                                // Calculate days remaining
                                let daysLeft = 0;
                                let isExpired = false;

                                if (goal.deadline) {
                                    const diff = new Date(goal.deadline).getTime() - new Date().getTime();
                                    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                    isExpired = daysLeft < 0;
                                }

                                return (
                                    <Card key={goal._id} className="group relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-blue-500">
                                        <Target className="absolute -right-6 -bottom-6 h-32 w-32 text-slate-50 dark:text-slate-900 rotate-12 transition-transform group-hover:rotate-45" />

                                        <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                                            <CardTitle className="text-base">{goal.name}</CardTitle>
                                            <ActionMenu onEdit={() => openEdit(goal)} onDelete={() => handleDelete(goal._id)} />
                                        </CardHeader>

                                        <CardContent className="relative z-10">
                                            <div className="flex items-baseline justify-between mb-2">
                                                {/* <span className="text-2xl font-bold text-blue-600">₹{goal.savedAmount.toLocaleString()}</span> */}
                                                <span className="text-sm text-muted-foreground">Target: ₹{goal.targetAmount.toLocaleString()}</span>
                                            </div>

                                            <Progress value={percentage} className="h-2" indicatorClassName="bg-blue-600" />

                                            <div className="mt-4 flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">{percentage.toFixed(1)}% Achieved</span>
                                                {goal.deadline && (
                                                    <Badge variant={isExpired ? "destructive" : "secondary"} className="font-normal">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {isExpired ? "Ended" : `${daysLeft} days left`}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* --- UNIFIED CREATE/EDIT MODAL --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit" : "Create New"} {activeTab === 'budget' ? "Budget" : "Goal"}
                        </DialogTitle>
                        <DialogDescription>
                            {activeTab === 'budget'
                                ? "Set spending limits for specific categories."
                                : "Track your progress towards a financial target."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">

                        {/* 1. NAME */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder={activeTab === 'budget' ? "e.g. Monthly Groceries" : "e.g. Dream Vacation"}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* 2. CATEGORY (Budget Only) */}
                        {activeTab === 'budget' && (
                            <div className="grid gap-2">
                                <Label>Linked Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(CATEGORIES || STATIC_CATEGORIES).map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">Transactions in this category will count towards this budget.</p>
                            </div>
                        )}

                        {/* 3. AMOUNT (Limit / Target) */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">{activeTab === 'budget' ? "Spending Limit (₹)" : "Target Amount (₹)"}</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    className="pl-7 font-bold"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* 4. GOAL SPECIFIC: DEADLINE */}
                        {activeTab === 'goal' && (
                            <div className="grid gap-2">
                                <Label htmlFor="deadline">Target Date</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground">We'll track if you achieve this by the deadline.</p>
                            </div>
                        )}

                        {/* 5. BUDGET SPECIFIC: ALERTS */}
                        {activeTab === 'budget' && (
                            <div className="grid gap-2">
                                <Label htmlFor="alerts">Alert Thresholds (%)</Label>
                                <Input
                                    id="alerts"
                                    placeholder="e.g. 50, 80, 90"
                                    value={formData.alerts}
                                    onChange={(e) => setFormData({ ...formData, alerts: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground">Comma separated. We'll notify you when spending hits these %.</p>
                            </div>
                        )}

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary" disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : `Save ${activeTab === 'budget' ? 'Budget' : 'Goal'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Helper for the "..." Menu
function ActionMenu({ onEdit, onDelete }: { onEdit: () => void, onDelete: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}