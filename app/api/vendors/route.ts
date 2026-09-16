import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentWeddingPlan } from "@/lib/current-plan";
import { prisma } from "@/lib/prisma";

const vendorSchema = z.object({
  name: z.string().min(1, "Nama vendor wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  contact: z.string().optional(),
  status: z.string().optional(),
  dpAmount: z.union([z.number(), z.string()]).optional().nullable(),
  quotedPrice: z.union([z.number(), z.string()]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendors = await prisma.vendor.findMany({
    where: { weddingPlanId: weddingPlan.id },
  });

  return NextResponse.json({ vendors });
}

export async function POST(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = vendorSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const vendor = await prisma.vendor.create({
    data: {
      weddingPlanId: weddingPlan.id,
      name: parsed.data.name,
      category: parsed.data.category,
      contact: parsed.data.contact || null,
      status: parsed.data.status || "riset",
      dpAmount: parsed.data.dpAmount != null ? Number(parsed.data.dpAmount) : 0,
      quotedPrice: parsed.data.quotedPrice != null ? Number(parsed.data.quotedPrice) : null,
      notes: parsed.data.notes || null,
    },
  });

  return NextResponse.json({ vendor }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const { id, ...data } = json;

  if (!id) {
    return NextResponse.json({ error: "Vendor ID wajib ada" }, { status: 400 });
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.contact !== undefined) updateData.contact = data.contact;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dpAmount !== undefined) updateData.dpAmount = data.dpAmount != null ? Number(data.dpAmount) : 0;
  if (data.quotedPrice !== undefined) updateData.quotedPrice = data.quotedPrice != null ? Number(data.quotedPrice) : null;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const vendor = await prisma.vendor.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ vendor });
}

export async function DELETE(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Vendor ID wajib ada" }, { status: 400 });
  }

  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
