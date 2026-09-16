import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentWeddingPlan() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return { userId: null, weddingPlan: null };

  const weddingPlan = await prisma.weddingPlan.findUnique({
    where: { ownerId: userId },
  });

  return { userId, weddingPlan };
}
