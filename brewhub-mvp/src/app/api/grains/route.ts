import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const grain = await prisma.grain.create({ data });
  return NextResponse.json(grain);
}