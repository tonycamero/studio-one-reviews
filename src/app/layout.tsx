import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Studio One Café Giveaway",
    description: "Join our weekly giveaway and win prizes!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-neutral-950 text-neutral-50 antialiased`}>
                {children}
            </body>
        </html>
    );
}
