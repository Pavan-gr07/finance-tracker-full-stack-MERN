"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    Wallet,
    Calendar as CalendarIcon,
    Loader2
} from "lucide-react";
import { toast } from "sonner"; // Assuming you have sonner installed for notifications

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import AddEditTransactionModal from "./AddEditTransactionModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { TransactionService } from "@/services/transaction-service";
import type { Transaction } from "@/types/transaction";

export default function TransactionsScreen() {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Advanced Filters State
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

    // Modal State
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [currentTxn, setCurrentTxn] = useState<Transaction | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // --- API: FETCH DATA ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // In a real app, you might pass sort/filter params directly to the API
            // e.g. TransactionService.getAll({ type: typeFilter })
            const data = await TransactionService.getAll();
            setTransactions(data?.txns);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast.error("Could not load transactions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 🧠 Derived State (Filtering & Sorting Client-Side)
    // Note: For large datasets, move filtering/sorting to the Backend API
    const filteredAndSortedTransactions = useMemo(() => {

        if (!Array.isArray(transactions)) {
            return [];
        }
        let result = [...transactions];

        // 1. Text Search
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter((txn) =>
                txn.category.toLowerCase().includes(lowerSearch) ||
                txn.notes?.toLowerCase().includes(lowerSearch)
            );
        }

        // 2. Type Filter
        if (typeFilter !== "all") {
            result = result.filter((txn) => txn.type === typeFilter);
        }

        // 3. Sorting (Date)
        result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        return result;
    }, [transactions, search, typeFilter, sortOrder]);

    // 📊 Stats Calculation
    // 📊 Stats Calculation
    const stats = useMemo(() => {
        // FIX: Return an object with zeros, NOT an empty array
        if (!Array.isArray(transactions)) {
            return { income: 0, expense: 0, balance: 0 };
        }

        const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

        return { income, expense, balance: income - expense };
    }, [transactions]);

    // Handlers
    const openEdit = (txn: Transaction) => {
        setCurrentTxn(txn);
        setOpenModal(true);
    };

    const openAdd = () => {
        setCurrentTxn(null);
        setOpenModal(true);
    };

    return (
        <div className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto">

            {/* 1. DASHBOARD STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats?.balance?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Based on current view</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-emerald-950/20 dark:to-slate-950 border-green-100 dark:border-emerald-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">₹{stats?.income.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">{transactions?.filter(t => t.type === 'income').length} transactions</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-rose-950/20 dark:to-slate-950 border-red-100 dark:border-rose-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">₹{stats?.expense.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">{transactions.filter(t => t.type === 'expense').length} transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. ADVANCED TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                    <Badge variant="outline" className="ml-2">
                        {filteredAndSortedTransactions.length}
                    </Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search with Icon */}
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-background border-muted"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 border-dashed">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                                {typeFilter !== 'all' && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">
                                        1
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={typeFilter === 'all'}
                                onCheckedChange={() => setTypeFilter('all')}
                            >
                                All Transactions
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={typeFilter === 'income'}
                                onCheckedChange={() => setTypeFilter(typeFilter === 'income' ? 'all' : 'income')}
                            >
                                Income Only
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={typeFilter === 'expense'}
                                onCheckedChange={() => setTypeFilter(typeFilter === 'expense' ? 'all' : 'expense')}
                            >
                                Expense Only
                            </DropdownMenuCheckboxItem>

                            {typeFilter !== 'all' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="justify-center text-center text-sm p-2 text-red-500 cursor-pointer"
                                        onSelect={() => setTypeFilter('all')}
                                    >
                                        Clear Filters
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        title="Sort by Date"
                    >
                        <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </Button>

                    <Button onClick={openAdd} className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>

            {/* 3. STUNNING DATA TABLE */}
            <Card className="overflow-hidden border-none shadow-md">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" /> Loading transactions...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAndSortedTransactions.length > 0 ? (
                            filteredAndSortedTransactions.map((txn) => (
                                <TableRow key={txn._id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-3 w-3" />
                                            {new Date(txn.date).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="font-medium">{txn.notes || "Untitled Transaction"}</div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="secondary" className="rounded-md font-normal">
                                            {txn.category}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        {txn.type === "income" ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none dark:bg-emerald-900/30 dark:text-emerald-400">
                                                Income
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none shadow-none dark:bg-rose-900/30 dark:text-rose-400">
                                                Expense
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className={`font-bold ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEdit(txn)}>
                                                    Edit Transaction
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setDeleteId(txn._id)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="bg-muted/50 p-4 rounded-full mb-3">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="font-medium text-lg">No transactions found</p>
                                        <p className="text-sm">Try adjusting your filters or search query.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => { setSearch(""); setTypeFilter("all"); }}
                                            className="mt-2 text-primary"
                                        >
                                            Clear all filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* MODALS */}
            <AddEditTransactionModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                txn={currentTxn}
                onSuccess={fetchData} // Refresh list on save
            />

            <DeleteConfirmModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                id={deleteId}
                onSuccess={fetchData} // Refresh list on delete
            />
        </div>
    );
}