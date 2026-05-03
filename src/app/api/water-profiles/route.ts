import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const profiles = await prisma.waterProfile.findMany();
  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  const data = await request.json();
  const profile = await prisma.waterProfile.create({ data });
  return NextResponse.json(profile);
}