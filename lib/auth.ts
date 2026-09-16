import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "nol-ke-nikah-secret-fallback-key",
  adapter: PrismaAdapter(prisma as any) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};
