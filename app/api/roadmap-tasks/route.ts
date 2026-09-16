import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWeddingPlan } from "@/lib/current-plan";

const createSchema = z.object({
  title: z.string().min(1, "Judul tugas wajib diisi"),
  phase: z.string().min(1),
  dueDate: z.string().optional(),
});

export async function GET() {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.roadmapTask.findMany({
    where: { weddingPlanId: weddingPlan.id },
    orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const task = await prisma.roadmapTask.create({
    data: {
      weddingPlanId: weddingPlan.id,
      title: parsed.data.title,
      phase: parsed.data.phase,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
