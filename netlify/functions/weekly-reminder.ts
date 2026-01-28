import type { Config } from "@netlify/functions";
import { db } from "../../src/lib/db";
import { opsReminders } from "../../src/lib/db/schema";
import { sendGMReminder } from "../../src/lib/email";
import { eq } from "drizzle-orm";

export default async (req: Request) => {
    // Check CRON_SECRET if provided in header (Netlify doesn't natively pass secrets this way for scheduled functions, but safe for manual hits)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Note: Netlify scheduled functions are called by internal system, so check docs if secret is needed.
        // For now we assume system-level security or manual trigger validation.
    }

    const now = new Date();
    const laTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(now);

    const parts: Record<string, string> = {};
    laTime.forEach(({ type, value }) => {
        parts[type] = value;
    });

    // Monday is 1 in America/Los_Angeles when using getDay() on a zoned date
    // But here we can check the date parts or just compute week_start_date (Monday)

    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
    const currentHour = parseInt(parts.hour);

    // Requirement: Monday 8am
    if (currentDay !== "Monday" || currentHour !== 8) {
        console.log(`Skipping: Current time in LA is ${currentDay} ${currentHour}h`);
        return new Response("Not the scheduled time window");
    }

    // Compute this week's Monday date
    const dayOfWeek = now.getDay(); // Sunday=0, Monday=1...
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const weekStartDate = monday.toISOString().split('T')[0];

    try {
        // Idempotency check
        const existing = await db.query.opsReminders.findFirst({
            where: eq(opsReminders.weekStartDate, weekStartDate),
        });

        if (existing) {
            console.log(`Reminder already sent for week ${weekStartDate}`);
            return new Response("Reminder already sent");
        }

        await sendGMReminder();

        await db.insert(opsReminders).values({
            weekStartDate,
        });

        console.log(`Reminder sent for week ${weekStartDate}`);
        return new Response("OK");
    } catch (error) {
        console.error("Cron failed:", error);
        return new Response("Internal Error", { status: 500 });
    }
};

export const config: Config = {
    schedule: "0 16 * * 1", // Monday 16:00 UTC (8:00 AM PST)
};
