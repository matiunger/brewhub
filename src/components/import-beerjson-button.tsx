"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImportBeerJsonButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    let json: unknown;
    try {
      json = JSON.parse(await file.text());
    } catch {
      toast.error("Invalid JSON file");
      return;
    }

    try {
      const res = await fetch("/api/batches/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Import failed");
        return;
      }

      const { id } = await res.json();
      toast.success("Batch imported successfully");
      router.push(`/batches/${id}`);
    } catch {
      toast.error("Import failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFile}
      />
      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        Import BeerJSON
      </Button>
    </>
  );
}
