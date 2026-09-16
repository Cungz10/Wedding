import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeddingPlan } from "@/lib/current-plan";
import { ROADMAP_TEMPLATE } from "@/lib/roadmap-templates";

export async function POST() {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingCount = await prisma.roadmapTask.count({
    where: { weddingPlanId: weddingPlan.id },
  });
  if (existingCount > 0) {
    return NextResponse.json(
      { error: "Roadmap sudah ada isinya." },
      { status: 409 }
    );
  }

  await prisma.roadmapTask.createMany({
    data: ROADMAP_TEMPLATE.map((item) => ({
      weddingPlanId: weddingPlan.id,
      title: item.title,
      phase: item.phase,
    })),
  });

  const tasks = await prisma.roadmapTask.findMany({
    where: { weddingPlanId: weddingPlan.id },
    orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ tasks }, { status: 201 });
}
