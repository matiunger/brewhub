import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const yeast = await prisma.yeast.create({ data });
  return NextResponse.json(yeast);
}