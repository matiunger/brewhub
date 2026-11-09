"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CollapsibleCard({
  title,
  icon,
  open,
  onToggle,
  actions,
  badge,
  className,
  id,
  children,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className={`p-4 px-0 scroll-mt-16 ${open ? "pt-2" : "border-b"} ${className ?? ""}`}>
      <CardHeader className={`flex flex-row items-center justify-between px-4 ${open ? "py-3" : "py-1"}`}>
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left flex-1"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <CardTitle>{title}</CardTitle>
        </button>
        <div className="flex items-center gap-2 ml-2">
          {badge}
          {open && actions}
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}
