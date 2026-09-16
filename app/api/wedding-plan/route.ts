import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const onboardingSchema = z.object({
  partnerName: z.string().min(1, "Nama pasangan wajib diisi"),
  weddingDate: z.string().optional(),
  venueCity: z.string().optional(),
  concept: z.string().optional(),
  budgetTotal: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
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

  const { partnerName, weddingDate, venueCity, concept, budgetTotal } = parsed.data;
  const userId = (session.user as any).id as string;

  const weddingPlan = await prisma.weddingPlan.upsert({
    where: { ownerId: userId },
    update: {
      partnerName,
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      venueCity: venueCity || null,
      concept: concept || null,
      budgetTotal: budgetTotal ? Number(budgetTotal) : null,
      onboardingDone: true,
    },
    create: {
      ownerId: userId,
      partnerName,
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      venueCity: venueCity || null,
      concept: concept || null,
      budgetTotal: budgetTotal ? Number(budgetTotal) : null,
      onboardingDone: true,
    },
  });

  return NextResponse.json({ weddingPlan }, { status: 200 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const weddingPlan = await prisma.weddingPlan.findUnique({
    where: { ownerId: userId },
  });

  return NextResponse.json({ weddingPlan });
}
