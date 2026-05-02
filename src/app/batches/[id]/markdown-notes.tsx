"use client";

import { useState } from "react";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

interface MarkdownNotesProps {
  notes: string | null;
  onSave: (notes: string) => Promise<void>;
}

export function MarkdownNotes({ notes, onSave }: MarkdownNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes || "");

  const handleSave = async () => {
    try {
      await onSave(editValue);
      toast.success("Notes saved");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save notes");
    }
  };

  const handleCancel = () => {
    setEditValue(notes || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={20}
          className="w-full font-mono text-sm"
          placeholder="Enter notes in markdown format..."
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="min-h-[100px] rounded-md border bg-muted/30 p-4 markdown-content">
        {notes ? (
          <Markdown>{notes}</Markdown>
        ) : (
          <p className="text-muted-foreground italic">No notes added yet...</p>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
    </div>
  );
}
