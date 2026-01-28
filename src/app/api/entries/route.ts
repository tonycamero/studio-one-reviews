import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { giveawayEntries } from "@/lib/db/schema";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, firstName, source, campaign } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await db.insert(giveawayEntries).values({
            email,
            firstName: firstName || null,
            source: source || null,
            campaign: campaign || null,
            consentVersion: "v1",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to insert entry:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
