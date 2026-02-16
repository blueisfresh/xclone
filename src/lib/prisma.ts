import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// create a shared Postgres connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// wrap that pool in Prisma’s adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

// create a single Prisma client instance using the adapter
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter, // <- the key line
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;