"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Calendar,
    Loader2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { DashboardService, DashboardStatsResponse } from "@/services/dashboard-service";

// --- COLORS FOR PIE CHART ---
const COLORS = ["#10B981", "#3B82F6", "#F43F5E", "#F59E0B", "#8B5CF6", "#EC4899"];



export default function DashboardScreen() {
    // --- STATE ---
    const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("year");

    // --- FETCH DATA ---
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DashboardService.getStats(dateFilter);
            setStats(data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // --- DATA TRANSFORMATION FOR CHARTS ---

    // 1. Process Area Chart (Merge Income & Expense by Month)
    const areaChartData = useMemo(() => {
        if (!stats?.last12Months) return [];

        // Create a map to group by "Year-Month"
        const monthMap = new Map<string, { month: string, income: number, expense: number, sortKey: number }>();

        stats.last12Months.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;

            if (!monthMap.has(key)) {
                // Convert month number (1-12) to short name (Jan, Feb)
                const date = new Date(item._id.year, item._id.month - 1); // JS months are 0-11
                const monthName = date.toLocaleString('default', { month: 'short' });

                monthMap.set(key, {
                    month: monthName,
                    income: 0,
                    expense: 0,
                    sortKey: date.getTime() // For sorting chronologically
                });
            }

            const entry = monthMap.get(key)!;
            if (item.type === 'income') entry.income = item.total;
            else entry.expense = item.total;
        });

        // Convert Map to Array and Sort by Date
        return Array.from(monthMap.values()).sort((a, b) => a.sortKey - b.sortKey);
    }, [stats]);

    // 2. Process Pie Chart (Add Colors)
    const pieChartData = useMemo(() => {
        if (!stats?.categoryChart) return [];
        return stats.categoryChart.map((item, index) => ({
            name: item._id, // Category Name
            value: item.total,
            color: COLORS[index % COLORS.length]
        }));
    }, [stats]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your financial health</p>
                </div>
                <div className="flex items-center gap-2">

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current">This Month</SelectItem>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                            <SelectItem value="6months">Last 6 Months</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">Download Report</Button>
                </div>
            </div>

            {/* 2. STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Balance"
                    value={`₹${((stats?.totalIncome || 0) - (stats?.totalExpense || 0)).toLocaleString()}`}
                    trend="Lifetime"
                    trendUp={true}
                    icon={Wallet}
                    description="Net Worth"
                />
                <StatsCard
                    title="Total Income"
                    value={`₹${(stats?.totalIncome || 0).toLocaleString()}`}
                    trend="All Time"
                    trendUp={true}
                    icon={TrendingUp}
                    className="text-emerald-600"
                />
                <StatsCard
                    title="Total Expense"
                    value={`₹${(stats?.totalExpense || 0).toLocaleString()}`}
                    trend="All Time"
                    trendUp={false}
                    goodTrend={true}
                    icon={TrendingDown}
                    className="text-rose-600"
                />
                <StatsCard
                    title="This Month"
                    value={`₹${((stats?.monthSummary.monthIncome || 0) - (stats?.monthSummary.monthExpense || 0)).toLocaleString()}`}
                    trend="Active"
                    trendUp={true}
                    icon={PiggyBank}
                    className="text-blue-600"
                    description="Current Savings"
                />
            </div>

            {/* 3. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* AREA CHART */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Financial Trends</CardTitle>
                                <CardDescription>Income vs Expense over time</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#EF4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* PIE CHART */}
                <Card className="flex flex-col shadow-sm">
                    <CardHeader>
                        <CardTitle>Top Categories</CardTitle>
                        <CardDescription>Where your money goes</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <div className="h-[250px] relative">
                            {pieChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            cornerRadius={5}
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                    No expense data yet
                                </div>
                            )}

                            {/* Center Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold">
                                    ₹{stats?.totalExpense ? (stats.totalExpense / 1000).toFixed(1) + 'k' : '0'}
                                </span>
                                <span className="text-xs text-muted-foreground">Total Exp</span>
                            </div>
                        </div>
                    </CardContent>

                    {/* Legend */}
                    <div className="p-6 pt-0 grid grid-cols-2 gap-2">
                        {pieChartData.slice(0, 4).map((item) => (
                            <div key={item.name} className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground flex-1 truncate">{item.name}</span>
                                <span className="font-medium text-xs">
                                    {stats?.totalExpense ? ((item.value / stats.totalExpense) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS (Same as before, simplified for this file) ---

function StatsCard({ title, value, trend, trendUp, goodTrend, icon: Icon, className, description }: any) {
    const isPositive = goodTrend ?? trendUp;
    const trendColor = isPositive ? "text-emerald-600 bg-emerald-95/50" : "text-rose-600 bg-rose-100/50";
    const TrendIcon = trendUp ? ArrowUpRight : ArrowDownRight;

    return (
        <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-full ${className ? `bg-opacity-10 ${className.replace('text-', 'bg-')}` : 'bg-secondary'}`}>
                    <Icon className={`h-4 w-4 ${className}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={`${trendColor} border-none px-1.5`}>
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {trend}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium">Income:</span>
                        <span>₹{payload[0].value.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-600">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-medium">Expense:</span>
                        <span>₹{payload[1].value.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                    <span className="font-medium">{payload[0].name}:</span>
                    <span>₹{payload[0].value.toLocaleString()}</span>
                </div>
            </div>
        );
    }
    return null;
};