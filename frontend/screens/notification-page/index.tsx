"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Filter,
    Trash2,
    CheckCheck,
    Download,
    AlertTriangle,
    Trophy,
    CreditCard,
    Info,
    ChevronDown,
    ChevronUp,
    Loader2,
    Clock
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { NotificationService, NotificationItem } from "@/services/notification-service";
import NotificationSettingsModal from "./NotificationSettingsModal";

export default function NotificationHistoryScreen() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showSettings, setShowSettings] = useState(false);

    // --- FETCH DATA ---
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getAll();
            setNotifications(data);
        } catch (error) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // --- FILTERING & GROUPING ---
    const filteredData = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = (n.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
                (n.message?.toLowerCase() || "").includes(search.toLowerCase());
            const matchesType = filterType === 'all' ? true :
                filterType === 'unread' ? !n.read : true;
            return matchesSearch && matchesType;
        });
    }, [notifications, search, filterType]);

    const groupedNotifications = useMemo(() => {
        const groups: Record<string, NotificationItem[]> = { Today: [], Yesterday: [], Older: [] };

        filteredData.forEach(n => {
            const date = new Date(n.createdAt);
            if (isToday(date)) groups.Today.push(n);
            else if (isYesterday(date)) groups.Yesterday.push(n);
            else groups.Older.push(n);
        });
        return groups;
    }, [filteredData]);

    // --- HANDLERS ---
    const handleMarkRead = async (id: string) => {
        try {
            await NotificationService.markRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (e) { toast.error("Failed to update"); }
    };

    const handleBulkRead = async () => {
        // In a real app, send array of IDs to backend. For now, we simulate or iterate.
        // Since your backend supports 'all', we can use that if all selected, or loop.
        // Ideally update backend to accept { ids: string[] }
        try {
            await NotificationService.markRead("all");
            toast.success("Selected marked as read");
            setNotifications(prev => prev.map(n => selectedIds.includes(n._id) ? { ...n, read: true } : n));
            setSelectedIds([]);
        } catch (e) {
            toast.error("Failed to update");
            return;
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 p-2 md:p-6 max-w-5xl mx-auto">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notification History</h1>
                    <p className="text-muted-foreground">Manage your alerts and activity logs.</p>
                </div>
                {/* <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export Log
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => setShowSettings(true)}>
                        Notification Settings
                    </Button>
                </div> */}
            </div>

            {/* TOOLBAR */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
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
                                {filterType === 'all' ? 'All Filters' : 'Unread'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setFilterType('all')}>All Notifications</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType('unread')}>Unread Only</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <span className="text-sm text-muted-foreground mr-2">{selectedIds.length} selected</span>
                        <Button size="sm" variant="secondary" onClick={handleBulkRead}>
                            <CheckCheck className="mr-2 h-3 w-3" /> Mark Read
                        </Button>
                        <Button size="sm" variant="destructive">
                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                        </Button>
                    </div>
                )}
            </Card>

            {/* GROUPS */}
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
                                        key={item._id}
                                        item={item}
                                        isSelected={selectedIds.includes(item._id)}
                                        onToggle={() => toggleSelect(item._id)}
                                        onRead={() => handleMarkRead(item._id)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredData.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No notifications found matching your filters.</p>
                    </div>
                )}
            </div>
            {
                showSettings && (
                    <NotificationSettingsModal open={showSettings} onOpenChange={setShowSettings} />
                )
            }
        </div>
    );
}


// --- SUB-COMPONENT: EXPANDABLE CARD ---
function ExpandableNotificationCard({ item, isSelected, onToggle, onRead }: { item: NotificationItem, isSelected: boolean, onToggle: () => void, onRead: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case "budget_alert": return <AlertTriangle className="h-5 w-5 text-rose-500" />;
            case "goal_milestone": return <Trophy className="h-5 w-5 text-amber-500" />;
            case "bill_reminder": return <CreditCard className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-slate-500" />;
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div
                className={`
                    group flex flex-col bg-card border rounded-lg transition-all
                    ${!item.read ? 'border-l-4 border-l-blue-500 shadow-sm bg-blue-50/5' : 'border-l-4 border-l-transparent hover:border-l-muted'}
                    ${isSelected ? 'bg-muted/40 border-blue-200' : ''}
                `}
                onClick={() => { if (!item.read) onRead(); }} // Mark read on click
            >

                {/* Main Row */}
                <div className="flex items-center gap-4 p-4">
                    {/* Checkbox */}
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) => { onToggle(); }}
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                    />

                    {/* Icon */}
                    <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center shrink-0 border">
                        {getIcon(item.type)}
                    </div>

                    {/* Text */}
                    <div className="flex-1 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-medium ${!item.read ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                {item.title}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(item.createdAt), "h:mm a")}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.message}</p>
                    </div>

                    {/* Expand Chevron */}
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                </div>

                {/* Expanded Content (Details) */}
                <CollapsibleContent>
                    <div className="px-16 pb-4 pt-0">
                        <div className="bg-muted/30 p-4 rounded-md text-sm text-foreground/80 space-y-3 border">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>ID: {item._id}</span>
                                <span>{format(new Date(item.createdAt), "PPP p")}</span>
                            </div>

                            <Separator />

                            <p className="font-medium">Details:</p>

                            {/* Render Payload Dynamically if it exists */}
                            {item.payload ? (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(item.payload).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-muted-foreground capitalize">{key}:</span>
                                            <span className="font-medium">
                                                {/* Format currency if key suggests money */}
                                                {(key === 'limit' || key === 'spent' || key === 'amount') && typeof value === 'number'
                                                    ? `₹${value.toLocaleString()}`
                                                    : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">No additional details.</p>
                            )}

                            <div className="pt-2 flex gap-2">
                                <Button size="sm" variant="secondary" className="text-xs h-7">View Related Record</Button>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}