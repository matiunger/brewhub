import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function slugFromParams(params: { slug: string[] }) {
  return params.slug.map(decodeURIComponent).join("/");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = slugFromParams(await params);
  const page = await prisma.wikiPage.findUnique({ where: { slug } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json(page);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = slugFromParams(await params);
  const data = await request.json();

  // Never auto-generate slug from title on PUT — slug is immutable
  delete data.slug;

  try {
    const page = await prisma.wikiPage.update({ where: { slug }, data });
    return NextResponse.json(page);
  } catch (error) {
    if ((error as any).code === "P2025") {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = slugFromParams(await params);
  await prisma.wikiPage.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
