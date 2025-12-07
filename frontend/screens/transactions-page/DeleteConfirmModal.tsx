"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
    open: boolean;
    onClose: () => void;
    id: string | null;
}

export default function DeleteConfirmModal({ open, onClose, id }: Props) {
    const handleDelete = () => {
        console.log("DELETE:", id);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Transaction</DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground">
                    Are you sure? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
