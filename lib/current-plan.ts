import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentWeddingPlan() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (userId) {
    // PENTING: Cek invite yang sudah accepted DULUAN.
    // Kalau user sudah menerima undangan kolaborasi, dia harus melihat
    // workspace pengundang, BUKAN plan kosong miliknya sendiri.
    if (session?.user?.email) {
      const acceptedInvite = await prisma.collaboratorInvite.findFirst({
        where: { 
          invitedEmail: session.user.email,
          status: "accepted" 
        },
        include: { weddingPlan: true }
      });
      if (acceptedInvite) {
        return { 
          userId, 
          weddingPlan: acceptedInvite.weddingPlan, 
          isDemo: false, 
          currentUserName: session?.user?.name || "User" 
        };
      }
    }

    // Kalau bukan kolaborator, cek plan milik sendiri (sebagai owner)
    const weddingPlan = await prisma.weddingPlan.findUnique({
      where: { ownerId: userId },
    });

    return { userId, weddingPlan, isDemo: false, currentUserName: session?.user?.name || "User" };
  }

  // Fallback demo user and plan for preview interactivity
  const demoUserId = "demo-user-1";

  // Pastikan baris User demo beneran ada di DB, bukan cuma di in-memory mock,
  // biar upsert WeddingPlan gak kena foreign key violation (P2003).
  await prisma.user.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      name: "Demo User",
      email: "demo@nolkenikah.app",
    },
  });

  const weddingPlan = await prisma.weddingPlan.findUnique({
    where: { ownerId: demoUserId },
  });

  return { userId: demoUserId, weddingPlan, isDemo: true, currentUserName: "Demo User" };
}