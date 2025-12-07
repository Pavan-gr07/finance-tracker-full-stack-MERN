"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    CheckCheck,
    Trash2,
    AlertTriangle,
    Trophy,
    Info,
    CreditCard,
    X,
    ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- TYPES ---
type NotificationType = "budget_alert" | "goal_milestone" | "system" | "bill_reminder";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionLabel?: string;
    actionLink?: string; // URL to navigate to
}

// --- MOCK DATA ---
const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "budget_alert",
        title: "Budget Critical 🚨",
        message: "You have exceeded 90% of your 'Groceries' budget.",
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
        read: false,
        actionLabel: "Review Budget",
        actionLink: "/budgets"
    },
    {
        id: "2",
        type: "goal_milestone",
        title: "Goal Reached! 🎉",
        message: "Congratulations! You hit 50% of your 'New Car' savings goal.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: false,
        actionLabel: "View Goal",
        actionLink: "/goals"
    },
    {
        id: "3",
        type: "bill_reminder",
        title: "Upcoming Bill",
        message: "Netflix subscription (₹499) is due tomorrow.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        actionLabel: "Pay Now",
        actionLink: "/transactions"
    },
    {
        id: "4",
        type: "system",
        title: "System Update",
        message: "We've updated our privacy policy. Please review the changes.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
    }
];

export default function NotificationCenter() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => !n.read).length;

    // --- ACTIONS ---

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleNotificationClick = (n: Notification) => {
        // 1. Mark read
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));

        // 2. Close drawer
        setIsOpen(false);

        // 3. Navigate
        if (n.actionLink) {
            router.push(n.actionLink);
        } else {
            // Smart fallback navigation
            switch (n.type) {
                case "budget_alert": router.push("/budgets"); break;
                case "goal_milestone": router.push("/goals"); break;
                case "bill_reminder": router.push("/transactions"); break;
                default: break;
            }
        }
    };

    // --- UI HELPERS ---

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "budget_alert": return <AlertTriangle className="h-5 w-5 text-rose-500" />;
            case "goal_milestone": return <Trophy className="h-5 w-5 text-amber-500" />;
            case "bill_reminder": return <CreditCard className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-slate-500" />;
        }
    };

    // --- SUB-COMPONENT: LIST ITEM ---
    const NotificationItem = ({ item }: { item: Notification }) => (
        <div
            onClick={() => handleNotificationClick(item)}
            className={cn(
                "group flex gap-4 p-4 border-b transition-all hover:bg-muted/50 cursor-pointer relative",
                !item.read
                    ? "bg-blue-50/60 dark:bg-blue-900/10 border-l-[3px] border-l-blue-500"
                    : "bg-transparent border-l-[3px] border-l-transparent"
            )}
        >
            {/* Icon Box */}
            <div className={cn(
                "mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105",
                "bg-white dark:bg-slate-950"
            )}>
                {getIcon(item.type)}
            </div>

            {/* Text Content */}
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <p className={cn("text-sm font-medium leading-none", !item.read && "text-foreground font-semibold")}>
                        {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                </p>

                {/* Action Link (Visual) */}
                {item.actionLabel && (
                    <div className="pt-1 flex items-center text-[11px] font-medium text-primary opacity-90 group-hover:opacity-100 transition-opacity">
                        {item.actionLabel} <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                )}
            </div>

            {/* Delete Button (Hidden until hover) */}
            <div className="flex flex-col items-end gap-2">
                {!item.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20" />
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>

            {/* TRIGGER BUTTON */}
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-background"></span>
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            {/* DRAWER CONTENT */}
            <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col gap-0 border-l shadow-2xl">

                {/* Header */}
                <SheetHeader className="p-4 border-b bg-muted/30 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between mr-6">
                        <SheetTitle className="flex items-center gap-2 text-lg">
                            Notifications
                            {unreadCount > 0 && (
                                <Badge className="bg-blue-600 hover:bg-blue-700 px-1.5 h-5 min-w-[1.25rem] text-[10px]">
                                    {unreadCount}
                                </Badge>
                            )}
                        </SheetTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-blue-600 px-2"
                                onClick={markAllRead}
                            >
                                <CheckCheck className="mr-1.5 h-3 w-3" /> Mark all read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                {/* Filter Tabs */}
                <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 py-2 border-b bg-background">
                        <TabsList className="grid w-full grid-cols-3 h-9">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                            <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* List Area */}
                    <ScrollArea className="flex-1">
                        <TabsContent value="all" className="m-0">
                            {notifications.length === 0 ? <EmptyState /> : notifications.map(n => <NotificationItem key={n.id} item={n} />)}
                        </TabsContent>
                        <TabsContent value="unread" className="m-0">
                            {notifications.filter(n => !n.read).length === 0 ? <EmptyState text="No unread messages" /> : notifications.filter(n => !n.read).map(n => <NotificationItem key={n.id} item={n} />)}
                        </TabsContent>
                        <TabsContent value="alerts" className="m-0">
                            {notifications.filter(n => n.type === 'budget_alert').length === 0 ? <EmptyState text="No active alerts" icon={AlertTriangle} /> : notifications.filter(n => n.type === 'budget_alert').map(n => <NotificationItem key={n.id} item={n} />)}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                {/* Footer Actions */}
                <SheetFooter className="p-4 border-t bg-muted/10 sm:justify-center flex-col gap-2">
                    <Button
                        variant="default"
                        className="w-full gap-2 shadow-sm"
                        onClick={() => { setIsOpen(false); router.push("/notifications"); }}
                    >
                        View Full History
                    </Button>
                    <div className="flex justify-center">
                        <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-red-600 h-auto py-1"
                            onClick={() => setNotifications([])}
                        >
                            <Trash2 className="mr-1.5 h-3 w-3" /> Clear All Notifications
                        </Button>
                    </div>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}

// --- EMPTY STATE HELPER ---
function EmptyState({ text = "You're all caught up!", icon: Icon = Bell }: { text?: string, icon?: any }) {
    return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground">No Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                {text}
            </p>
        </div>
    );
}