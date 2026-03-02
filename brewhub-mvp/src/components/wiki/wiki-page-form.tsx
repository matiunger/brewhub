"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WikiPageForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const data = await response.json();
      router.push(`/wiki/${data.slug}`);
    } else {
      const data = await response.json();
      setError(data.error || "Failed to create page");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Create New Wiki Page</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Brewing Process"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown) *</Label>
          <Textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="# My Wiki Page

Write your content here using **Markdown** formatting..."
            rows={20}
            className="font-mono"
            required
          />
          <p className="text-sm text-muted-foreground">
            Supports Markdown formatting including headers, lists, bold, italic,
            links, and code blocks.
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-2">
          <Button type="submit">Create Page</Button>
          <Link href="/">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
