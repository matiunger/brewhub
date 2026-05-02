"use client";

import { Button } from "@/components/ui/button";

interface ExportBeerJsonButtonProps {
  batchId: string;
}

export function ExportBeerJsonButton({ batchId }: ExportBeerJsonButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        window.location.href = `/api/batches/${batchId}/beerjson`;
      }}
    >
      Export BeerJSON
    </Button>
  );
}
