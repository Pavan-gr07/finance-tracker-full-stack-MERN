"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Calendar
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// --- TYPES ---
interface ChartData {
    month: string;
    income: number;
    expense: number;
}

interface CategoryData {
    category: string;
    amount: number;
    color: string;
    [key: string]: any;
}

export default function DashboardScreen() {
    const [mounted, setMounted] = useState(false); // Prevent hydration errors with Recharts
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [pieData, setPieData] = useState<CategoryData[]>([]);

    useEffect(() => {
        setMounted(true);
        // Expanded Dummy Data for a better looking curve
        setChartData([
            { month: "Jan", income: 4000, expense: 2400 },
            { month: "Feb", income: 3000, expense: 1398 },
            { month: "Mar", income: 2000, expense: 5800 },
            { month: "Apr", income: 2780, expense: 3908 },
            { month: "May", income: 1890, expense: 4800 },
            { month: "Jun", income: 2390, expense: 3800 },
            { month: "Jul", income: 3490, expense: 4300 },
        ]);

        setPieData([
            { category: "Food", amount: 12000, color: "#10B981" }, // Emerald
            { category: "Travel", amount: 8000, color: "#3B82F6" }, // Blue
            { category: "Shopping", amount: 9000, color: "#F43F5E" }, // Rose
            { category: "Bills", amount: 4500, color: "#F59E0B" }, // Amber
        ]);
    }, []);

    if (!mounted) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your financial health</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="6months">
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
                    <Button>Download Report</Button>
                </div>
            </div>

            {/* 2. STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Balance"
                    value="₹1,24,500"
                    trend="+2.5%"
                    trendUp={true}
                    icon={Wallet}
                    description="vs last month"
                />
                <StatsCard
                    title="Total Income"
                    value="₹50,000"
                    trend="+12%"
                    trendUp={true}
                    icon={TrendingUp}
                    className="text-emerald-600"
                    description="vs last month"
                />
                <StatsCard
                    title="Total Expense"
                    value="₹32,000"
                    trend="-4%"
                    trendUp={false} // Good news for expense
                    goodTrend={true} // Lower is better
                    icon={TrendingDown}
                    className="text-rose-600"
                    description="vs last month"
                />
                <StatsCard
                    title="Savings"
                    value="₹18,000"
                    trend="+8%"
                    trendUp={true}
                    icon={PiggyBank}
                    className="text-blue-600"
                    description="approx. 36% rate"
                />
            </div>

            {/* 3. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Financial Overview (Area Chart) - Takes up 2 columns */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Financial Overview</CardTitle>
                                <CardDescription>Income vs Expense over time</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

                {/* RIGHT: Expense Structure (Donut Chart) - Takes up 1 column */}
                <Card className="flex flex-col shadow-sm">
                    <CardHeader>
                        <CardTitle>Spending Structure</CardTitle>
                        <CardDescription>Where your money goes</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                        cornerRadius={5}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold">₹33.5k</span>
                                <span className="text-xs text-muted-foreground">Total</span>
                            </div>
                        </div>
                    </CardContent>

                    {/* Custom Legend */}
                    <div className="p-6 pt-0 grid grid-cols-2 gap-2">
                        {pieData.map((item) => (
                            <div key={item.category} className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground flex-1">{item.category}</span>
                                <span className="font-medium">{(item.amount / 33500 * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

// 1. Sleek Stats Card
function StatsCard({ title, value, trend, trendUp, goodTrend, icon: Icon, className, description }: any) {
    // Logic: If trendUp is true (arrow up). If goodTrend is undefined, up is green. 
    // If goodTrend is true, then that specific direction is green.
    const isPositive = goodTrend ?? trendUp;
    const trendColor = isPositive ? "text-emerald-600 bg-emerald-95/50" : "text-rose-600 bg-rose-90/50";
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

// 2. Custom Chart Tooltip
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

// 3. Custom Pie Tooltip
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