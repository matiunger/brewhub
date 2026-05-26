import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseBrewdayData } from "@/lib/brewday-types";
import type { EvaluationState } from "@/lib/evaluation-types";
import { getTotalScore } from "@/lib/evaluation-score-utils";
import EvaluationForm from "@/components/tasting-form/EvaluationForm";
import { LocaleProvider } from "@/lib/locale-context";
import { EvaluateProvider } from "@/lib/evaluate-context";

interface TastingPageProps {
  params: Promise<{ id: string; tastingId: string }>;
}

async function saveTastingAction(
  batchId: string,
  tastingId: string | null,
  state: EvaluationState
) {
  "use server";
  const stateJson = JSON.stringify(state);
  const date = state.header.date ? new Date(state.header.date) : new Date();
  const servingType = state.header.presentation?.toLowerCase() ?? "bottle";
  const totalScore = getTotalScore(state);
  if (tastingId) {
    await prisma.tasting.update({
      where: { id: tastingId },
      data: { date, servingType, data: stateJson, totalScore },
    });
  } else {
    await prisma.tasting.create({
      data: { batchId, date, servingType, data: stateJson, totalScore },
    });
  }
  redirect(`/batches/${batchId}`);
}

function parseEvaluationState(json: string): EvaluationState | undefined {
  try {
    const parsed = JSON.parse(json);
    if (parsed && parsed.header && parsed.sections) {
      return parsed as EvaluationState;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export default async function TastingPage({ params }: TastingPageProps) {
  const { id: batchId, tastingId } = await params;
  const isNew = tastingId === "new";

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { id: true, name: true, style: true, brewdayData: true },
  });

  if (!batch) notFound();

  let existingTasting: { id: string; data: string } | null = null;
  if (!isNew) {
    existingTasting = await prisma.tasting.findUnique({
      where: { id: tastingId },
      select: { id: true, data: true },
    });
    if (!existingTasting) notFound();
  }

  const brewday = batch.brewdayData ? parseBrewdayData(batch.brewdayData) : null;
  const keggingDate = brewday?.kegging?.dateTime ?? null;

  const initialState = existingTasting ? parseEvaluationState(existingTasting.data) : undefined;
  const onSave = saveTastingAction.bind(null, batchId, isNew ? null : tastingId);

  return (
    <LocaleProvider>
      <EvaluateProvider>
        <div className="px-4 py-4 max-w-3xl mx-auto">
          <div className="mb-4 flex items-center gap-2">
            <a
              href={`/batches/${batchId}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {batch.name}
            </a>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">
              {isNew ? "New Tasting" : "Edit Tasting"}
            </span>
          </div>
          <EvaluationForm
            initialState={initialState}
            onSave={onSave}
            batchName={batch.name}
            batchStyle={batch.style ?? undefined}
            keggingDate={keggingDate ?? undefined}
          />
        </div>
      </EvaluateProvider>
    </LocaleProvider>
  );
}
