"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TransactionService } from "@/services/transaction-service"; // Clean import

interface Props {
    open: boolean;
    onClose: () => void;
    id: string | null;
    onSuccess?: () => void; // Trigger to refresh the list
}

export default function DeleteConfirmModal({ open, onClose, id, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            await TransactionService.delete(id);
            toast.success("Transaction deleted");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Delete Transaction</DialogTitle>
                    <DialogDescription>
                        Are you sure? This action cannot be undone. This will permanently remove this transaction from your records.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="cursor-pointer">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                            </>
                        ) : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}