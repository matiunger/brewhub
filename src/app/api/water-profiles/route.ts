import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const profiles = await prisma.waterProfile.findMany();
  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const profile = await prisma.waterProfile.create({
    data: {
      name: body.name,
      caPpm: body.caPpm,
      mgPpm: body.mgPpm,
      naPpm: body.naPpm,
      clPpm: body.clPpm,
      so4Ppm: body.so4Ppm,
      znPpm: body.znPpm ?? null,
      hco3Ppm: body.hco3Ppm ?? null,
      pH: body.pH ?? null,
    },
  });
  return NextResponse.json(profile);
}