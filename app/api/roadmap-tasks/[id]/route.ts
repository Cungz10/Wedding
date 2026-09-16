import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWeddingPlan } from "@/lib/current-plan";

const patchSchema = z.object({
  isDone: z.boolean().optional(),
  title: z.string().min(1).optional(),
  notes: z.string().optional(),
});

async function assertOwnership(taskId: string, weddingPlanId: string) {
  const task = await prisma.roadmapTask.findUnique({ where: { id: taskId } });
  return task && task.weddingPlanId === weddingPlanId ? task : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await assertOwnership(params.id, weddingPlan.id);
  if (!owned) {
    return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const task = await prisma.roadmapTask.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ task });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await assertOwnership(params.id, weddingPlan.id);
  if (!owned) {
    return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
  }

  await prisma.roadmapTask.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
