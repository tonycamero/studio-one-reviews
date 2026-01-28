import { db } from "@/lib/db";
import { giveawayWinners } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { entryId } = await request.json();
        if (!entryId) return NextResponse.json({ error: "Entry ID required" }, { status: 400 });

        // Compute week_start_date (this Monday)
        const now = new Date();
        const laTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
        const day = laTime.getDay();
        const diff = laTime.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(laTime.setDate(diff));
        const weekStartDate = monday.toISOString().split('T')[0];

        await db.insert(giveawayWinners).values({
            entryId,
            weekStartDate,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === '23505') { // Unique constraint
            return NextResponse.json({ error: "Winner already selected for this week" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
