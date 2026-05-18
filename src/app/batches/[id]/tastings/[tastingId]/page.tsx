import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseBrewdayData } from "@/lib/brewday-types";
import { parseTastingData } from "@/lib/tasting-types";
import { TastingForm } from "./tasting-form";

interface TastingPageProps {
  params: Promise<{ id: string; tastingId: string }>;
}

async function saveTasting(
  batchId: string,
  tastingId: string | null,
  data: { date: Date; servingType: string; scoreData: string; totalScore: number | null }
) {
  "use server";
  if (tastingId) {
    await prisma.tasting.update({
      where: { id: tastingId },
      data: { date: data.date, servingType: data.servingType, data: data.scoreData, totalScore: data.totalScore },
    });
  } else {
    await prisma.tasting.create({
      data: { batchId, date: data.date, servingType: data.servingType, data: data.scoreData, totalScore: data.totalScore },
    });
  }
  redirect(`/batches/${batchId}`);
}

async function deleteTasting(batchId: string, tastingId: string) {
  "use server";
  await prisma.tasting.delete({ where: { id: tastingId } });
  redirect(`/batches/${batchId}`);
}

export default async function TastingPage({ params }: TastingPageProps) {
  const { id: batchId, tastingId } = await params;
  const isNew = tastingId === "new";

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { id: true, name: true, style: true, brewdayData: true },
  });

  if (!batch) notFound();

  const brewday = parseBrewdayData(batch.brewdayData);
  const packagingDateStr = brewday.kegging.dateTime ?? brewday.bottling.dateTime;

  let existingTasting: { id: string; date: Date; servingType: string; data: string; totalScore: number | null } | null = null;
  if (!isNew) {
    existingTasting = await prisma.tasting.findUnique({ where: { id: tastingId } });
    if (!existingTasting) notFound();
  }

  const initialData = existingTasting ? parseTastingData(existingTasting.data) : undefined;

  const saveAction = saveTasting.bind(null, batchId, isNew ? null : tastingId);
  const deleteAction = isNew ? null : deleteTasting.bind(null, batchId, tastingId);

  return (
    <TastingForm
      batchId={batchId}
      batchName={batch.name}
      batchStyle={batch.style ?? null}
      tastingId={isNew ? null : tastingId}
      initialDate={existingTasting?.date ?? null}
      initialServingType={existingTasting?.servingType ?? "draft"}
      initialData={initialData}
      packagingDateStr={packagingDateStr}
      saveAction={saveAction}
      deleteAction={deleteAction}
    />
  );
}
