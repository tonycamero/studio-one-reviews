import { Suspense } from "react";
import GiveawayForm from "@/components/GiveawayForm";

export default function Home() {
    // Fetch the variable on the server - this is dynamic and doesn't require NEXT_PUBLIC_ prefix
    const reviewUrl = process.env.REVIEW_URL || process.env.NEXT_PUBLIC_REVIEW_URL || "";

    return (
        <main>
            <Suspense fallback={<div className="card">Loading...</div>}>
                <GiveawayForm reviewUrl={reviewUrl} />
            </Suspense>
        </main>
    );
}
