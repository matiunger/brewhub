import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const kegs = await prisma.keg.findMany();
  return NextResponse.json(kegs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const keg = await prisma.keg.create({
    data: {
      name: body.name,
      type: body.type ?? null,
      label: body.label ?? null,
      capacity: body.capacity,
      tareWeight: body.tareWeight ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(keg);
}