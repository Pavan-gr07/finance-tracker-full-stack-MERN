"use client";

import { useState } from "react";
import {
    Bell,
    Mail,
    Smartphone,
    Shield,
    Wallet,
    Target,
    Clock,
    Moon
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider"; // Ensure you have slider from shadcn

interface NotificationSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function NotificationSettingsModal({ open, onOpenChange }: NotificationSettingsProps) {
    // State for toggles (In real app, load this from User Profile API)
    const [settings, setSettings] = useState({
        email: true,
        push: true,
        budgetAlerts: true,
        budgetThreshold: [80], // Alert when 80% used
        goalMilestones: true,
        billReminders: true,
        weeklyReport: false,
        securityAlerts: true, // Usually forced ON, but shown for transparency
    });

    const handleSave = () => {
        console.log("Saving preferences:", settings);
        // await api.updateSettings(settings);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Bell className="h-5 w-5" /> Notification Preferences
                    </DialogTitle>
                    <DialogDescription>
                        Control how and when we communicate with you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">

                    {/* 1. CHANNELS (Global) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Communication Channels</h3>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive weekly summaries and major alerts.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.email}
                                onCheckedChange={(v) => setSettings({ ...settings, email: v })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Real-time alerts on your device.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.push}
                                onCheckedChange={(v) => setSettings({ ...settings, push: v })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* 2. ALERTS CONFIGURATION */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Alert Configuration</h3>

                        {/* Budget Alerts */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-slate-500" />
                                    <Label>Budget Threshold Alerts</Label>
                                </div>
                                <Switch
                                    checked={settings.budgetAlerts}
                                    onCheckedChange={(v) => setSettings({ ...settings, budgetAlerts: v })}
                                />
                            </div>

                            {/* Advanced Slider Feature */}
                            {settings.budgetAlerts && (
                                <div className="pl-6 pr-2 pt-2 animate-in slide-in-from-top-2 fade-in">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>Notify when I spend:</span>
                                        <span className="font-bold text-primary">{settings.budgetThreshold}%</span>
                                    </div>
                                    <Slider
                                        value={settings.budgetThreshold}
                                        onValueChange={(val) => setSettings({ ...settings, budgetThreshold: val })}
                                        max={100}
                                        min={50}
                                        step={5}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Goal Milestones */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-500" />
                                <div className="space-y-0.5">
                                    <Label>Goal Milestones</Label>
                                    <p className="text-xs text-muted-foreground">Get cheered when you hit 50% & 100%.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.goalMilestones}
                                onCheckedChange={(v) => setSettings({ ...settings, goalMilestones: v })}
                            />
                        </div>

                        {/* Bill Reminders */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <div className="space-y-0.5">
                                    <Label>Bill Reminders</Label>
                                    <p className="text-xs text-muted-foreground">Notify 24 hours before recurring payments.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.billReminders}
                                onCheckedChange={(v) => setSettings({ ...settings, billReminders: v })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* 3. ADVANCED / SYSTEM */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between opacity-80">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-600" />
                                <div className="space-y-0.5">
                                    <Label>Security Alerts</Label>
                                    <p className="text-xs text-muted-foreground">New logins and suspicious activity.</p>
                                </div>
                            </div>
                            {/* Disabled switch creates trust - "You can't turn off security" */}
                            <Switch checked={true} disabled />
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-indigo-500" />
                                <div className="space-y-0.5">
                                    <Label>Quiet Mode</Label>
                                    <p className="text-xs text-muted-foreground">Pause notifications from 10 PM to 8 AM.</p>
                                </div>
                            </div>
                            <Switch />
                        </div>
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Preferences</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}