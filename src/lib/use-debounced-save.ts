"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { markDirty, clearDirty } from "@/lib/save-status";

/**
 * Returns a `schedule()` function that runs `save` once edits stop for `delayMs`.
 * `save` always sees the latest state (it is read when the timer fires), and the
 * pending save feeds the "Saving… / Saved" indicator under `key`.
 */
export function useDebouncedSave(
  key: string,
  save: () => Promise<unknown>,
  errorMessage: string,
  delayMs = 800
) {
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    markDirty(key);
    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      clearDirty(key);
      try {
        await saveRef.current();
      } catch {
        toast.error(errorMessage);
      }
    }, delayMs);
  }, [key, errorMessage, delayMs]);
}
