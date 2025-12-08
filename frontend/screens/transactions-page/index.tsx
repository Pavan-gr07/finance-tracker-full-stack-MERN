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
import { toast } from "sonner";

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
import { TransactionService, TransactionStats } from "@/services/transaction-service";
import { Transaction } from "@/types/transaction";

export default function TransactionsScreen() {
    // --- STATE ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // New State for Backend Stats
    const [stats, setStats] = useState<TransactionStats>({ income: 0, expense: 0, balance: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [currentTxn, setCurrentTxn] = useState<Transaction | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // --- API FETCH ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await TransactionService.getAll();

            // 1. Set the list
            setTransactions(data.txns || []);

            // 2. Set the stats (From Backend!)
            setStats(data.stats || { income: 0, expense: 0, balance: 0 });

        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast.error("Could not load transactions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- DERIVED STATE (Only filtering/sorting now) ---
    const filteredAndSortedTransactions = useMemo(() => {
        if (!Array.isArray(transactions)) return [];

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

            {/* 1. DASHBOARD STATS CARDS (Using Backend Data) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        {/* Using stats.balance directly */}
                        <div className="text-2xl font-bold">₹{stats.balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Based on current filters</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-emerald-950/20 dark:to-slate-950 border-green-100 dark:border-emerald-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">₹{stats.income.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-rose-950/20 dark:to-slate-950 border-red-100 dark:border-rose-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">₹{stats.expense.toLocaleString()}</div>
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
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-background border-muted"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 border-dashed">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                                {typeFilter !== 'all' && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">1</Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={typeFilter === 'all'} onCheckedChange={() => setTypeFilter('all')}>
                                All Transactions
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={typeFilter === 'income'} onCheckedChange={() => setTypeFilter(typeFilter === 'income' ? 'all' : 'income')}>
                                Income Only
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={typeFilter === 'expense'} onCheckedChange={() => setTypeFilter(typeFilter === 'expense' ? 'all' : 'expense')}>
                                Expense Only
                            </DropdownMenuCheckboxItem>
                            {typeFilter !== 'all' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="justify-center text-center text-sm p-2 text-red-500 cursor-pointer" onSelect={() => setTypeFilter('all')}>
                                        Clear Filters
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                        <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </Button>

                    <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>

            {/* 3. TABLE */}
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
                                            {new Date(txn.date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell><div className="font-medium">{txn.notes || "Untitled"}</div></TableCell>
                                    <TableCell><Badge variant="secondary" className="rounded-md font-normal">{txn.category}</Badge></TableCell>
                                    <TableCell>
                                        <Badge className={`${txn.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"} border-none shadow-none`}>
                                            {txn.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-bold ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 cursor-pointer">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEdit(txn)}>Edit Transaction</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(txn._id)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <p className="font-medium text-lg">No transactions found</p>
                                    <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); }}>Clear all filters</Button>
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
                onSuccess={fetchData}
            />

            <DeleteConfirmModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                id={deleteId}
                onSuccess={fetchData}
            />
        </div>
    );
}