import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const equipment = await prisma.equipment.findMany();
  return NextResponse.json(equipment);
}

export async function POST(request: Request) {
  const data = await request.json();
  const equipment = await prisma.equipment.create({ data });
  return NextResponse.json(equipment);
}