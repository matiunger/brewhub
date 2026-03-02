import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/wiki - List all wiki pages
export async function GET() {
  const pages = await prisma.wikiPage.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });
  return NextResponse.json(pages);
}

// POST /api/wiki - Create new wiki page
export async function POST(request: Request) {
  const data = await request.json();
  
  // Generate slug from title if not provided
  if (!data.slug && data.title) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  
  try {
    const page = await prisma.wikiPage.create({ data });
    return NextResponse.json(page, { status: 201 });
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