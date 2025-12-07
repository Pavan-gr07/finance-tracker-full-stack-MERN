"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Target,
    AlertTriangle,
    Calendar,
    MoreVertical,
    X
} from "lucide-react";

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

// --- TYPES ---
type ItemType = "budget" | "goal";

interface Budget {
    id: string;
    name: string;
    category: string; // The link to Transactions
    amount: number;
    spent: number;
    alertThresholds: number[]; // [50, 80, 90]
}

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string; // ISO Date string
}

// Predefined Categories for the Dropdown
const CATEGORIES = [
    "Food & Dining", "Groceries", "Transport",
    "Utilities", "Shopping", "Entertainment",
    "Medical", "Personal Care", "Education",
    "Travel", "Savings", "Investments"
];

export default function BudgetsGoalsScreen() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<ItemType>("budget");
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        amount: "",     // Used for both Limit (Budget) and Target (Goal)
        current: "",    // Used for Spent (Budget) and Saved (Goal) - mostly for display/edit
        deadline: "",   // Goals only
        alerts: "80, 90", // Budgets only (stored as string for input, parsed to array)
    });

    // --- INITIAL DATA ---
    useEffect(() => {
        setBudgets([
            { id: "1", name: "Monthly Groceries", category: "Groceries", amount: 20000, spent: 14500, alertThresholds: [50, 90] },
            { id: "2", name: "Weekend Fun", category: "Entertainment", amount: 5000, spent: 5200, alertThresholds: [80] },
        ]);

        setGoals([
            { id: "1", name: "New Laptop", targetAmount: 150000, savedAmount: 45000, deadline: "2024-12-31" },
        ]);
    }, []);

    // --- HANDLERS ---

    const openAdd = () => {
        setIsEditing(false);
        setFormData({
            name: "", category: "", amount: "", current: "0",
            deadline: "", alerts: "50, 80, 100"
        });
        setIsModalOpen(true);
    };

    const openEdit = (item: any) => {
        setIsEditing(true);
        setCurrentId(item.id);
        const isBudget = activeTab === "budget";

        setFormData({
            name: item.name,
            category: isBudget ? item.category : "", // Goals might not use this explicitly in this UI
            amount: isBudget ? item.amount.toString() : item.targetAmount.toString(),
            current: isBudget ? item.spent.toString() : item.savedAmount.toString(),
            deadline: !isBudget ? item.deadline : "",
            alerts: isBudget ? item.alertThresholds.join(", ") : "",
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        // Parse the data
        const amountVal = Number(formData.amount);
        const currentVal = Number(formData.current);

        // Parse Alerts: Split by comma, trim, convert to number, filter valid ones
        const alertArray = formData.alerts
            .split(",")
            .map(s => Number(s.trim()))
            .filter(n => !isNaN(n) && n > 0 && n <= 100);

        const newItem = {
            id: isEditing && currentId ? currentId : Date.now().toString(),
            name: formData.name,
            ...(activeTab === "budget"
                ? {
                    category: formData.category,
                    amount: amountVal,
                    spent: currentVal,
                    alertThresholds: alertArray
                }
                : {
                    targetAmount: amountVal,
                    savedAmount: currentVal,
                    deadline: formData.deadline
                }
            )
        };

        if (activeTab === "budget") {
            setBudgets(prev => isEditing
                ? prev.map(b => b.id === currentId ? { ...b, ...newItem } as Budget : b)
                : [...prev, newItem as Budget]
            );
        } else {
            setGoals(prev => isEditing
                ? prev.map(g => g.id === currentId ? { ...g, ...newItem } as Goal : g)
                : [...prev, newItem as Goal]
            );
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (activeTab === "budget") setBudgets(b => b.filter(i => i.id !== id));
        else setGoals(g => g.filter(i => i.id !== id));
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
                <TabsContent value="budget" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                    {budgets.map((budget) => {
                        const percentage = Math.min(100, (budget.spent / budget.amount) * 100);
                        const isOver = budget.spent > budget.amount;

                        return (
                            <Card key={budget.id} className={`group relative overflow-hidden transition-all hover:shadow-md border-l-4 ${isOver ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">{budget.name}</CardTitle>
                                        <Badge variant="outline" className="mt-1 text-xs font-normal text-muted-foreground">
                                            {budget.category}
                                        </Badge>
                                    </div>
                                    <ActionMenu onEdit={() => openEdit(budget)} onDelete={() => handleDelete(budget.id)} />
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-2xl font-bold">₹{budget.spent.toLocaleString()}</span>
                                        <span className="text-sm text-muted-foreground">of ₹{budget.amount.toLocaleString()}</span>
                                    </div>

                                    <Progress
                                        value={percentage}
                                        className="h-2 mb-2"
                                        indicatorClassName={isOver ? "bg-red-500" : percentage > 85 ? "bg-amber-500" : "bg-emerald-500"}
                                    />

                                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-4">
                                        <div className="flex gap-1">
                                            {budget.alertThresholds.map(t => (
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
                </TabsContent>

                {/* --- GOALS GRID --- */}
                <TabsContent value="goal" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                    {goals.map((goal) => {
                        const percentage = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
                        // Calculate days remaining
                        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isExpired = daysLeft < 0;

                        return (
                            <Card key={goal.id} className="group relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-blue-500">
                                <Target className="absolute -right-6 -bottom-6 h-32 w-32 text-slate-50 dark:text-slate-900 rotate-12 transition-transform group-hover:rotate-45" />

                                <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                                    <CardTitle className="text-base">{goal.name}</CardTitle>
                                    <ActionMenu onEdit={() => openEdit(goal)} onDelete={() => handleDelete(goal.id)} />
                                </CardHeader>

                                <CardContent className="relative z-10">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-2xl font-bold text-blue-600">₹{goal.savedAmount.toLocaleString()}</span>
                                        <span className="text-sm text-muted-foreground">Target: ₹{goal.targetAmount.toLocaleString()}</span>
                                    </div>

                                    <Progress value={percentage} className="h-2" indicatorClassName="bg-blue-600" />

                                    <div className="mt-4 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">{percentage.toFixed(1)}% Achieved</span>
                                        <Badge variant={isExpired ? "destructive" : "secondary"} className="font-normal">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {isExpired ? "Ended" : `${daysLeft} days left`}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
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
                                        {CATEGORIES.map(cat => (
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
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary">
                            Save {activeTab === 'budget' ? 'Budget' : 'Goal'}
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