import { NextResponse } from "next/server";
import { getCurrentWeddingPlan } from "@/lib/current-plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collaborators = await prisma.collaboratorInvite.findMany({
    where: { weddingPlanId: weddingPlan.id },
  });

  return NextResponse.json({ collaborators });
}

export async function POST(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const { email, role } = json;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email valid diperlukan" }, { status: 400 });
  }

  const collaborator = await prisma.collaboratorInvite.create({
    data: {
      weddingPlanId: weddingPlan.id,
      invitedEmail: email,
      role: role || "Pasangan",
      status: "pending",
    },
  });

  return NextResponse.json({ collaborator }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID kolaborator diperlukan" }, { status: 400 });
  }

  await prisma.collaboratorInvite.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
