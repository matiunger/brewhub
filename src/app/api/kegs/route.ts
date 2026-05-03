import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const kegs = await prisma.keg.findMany();
  return NextResponse.json(kegs);
}

export async function POST(request: Request) {
  const data = await request.json();
  const keg = await prisma.keg.create({ data });
  return NextResponse.json(keg);
}