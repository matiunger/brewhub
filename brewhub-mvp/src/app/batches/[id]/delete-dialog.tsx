"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteBatchDialogProps {
  batchName: string;
  deleteAction: () => void;
}

export function DeleteBatchDialog({ batchName, deleteAction }: DeleteBatchDialogProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    await deleteAction();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete Batch</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Batch</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{batchName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDelete}>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
