import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const hops = await prisma.hop.findMany();
  return NextResponse.json(hops);
}

export async function POST(request: Request) {
  const body = await request.json();
  const hop = await prisma.hop.create({
    data: {
      name: body.name,
      origin: body.origin ?? null,
      form: body.form ?? null,
      hopType: body.hopType ?? null,
      alphaAcid: body.alphaAcid,
      betaAcid: body.betaAcid ?? null,
      profile: body.profile ?? null,
      styles: body.styles ?? null,
      alternatives: body.alternatives ?? null,
    },
  });
  return NextResponse.json(hop);
}