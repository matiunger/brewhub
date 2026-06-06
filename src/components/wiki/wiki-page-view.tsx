"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WikiPage {
  id: string;
  slug: string;
  folder: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function slugify(children: React.ReactNode): string {
  return String(children)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function WikiPageView({ page }: { page: WikiPage }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: page.title, content: page.content });

  const handleSave = async () => {
    const response = await fetch(`/api/wiki/${page.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (response.ok) {
      setIsEditing(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/wiki/${page.slug}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/wiki");
      router.refresh();
    }
  };

  // Breadcrumb: derive folder parts from slug
  const slugParts = page.slug.split("/");
  const folderParts = slugParts.slice(0, -1);

  const breadcrumb = (
    <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
      <Link href="/wiki" className="hover:text-foreground">
        Wiki
      </Link>
      {folderParts.map((part) => (
        <Fragment key={part}>
          <span>/</span>
          <span>{part}</span>
        </Fragment>
      ))}
      <span>/</span>
      <span className="text-foreground font-medium">{page.title}</span>
    </div>
  );

  if (isEditing) {
    return (
      <div className="space-y-6">
        {breadcrumb}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              rows={24}
              className="font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        {breadcrumb}
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {new Date(page.updatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img({ src, alt }) {
              if (src && !src.startsWith("http") && !src.startsWith("/")) {
                const base = page.folder ? `/api/wiki-images/${page.folder}/` : "/api/wiki-images/";
                src = base + src;
              }
              // eslint-disable-next-line @next/next/no-img-element
              return <img src={src} alt={alt ?? ""} className="max-w-full rounded" />;
            },
            h1: ({ children }) => <h1 id={slugify(children)}>{children}</h1>,
            h2: ({ children }) => <h2 id={slugify(children)}>{children}</h2>,
            h3: ({ children }) => <h3 id={slugify(children)}>{children}</h3>,
            h4: ({ children }) => <h4 id={slugify(children)}>{children}</h4>,
          }}
        >
          {page.content}
        </ReactMarkdown>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wiki Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{page.title}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
