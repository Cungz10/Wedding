import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cari invite pending untuk user yang sedang login
  const invites = await prisma.collaboratorInvite.findMany({
    where: { 
      invitedEmail: session.user.email,
      status: "pending",
    },
    include: {
      weddingPlan: {
        include: {
          owner: {
            select: { name: true }
          }
        }
      }
    }
  });

  return NextResponse.json({ invites });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const { id, action } = json;

  if (!id) {
    return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
  }

  // Pastikan invite itu beneran punya user ini
  const invite = await prisma.collaboratorInvite.findUnique({
    where: { id }
  });

  if (!invite || invite.invitedEmail !== session.user.email) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  if (action === "reject") {
    await prisma.collaboratorInvite.delete({ where: { id } });
    return NextResponse.json({ success: true, action: "rejected" });
  }

  // Update status jadi accepted
  const userId = (session.user as any).id as string;
  const updatedInvite = await prisma.collaboratorInvite.update({
    where: { id },
    data: { 
      status: "accepted",
      invitedUserId: userId
    }
  });

  return NextResponse.json({ invite: updatedInvite });
}
