import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentWeddingPlan } from "@/lib/current-plan";
import { prisma } from "@/lib/prisma";

const budgetSchema = z.object({
  category: z.string().min(1, "Kategori wajib diisi"),
  label: z.string().min(1, "Nama pos budget wajib diisi"),
  estimatedCost: z.union([z.number(), z.string()]),
  actualCost: z.union([z.number(), z.string()]).optional().nullable(),
  isPaid: z.boolean().optional(),
});

export async function GET() {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.budgetItem.findMany({
    where: { weddingPlanId: weddingPlan.id },
  });

  // Decimal Prisma ke-serialize jadi string di JSON — convert ke number
  // biar gak ke-concat pas dijumlahin di frontend (reduce sum + string).
  const normalizedItems = items.map((item) => ({
    ...item,
    estimatedCost: Number(item.estimatedCost),
    actualCost: item.actualCost != null ? Number(item.actualCost) : null,
  }));

  return NextResponse.json({ items: normalizedItems });
}

export async function POST(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();

  // Support apply template action
  if (json.action === "apply_template" && json.budgetTotal) {
    const total = Number(json.budgetTotal);
    const template = [
      { category: "Venue & Catering", label: "Venue Gedung & Catering Tamu", pct: 0.45 },
      { category: "Dekorasi", label: "Dekorasi Pelaminan & Ruang Acara", pct: 0.12 },
      { category: "MUA & Busana", label: "Rias Pengantin, Orang Tua, & Busana", pct: 0.10 },
      { category: "Dokumentasi", label: "Foto & Video Liputan Hari-H", pct: 0.08 },
      { category: "Wedding Organizer", label: "Koordinasi Wedding Organizer Hari-H", pct: 0.07 },
      { category: "Undangan & Souvenir", label: "Cetak Undangan & Cinderamata", pct: 0.05 },
      { category: "Cincin & Mahar", label: "Cincin Kawin & Mas Kawin", pct: 0.05 },
      { category: "Entertainment & MC", label: "Sound System, Akustik, & MC", pct: 0.04 },
      { category: "Dana Darurat", label: "Cadangan Biaya Operasional Tak Terduga", pct: 0.04 },
    ];

    await prisma.budgetItem.createMany({
      data: template.map((t) => ({
        weddingPlanId: weddingPlan.id,
        category: t.category,
        label: t.label,
        estimatedCost: Math.round(total * t.pct),
        actualCost: null,
        isPaid: false,
      })),
    });

    const items = await prisma.budgetItem.findMany({
      where: { weddingPlanId: weddingPlan.id },
    });
    // Normalize Prisma Decimal → Number (sama seperti GET handler)
    const normalizedItems = items.map((item) => ({
      ...item,
      estimatedCost: Number(item.estimatedCost),
      actualCost: item.actualCost != null ? Number(item.actualCost) : null,
    }));
    return NextResponse.json({ items: normalizedItems }, { status: 201 });
  }

  const parsed = budgetSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const item = await prisma.budgetItem.create({
    data: {
      weddingPlanId: weddingPlan.id,
      category: parsed.data.category,
      label: parsed.data.label,
      estimatedCost: Number(parsed.data.estimatedCost),
      actualCost: parsed.data.actualCost != null ? Number(parsed.data.actualCost) : null,
      isPaid: parsed.data.isPaid ?? false,
    },
  });

  // Normalize Decimal → Number
  const normalizedItem = {
    ...item,
    estimatedCost: Number(item.estimatedCost),
    actualCost: item.actualCost != null ? Number(item.actualCost) : null,
  };

  return NextResponse.json({ item: normalizedItem }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { weddingPlan, currentUserName } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const { id, ...data } = json;

  if (!id) {
    return NextResponse.json({ error: "Item ID wajib ada" }, { status: 400 });
  }

  const updateData: any = {};
  if (data.category !== undefined) updateData.category = data.category;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.estimatedCost !== undefined) updateData.estimatedCost = Number(data.estimatedCost);
  if (data.actualCost !== undefined) updateData.actualCost = data.actualCost != null ? Number(data.actualCost) : null;
  if (data.isPaid !== undefined) updateData.isPaid = Boolean(data.isPaid);
  updateData.updatedBy = currentUserName;

  const item = await prisma.budgetItem.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Item ID wajib ada" }, { status: 400 });
  }

  await prisma.budgetItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}