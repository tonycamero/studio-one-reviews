import { db } from "@/lib/db";
import { giveawayWinners, giveawayEntries } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendWinnerEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { winnerId } = await request.json(); // the giveaway_winners.id
        if (!winnerId) return NextResponse.json({ error: "Winner ID required" }, { status: 400 });

        const winner = await db.query.giveawayWinners.findFirst({
            where: eq(giveawayWinners.id, winnerId),
            with: {
                entry: true
            }
        });

        // Note: If with: { entry: true } doesn't work out of the box with the schema 
        // (needs relations defined), I'll do a join or manual fetch.
        // Let's do a join to be safe since I didn't define relations in schema.ts yet.

        const result = await db
            .select({
                winner: giveawayWinners,
                entry: giveawayEntries,
            })
            .from(giveawayWinners)
            .innerJoin(giveawayEntries, eq(giveawayWinners.entryId, giveawayEntries.id))
            .where(eq(giveawayWinners.id, winnerId))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({ error: "Winner not found" }, { status: 404 });
        }

        const { entry } = result[0];

        await sendWinnerEmail(entry.email, entry.firstName || undefined);

        await db
            .update(giveawayWinners)
            .set({ winnerEmailSentAt: new Date() })
            .where(eq(giveawayWinners.id, winnerId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
