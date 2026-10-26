// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    // log: ["query"],
  });
}

function shouldRefreshPrismaClient(client?: PrismaClient) {
  if (!client) return true;

  const prismaAny = client as any;
  return (
    typeof prismaAny.accountPitching === "undefined" ||
    typeof prismaAny.pitchingProjectType === "undefined" ||
    typeof prismaAny.pitchingDivision === "undefined"
  );
}

export const prisma =
  shouldRefreshPrismaClient(globalForPrisma.prisma) ? createPrismaClient() : globalForPrisma.prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
