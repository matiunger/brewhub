import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const yeasts = await prisma.yeast.findMany();
  return NextResponse.json(yeasts);
}

export async function POST(request: Request) {
  const data = await request.json();
  const yeast = await prisma.yeast.create({ data });
  return NextResponse.json(yeast);
}