import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentWeddingPlan() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (userId) {
    const weddingPlan = await prisma.weddingPlan.findUnique({
      where: { ownerId: userId },
    });
    return { userId, weddingPlan, isDemo: false };
  }

  // Fallback demo user and plan for preview interactivity
  const demoUserId = "demo-user-1";
  const weddingPlan = await prisma.weddingPlan.findUnique({
    where: { ownerId: demoUserId },
  });

  return { userId: demoUserId, weddingPlan, isDemo: true };
}
