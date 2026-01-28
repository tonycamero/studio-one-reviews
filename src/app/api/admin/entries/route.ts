import { db } from "@/lib/db";
import { giveawayEntries } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { gte, and } from "drizzle-orm";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range");

    let entries;
    if (range === "this_week") {
        // Week is Monday -> Sunday in LA
        // Get current Monday at 00:00:00
        const now = new Date();
        const laTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
        const day = laTime.getDay(); // 0 is Sunday, 1 is Monday...
        const diff = laTime.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(laTime.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        entries = await db.query.giveawayEntries.findMany({
            where: gte(giveawayEntries.createdAt, monday),
            orderBy: (entries, { desc }) => [desc(entries.createdAt)],
        });
    } else {
        entries = await db.query.giveawayEntries.findMany({
            orderBy: (entries, { desc }) => [desc(entries.createdAt)],
            limit: 100,
        });
    }

    return NextResponse.json(entries);
}
