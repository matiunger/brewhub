import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/wiki/[slug] - Get single wiki page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await prisma.wikiPage.findUnique({
    where: { slug },
  });
  
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  
  return NextResponse.json(page);
}

// PUT /api/wiki/[slug] - Update wiki page
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await request.json();
  
  // Update slug if title changed
  if (!data.slug && data.title) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  
  try {
    const page = await prisma.wikiPage.update({
      where: { slug },
      data,
    });
    return NextResponse.json(page);
  } catch (error) {
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }
    throw error;
  }
}

// DELETE /api/wiki/[slug] - Delete wiki page
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await prisma.wikiPage.delete({
    where: { slug },
  });
  return NextResponse.json({ success: true });
}