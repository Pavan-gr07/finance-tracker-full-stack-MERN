"use client";

import { useState, useEffect } from "react";
import {
    User, Lock, Shield, Globe, Bell, LogOut, Camera,
    Smartphone, Laptop, Trash2, Download, CheckCircle2, Loader2, Moon, Sun
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes"; // For Theme Toggle

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

import { UserService, UserProfile } from "@/services/user-service";
import { AuthService } from "@/services/auth-service";

export default function ProfileSettingsScreen() {
    const { setTheme, theme } = useTheme();

    // --- STATE ---
    const [activeTab, setActiveTab] = useState("general");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Form States
    const [formData, setFormData] = useState({ name: "", email: "", bio: "" });
    const [currency, setCurrency] = useState("INR");
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });



    const loadProfile = async () => {
        try {
            const data = await UserService.getProfile();
            setUser(data);
            setFormData({ name: data.name, email: data.email, bio: data?.bio }); // Add bio to schema if needed
            setCurrency(data.settings?.currency || "INR");
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleUpdateProfile = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                bio: formData.bio,
                // settings: { currency } // We can send currency here or in preferences
            };
            const updatedUser = await UserService.updateProfile(payload);
            setUser(updatedUser);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePreferences = async (newCurrency: string) => {
        setCurrency(newCurrency);
        // Auto-save preference on change
        try {
            await UserService.updateProfile({ settings: { currency: newCurrency } });
            toast.success("Currency updated");
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        setIsSaving(true);
        try {
            await UserService.changePassword({
                oldPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success("Password changed successfully");
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (error: any) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        AuthService.logout();
    };

    // --- FETCH DATA ---
    useEffect(() => {
        loadProfile();
    }, []);

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 p-2 md:p-6 max-w-7xl mx-auto min-h-[80vh]">

            {/* 1. SIDEBAR NAVIGATION */}
            <aside className="w-full md:w-[250px] space-y-4">
                <div className="px-4 py-2">
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">Manage your account.</p>
                </div>

                <nav className="flex flex-col gap-1 px-2">
                    <NavButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={User} label="General" />
                    <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Security" />
                    <NavButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} icon={Globe} label="Preferences" />
                </nav>

                <div className="mt-auto px-4 pt-4">
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
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
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                                {user?.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Profile Photo</h3>
                                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                                        <Button size="sm" variant="secondary" className="mt-2" disabled>Upload New</Button>
                                    </div>
                                </div>
                                {/* <div className="flex items-center gap-6">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
            />

            <div 
                className="relative group cursor-pointer"
                onClick={handleButtonClick}
            >
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={previewUrl || user?.avatar} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {user?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="font-medium">Profile Photo</h3>
                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="mt-2"
                    onClick={handleButtonClick}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload New"}
                </Button>
            </div>
        </div> */}
                                <Separator />

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Input value={formData.email} disabled className="pr-10 bg-muted" />
                                            <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Bio (Optional)</Label>
                                        <Textarea
                                            placeholder="Tell us a little about yourself..."
                                            className="resize-none"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleUpdateProfile} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
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
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button variant="outline" onClick={handleChangePassword} disabled={isSaving}>Update Password</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Sessions (Mock for Visuals) */}
                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>Devices logged into your account.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <SessionItem
                                    device="Chrome on Windows"
                                    location="Bengaluru, India"
                                    ip="192.168.1.1"
                                    active={true}
                                    icon={Laptop}
                                />
                                <Separator />
                                <SessionItem
                                    device="iPhone 15"
                                    location="Bengaluru, India"
                                    ip="10.0.0.4"
                                    active={false}
                                    time="Active 2 hours ago"
                                    icon={Smartphone}
                                />
                            </CardContent>
                        </Card> */}
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
                                    <h3>{currency}</h3>
                                    {/* <Select value={currency} onValueChange={handleUpdatePreferences}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">🇮🇳 INR (₹)</SelectItem>
                                            <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                                            <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                                        </SelectContent>
                                    </Select> */}
                                </div>

                                <Separator />

                                {/* Theme */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Theme</Label>
                                        <p className="text-sm text-muted-foreground">Select your interface appearance.</p>
                                    </div>
                                    <div className="flex items-center bg-muted rounded-full p-1 border">
                                        <Button
                                            variant={theme === 'light' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="rounded-full h-8 px-3"
                                            onClick={() => setTheme("light")}
                                        >
                                            <Sun className="mr-2 h-3 w-3" /> Light
                                        </Button>
                                        <Button
                                            variant={theme === 'dark' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="rounded-full h-8 px-3"
                                            onClick={() => setTheme("dark")}
                                        >
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
                                    <Button variant="destructive" size="sm" disabled>Delete</Button>
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