"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GiveawayForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [reviewUrl, setReviewUrl] = useState("");

    useEffect(() => {
        setReviewUrl(process.env.NEXT_PUBLIC_REVIEW_URL || "");
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) return;

        setStatus("loading");
        try {
            const res = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    firstName,
                    source: searchParams.get("source"),
                    campaign: searchParams.get("campaign"),
                }),
            });

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (err) {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="card" style={{ textAlign: "center" }}>
                <h1 style={{ marginBottom: "1rem", color: "var(--accent)" }}>You're In! 🤞</h1>
                <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
                    Thanks for entering. We'll announce the winner via email.
                </p>
                <div className="separator" />
                <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
                    Want to help us grow?
                </p>
                <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-outline"
                >
                    Leave a Google Review
                </a>
                <p className="microcopy">Optional. Not required for giveaway entry.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <header style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                    Studio One <span style={{ color: "var(--accent)" }}>Café</span>
                </h1>
                <p style={{ color: "var(--muted-foreground)" }}>Weekly Giveaway</p>
            </header>

            <section id="giveaway">
                <form onSubmit={handleSubmit}>
                    <label className="label">First Name (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Your name"
                    />

                    <label className="label">Email Address</label>
                    <input
                        type="email"
                        required
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />

                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="terms"
                            required
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <label htmlFor="terms">
                            I agree to the Giveaway Rules & Privacy Policy
                        </label>
                    </div>

                    <button type="submit" className="button" disabled={status === "loading"}>
                        {status === "loading" ? "Entering..." : "Enter Giveaway"}
                    </button>
                    {status === "error" && (
                        <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "1rem", textAlign: "center" }}>
                            Something went wrong. Please try again.
                        </p>
                    )}
                </form>
            </section>

            <div className="separator" />

            <section id="review" style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--muted-foreground)" }}>
                    Share your experience
                </h2>
                <a
                    href={reviewUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`button button-outline ${!reviewUrl ? "disabled" : ""}`}
                    style={!reviewUrl ? { pointerEvents: "none", opacity: 0.5 } : {}}
                >
                    Leave a Google Review
                </a>
                <p className="microcopy">Optional. Not required for giveaway entry.</p>
            </section>
        </div>
    );
}

export default function Home() {
    return (
        <main>
            <Suspense fallback={<div className="card">Loading...</div>}>
                <GiveawayForm />
            </Suspense>
        </main>
    );
}
