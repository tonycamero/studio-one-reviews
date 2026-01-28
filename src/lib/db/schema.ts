import { pgTable, uuid, text, timestamp, date, unique } from "drizzle-orm/pg-core";

export const giveawayEntries = pgTable("giveaway_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    source: text("source"),
    campaign: text("campaign"),
    consentVersion: text("consent_version").notNull().default("v1"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const giveawayWinners = pgTable("giveaway_winners", {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id").notNull().references(() => giveawayEntries.id),
    weekStartDate: date("week_start_date").notNull(),
    selectedAt: timestamp("selected_at", { withTimezone: true }).notNull().defaultNow(),
    winnerEmailSentAt: timestamp("winner_email_sent_at", { withTimezone: true }),
}, (t) => ({
    unq: unique().on(t.weekStartDate),
}));

export const opsReminders = pgTable("ops_reminders", {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStartDate: date("week_start_date").notNull(),
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    unq: unique().on(t.weekStartDate),
}));
