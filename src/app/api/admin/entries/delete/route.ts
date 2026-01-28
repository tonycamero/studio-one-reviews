import { db } from "@/lib/db";
import { giveawayEntries, giveawayWinners } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "Entry ID required" }, { status: 400 });

        // Note: If an entry is already a winner, we might want to prevent deletion 
        // or handle cascading. Per schema, giveaway_winners references entries.
        // Let's delete from giveaway_winners first if it exists to avoid FK errors.
        await db.delete(giveawayWinners).where(eq(giveawayWinners.entryId, id));
        await db.delete(giveawayEntries).where(eq(giveawayEntries.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
