"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Filter,
    Trash2,
    CheckCheck,
    MoreHorizontal,
    Download,
    Calendar as CalendarIcon,
    AlertTriangle,
    Trophy,
    CreditCard,
    Info,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import NotificationSettingsModal from "./NotificationSettingsModal";

// --- TYPES ---
type NotificationType = "budget_alert" | "goal_milestone" | "system" | "bill_reminder";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    details?: string; // Extended details for the full view
    timestamp: Date;
    read: boolean;
    amount?: number; // Optional context
}

// --- MOCK DATA (Expanded) ---
const MOCK_DATA: Notification[] = [
    {
        id: "1", type: "budget_alert", title: "Budget Critical: Groceries",
        message: "You have exceeded 90% of your budget.",
        details: "Budget Limit: ₹20,000 | Spent: ₹18,500. You only have ₹1,500 left for the remaining 12 days.",
        timestamp: new Date(), read: false, amount: 18500
    },
    {
        id: "2", type: "goal_milestone", title: "Goal Reached: New Car",
        message: "You hit 50% of your target!",
        details: "Great job! You have saved ₹2,50,000 out of ₹5,00,000. Keep it up!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: false
    },
    {
        id: "3", type: "bill_reminder", title: "Netflix Subscription",
        message: "Payment due tomorrow.",
        details: "Amount: ₹499. Auto-debit is enabled.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true, amount: 499
    },
    {
        id: "4", type: "system", title: "Security Alert",
        message: "New login detected from Mac OS.",
        details: "Location: Bengaluru, India. IP: 192.168.1.1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), read: true
    },
    {
        id: "5", type: "budget_alert", title: "Budget Exceeded: Entertainment",
        message: "You are 110% over budget.",
        details: "Limit: ₹5,000 | Spent: ₹5,500.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50), read: true
    }
];

export default function NotificationHistoryScreen() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_DATA);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<string>("all"); // all, unread, alerts
    const [showSettings, setShowSettings] = useState(false);

    // --- DERIVED STATE (Filtering & Grouping) ---
    const filteredData = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                n.message.toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === 'all' ? true :
                filterType === 'unread' ? !n.read :
                    filterType === 'alerts' ? n.type === 'budget_alert' : true;
            return matchesSearch && matchesType;
        });
    }, [notifications, search, filterType]);

    // Group by Date
    const groupedNotifications = useMemo(() => {
        const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], Older: [] };

        filteredData.forEach(n => {
            if (isToday(n.timestamp)) groups.Today.push(n);
            else if (isYesterday(n.timestamp)) groups.Yesterday.push(n);
            else groups.Older.push(n);
        });
        return groups;
    }, [filteredData]);

    // --- HANDLERS ---
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredData.length) setSelectedIds([]);
        else setSelectedIds(filteredData.map(n => n.id));
    };

    const deleteSelected = () => {
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
        setSelectedIds([]);
    };

    const markSelectedRead = () => {
        setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, read: true } : n));
        setSelectedIds([]);
    };

    return (
        <div className="space-y-6 p-2 md:p-6 max-w-5xl mx-auto">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notification History</h1>
                    <p className="text-muted-foreground">Manage your alerts and activity logs.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => console.log("Export CSV")}>
                        <Download className="mr-2 h-4 w-4" /> Export Log
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                        onClick={() => setShowSettings(true)}
                    >
                        Notification Settings
                    </Button>
                </div>
            </div>

            {/* 2. ADVANCED TOOLBAR */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">

                {/* Left: Search & Filter */}
                <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9 bg-muted/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-dashed">
                                <Filter className="mr-2 h-4 w-4" />
                                {filterType === 'all' ? 'All Filters' : filterType === 'unread' ? 'Unread' : 'Alerts'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setFilterType('all')}>All Notifications</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType('unread')}>Unread Only</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType('alerts')}>Budget Alerts</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Right: Bulk Actions (Appears only when items selected) */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <span className="text-sm text-muted-foreground mr-2">{selectedIds.length} selected</span>
                        <Button size="sm" variant="secondary" onClick={markSelectedRead}>
                            <CheckCheck className="mr-2 h-3 w-3" /> Mark Read
                        </Button>
                        <Button size="sm" variant="destructive" onClick={deleteSelected}>
                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                        </Button>
                    </div>
                )}
            </Card>

            {/* 3. NOTIFICATION LIST GROUPS */}
            <div className="space-y-8">
                {Object.entries(groupedNotifications).map(([group, items]) => {
                    if (items.length === 0) return null;
                    return (
                        <div key={group} className="space-y-3">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group}</h3>
                                <Separator className="flex-1" />
                            </div>

                            <div className="grid gap-2">
                                {items.map(item => (
                                    <ExpandableNotificationCard
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedIds.includes(item.id)}
                                        onToggle={() => toggleSelect(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredData.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <p>No notifications found matching your filters.</p>
                    </div>
                )}
            </div>
            {/* 4. Render Modal */}
            {
                showSettings && (
                    <NotificationSettingsModal open={showSettings} onOpenChange={setShowSettings} />
                )}
        </div>
    );
}

// --- SUB-COMPONENT: EXPANDABLE CARD ---
function ExpandableNotificationCard({ item, isSelected, onToggle }: { item: Notification, isSelected: boolean, onToggle: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "budget_alert": return <AlertTriangle className="h-5 w-5 text-rose-500" />;
            case "goal_milestone": return <Trophy className="h-5 w-5 text-amber-500" />;
            case "bill_reminder": return <CreditCard className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-slate-500" />;
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className={`
                group flex flex-col bg-card border rounded-lg transition-all
                ${!item.read ? 'border-l-4 border-l-blue-500 shadow-sm' : 'border-l-4 border-l-transparent hover:border-l-muted'}
                ${isSelected ? 'bg-blue-50/50 border-blue-200' : ''}
            `}>

                {/* Main Row */}
                <div className="flex items-center gap-4 p-4">
                    {/* Checkbox */}
                    <Checkbox checked={isSelected} onCheckedChange={onToggle} />

                    {/* Icon */}
                    <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                        {getIcon(item.type)}
                    </div>

                    {/* Text */}
                    <div className="flex-1 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-medium ${!item.read ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                {item.title}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                {format(item.timestamp, "h:mm a")}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.message}</p>
                    </div>

                    {/* Expand Chevron */}
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                </div>

                {/* Expanded Content */}
                <CollapsibleContent>
                    <div className="px-14 pb-4 pt-0">
                        <div className="bg-muted/30 p-4 rounded-md text-sm text-foreground/80 space-y-2 border">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>ID: {item.id}</span>
                                <span>{format(item.timestamp, "PPP p")}</span>
                            </div>
                            <Separator />
                            <p className="font-medium pt-2">Additional Details:</p>
                            <p>{item.details || "No additional details available for this alert."}</p>

                            {item.amount && (
                                <Badge variant="outline" className="mt-2">
                                    Amount Involved: ₹{item.amount.toLocaleString()}
                                </Badge>
                            )}

                            <div className="pt-2 flex gap-2">
                                <Button size="sm" variant="secondary" className="text-xs h-7">View Related Record</Button>
                                <Button size="sm" variant="ghost" className="text-xs h-7">Report Issue</Button>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}