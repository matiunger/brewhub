"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  subscribeSaveStatus,
  getSaveStatus,
  getServerSaveStatus,
  hasUnsavedChanges,
  resetSaveStatus,
} from "@/lib/save-status";

export function SaveStatus({ className }: { className?: string }) {
  const status = useSyncExternalStore(subscribeSaveStatus, getSaveStatus, getServerSaveStatus);

  // Start fresh on each batch page; warn before closing the tab with unsaved edits
  useEffect(() => {
    resetSaveStatus();
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  if (status === "idle") return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        status === "error" ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {status === "saving" && <><Loader2 className="h-3 w-3 animate-spin" />Saving…</>}
      {status === "saved" && <><Check className="h-3 w-3" />Saved</>}
      {status === "error" && <><AlertCircle className="h-3 w-3" />Save failed</>}
    </span>
  );
}
