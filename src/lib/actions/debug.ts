"use server";

import { prisma } from "@/lib/prisma";

export async function debugColumns() {
    const rows = await prisma.$queryRawUnsafe<
        { table_name: string; column_name: string }[]
    >(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('User','Profile','Session','Post','Like','Repost','Message','Notification','UserFollows','Chat')
    ORDER BY table_name, ordinal_position
  `);

    console.log(
        rows.reduce((acc, r) => {
            (acc[r.table_name] ??= []).push(r.column_name);
            return acc;
        }, {} as Record<string, string[]>)
    );
}