// Prisma client singleton
// Will be configured with a driver adapter in Sub-phase 0B when database is connected.
// For now, this is a placeholder that exports a typed reference.

// When Supabase is configured, uncomment and install @prisma/adapter-pg:
// import { PrismaClient } from "../generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Pool } from "pg";
//
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
//
// export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { };
