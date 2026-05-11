"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportBeerJsonButtonProps {
  batchId: string;
}

export function ExportBeerJsonButton({ batchId }: ExportBeerJsonButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      title="Export BeerJSON"
      onClick={() => {
        window.location.href = `/api/batches/${batchId}/beerjson`;
      }}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
