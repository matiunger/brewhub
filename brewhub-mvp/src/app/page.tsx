import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HomePageProps {
  searchParams: { type?: string; draft?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const typeFilter = searchParams.type;
  const draftFilter = searchParams.draft;

  const whereClause: any = {};
  if (typeFilter) whereClause.type = typeFilter;
  if (draftFilter === "true") whereClause.draft = true;
  if (draftFilter === "false") whereClause.draft = false;

  const batches = await prisma.batch.findMany({
    where: whereClause,
    orderBy: { brewDate: "desc" },
    include: {
      equipment: true,
      sourceWaterProfile: true,
      targetWaterProfile: true,
      _count: {
        select: { grains: true, hops: true, yeasts: true },
      },
    },
  });

  const executedBatches = batches.filter((b) => !b.draft);
  const draftBatches = batches.filter((b) => b.draft);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <div className="flex gap-2">
          <Link href="/batches/new">
            <Button>+ New Batch</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="/"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            !typeFilter && !draftFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All
        </a>
        <a
          href="/?draft=false"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            draftFilter === "false"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Executed
        </a>
        <a
          href="/?draft=true"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            draftFilter === "true"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Drafts
        </a>
        <div className="border-l mx-2" />
        {["beer", "cider", "hopwater", "other"].map((t) => (
          <a
            key={t}
            href={`/?type=${t}${draftFilter ? `&draft=${draftFilter}` : ""}`}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              typeFilter === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </a>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {draftFilter !== "true" && (
          <Card>
            <CardHeader>
              <CardTitle>Executed Batches ({executedBatches.length})</CardTitle>
              <CardDescription>Completed brewing sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {executedBatches.map((batch) => (
                  <Link key={batch.id} href={`/batches/${batch.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{batch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.style || "No style"}
                            {batch.brewDate && ` • ${batch.brewDate.toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="secondary">{batch.type}</Badge>
                          {batch._count.grains > 0 && (
                            <Badge variant="outline">{batch._count.grains} grains</Badge>
                          )}
                          {batch._count.hops > 0 && (
                            <Badge variant="outline">{batch._count.hops} hops</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {executedBatches.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No executed batches yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {draftFilter !== "false" && (
          <Card>
            <CardHeader>
              <CardTitle>Draft Batches ({draftBatches.length})</CardTitle>
              <CardDescription>Work in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {draftBatches.map((batch) => (
                  <Link key={batch.id} href={`/batches/${batch.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer border-dashed">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{batch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.style || "No style"}
                            {batch.brewDate && ` • ${batch.brewDate.toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="secondary">{batch.type}</Badge>
                          {batch._count.grains > 0 && (
                            <Badge variant="outline">{batch._count.grains} grains</Badge>
                          )}
                          {batch._count.hops > 0 && (
                            <Badge variant="outline">{batch._count.hops} hops</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {draftBatches.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No draft batches yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}