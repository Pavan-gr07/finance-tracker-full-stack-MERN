"use client";

import { useState } from "react";
import {
    User,
    Lock,
    Shield,
    Globe,
    Bell,
    LogOut,
    Camera,
    Smartphone,
    Laptop,
    Trash2,
    Download,
    Moon,
    Sun,
    CreditCard,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function ProfileSettingsScreen() {
    const [activeTab, setActiveTab] = useState("general");
    const [isLoading, setIsLoading] = useState(false);

    // Mock Save Handler
    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-2 md:p-6 max-w-7xl mx-auto min-h-[80vh]">

            {/* 1. SIDEBAR NAVIGATION */}
            <aside className="w-full md:w-[280px] space-y-4">
                <div className="px-4 py-2">
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>

                <nav className="flex flex-col gap-1 px-2">
                    <NavButton
                        active={activeTab === 'general'}
                        onClick={() => setActiveTab('general')}
                        icon={User}
                        label="General"
                    />
                    <NavButton
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                        icon={Shield}
                        label="Security"
                    />
                    <NavButton
                        active={activeTab === 'preferences'}
                        onClick={() => setActiveTab('preferences')}
                        icon={Globe}
                        label="Preferences"
                    />
                </nav>

                <div className="mt-auto px-4 pt-4">
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 space-y-6">

                {/* --- TAB: GENERAL --- */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your photo and personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6">
                                    <div className="relative group cursor-pointer">
                                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                            <AvatarImage src="/placeholder-user.jpg" />
                                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">JD</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Profile Photo</h3>
                                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="secondary">Upload New</Button>
                                            <Button size="sm" variant="ghost" className="text-red-500">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input defaultValue="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input defaultValue="Doe" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Input defaultValue="john.doe@example.com" className="pr-10" />
                                            <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Your email is verified.</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Bio (Optional)</Label>
                                        <Textarea placeholder="Tell us a little about yourself..." className="resize-none" />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- TAB: SECURITY --- */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

                        {/* Password Change */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Password & Authentication</CardTitle>
                                <CardDescription>Manage your access security.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input type="password" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input type="password" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button variant="outline">Update Password</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2FA Toggle */}
                        <Card>
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">Secure your account with 2FA.</p>
                                    </div>
                                </div>
                                <Switch />
                            </div>
                        </Card>

                        {/* Active Sessions - PRO FEATURE */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>Where you're currently logged in.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <SessionItem
                                    device="Chrome on macOS"
                                    location="Bengaluru, India"
                                    ip="192.168.1.1"
                                    active={true}
                                    icon={Laptop}
                                />
                                <Separator />
                                <SessionItem
                                    device="iPhone 14 Pro"
                                    location="Bengaluru, India"
                                    ip="10.0.0.4"
                                    active={false}
                                    time="Active 2 hours ago"
                                    icon={Smartphone}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- TAB: PREFERENCES --- */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>App Preferences</CardTitle>
                                <CardDescription>Customize your experience.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Currency */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Primary Currency</Label>
                                        <p className="text-sm text-muted-foreground">Used for all dashboards.</p>
                                    </div>
                                    <Select defaultValue="inr">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="inr">🇮🇳 INR (₹)</SelectItem>
                                            <SelectItem value="usd">🇺🇸 USD ($)</SelectItem>
                                            <SelectItem value="eur">🇪🇺 EUR (€)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* Theme */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Theme</Label>
                                        <p className="text-sm text-muted-foreground">Select your interface appearance.</p>
                                    </div>
                                    <div className="flex items-center bg-muted rounded-full p-1 border">
                                        <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 bg-background shadow-sm">
                                            <Sun className="mr-2 h-3 w-3" /> Light
                                        </Button>
                                        <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-muted-foreground">
                                            <Moon className="mr-2 h-3 w-3" /> Dark
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Management */}
                        <Card className="border-red-100 dark:border-red-900/30">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50/50 rounded-lg dark:bg-red-950/10 dark:border-red-900/50">
                                    <div>
                                        <h4 className="font-medium text-red-900 dark:text-red-200">Delete Account</h4>
                                        <p className="text-xs text-red-700 dark:text-red-400">Permanently remove all data.</p>
                                    </div>
                                    <Button variant="destructive" size="sm">Delete</Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Export Data</h4>
                                        <p className="text-xs text-muted-foreground">Download all transactions as CSV.</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" /> Export CSV
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function NavButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <Button
            variant={active ? "secondary" : "ghost"}
            className={cn(
                "w-full justify-start gap-2 h-10",
                active ? "font-semibold bg-secondary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Button>
    );
}

function SessionItem({ device, location, ip, active, time, icon: Icon }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-full">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{device}</p>
                        {active && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] h-5 px-1.5 border-none">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{location} • {ip}</p>
                </div>
            </div>
            {!active && (
                <p className="text-xs text-muted-foreground">{time}</p>
            )}
            {active ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20" />
            ) : (
                <Button variant="ghost" size="sm" className="h-8 text-xs">Revoke</Button>
            )}
        </div>
    );
}