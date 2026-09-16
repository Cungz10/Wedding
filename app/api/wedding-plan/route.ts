import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentWeddingPlan } from "@/lib/current-plan";
import { prisma } from "@/lib/prisma";
import { ROADMAP_TEMPLATE } from "@/lib/roadmap-templates";

const onboardingSchema = z.object({
  partnerName: z.string().min(1, "Nama pasangan wajib diisi"),
  weddingDate: z.string().optional(),
  venueCity: z.string().optional(),
  concept: z.string().optional(),
  budgetTotal: z.union([z.string(), z.number()]).optional(),
  guestCount: z.union([z.string(), z.number()]).optional(),
  religion: z.string().optional(),
});

export async function POST(request: Request) {
  const { userId, weddingPlan: existingPlan } = await getCurrentWeddingPlan();
  if (!userId) {
    return NextResponse.json(
      { error: "Kamu perlu login dulu sebelum lanjut onboarding." },
      { status: 401 }
    );
  }

  const json = await request.json();
  const parsed = onboardingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data belum lengkap.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { partnerName, weddingDate, venueCity, concept, budgetTotal, guestCount, religion } = parsed.data;

  const totalBudgetNum = budgetTotal ? Number(budgetTotal) : null;
  const guestCountNum = guestCount ? Number(guestCount) : null;

  const weddingPlan = await prisma.weddingPlan.upsert({
    where: { ownerId: userId },
    update: {
      partnerName,
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      venueCity: venueCity || null,
      concept: concept || null,
      budgetTotal: totalBudgetNum,
      guestCount: guestCountNum,
      religion: religion || "Islam (KUA)",
      onboardingDone: true,
    },
    create: {
      ownerId: userId,
      partnerName,
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      venueCity: venueCity || null,
      concept: concept || null,
      budgetTotal: totalBudgetNum,
      guestCount: guestCountNum,
      religion: religion || "Islam (KUA)",
      onboardingDone: true,
    },
  });

  // Seed default roadmap tasks if plan has no tasks yet
  const existingTaskCount = await prisma.roadmapTask.count({
    where: { weddingPlanId: weddingPlan.id },
  });

  if (existingTaskCount === 0) {
    await prisma.roadmapTask.createMany({
      data: ROADMAP_TEMPLATE.map((item) => ({
        weddingPlanId: weddingPlan.id,
        title: item.title,
        phase: item.phase,
      })),
    });
  }

  // Seed default budget template if none exist
  const existingBudget = await prisma.budgetItem.findMany({
    where: { weddingPlanId: weddingPlan.id },
  });

  if (existingBudget.length === 0 && totalBudgetNum) {
    const defaultAllocations = [
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
      data: defaultAllocations.map((a) => ({
        weddingPlanId: weddingPlan.id,
        category: a.category,
        label: a.label,
        estimatedCost: Math.round(totalBudgetNum * a.pct),
        actualCost: null,
        isPaid: false,
      })),
    });
  }

  return NextResponse.json({ weddingPlan }, { status: 200 });
}

export async function GET() {
  const { weddingPlan, isDemo } = await getCurrentWeddingPlan();

  // budgetTotal Decimal Prisma jadi string pas di-JSON-in — convert ke number
  // biar aman dipakai buat kalkulasi (-, /, *) sama .toLocaleString() di frontend.
  const normalizedPlan = weddingPlan
    ? { ...weddingPlan, budgetTotal: weddingPlan.budgetTotal != null ? Number(weddingPlan.budgetTotal) : null }
    : weddingPlan;

  return NextResponse.json({ weddingPlan: normalizedPlan, isDemo });
}