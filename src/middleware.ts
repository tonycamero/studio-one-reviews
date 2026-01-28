import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;

    if (request.nextUrl.pathname.startsWith("/admin")) {
        // If it's the admin page and NOT authenticated, but it's the login action, allow it
        // Actually, keep it simple: just redirect to home or show login in page
        // Using simple page-level auth is fine for this MVP per instructions
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
