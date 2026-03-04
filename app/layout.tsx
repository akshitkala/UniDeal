import type { Metadata } from "next";
import { DM_Sans, Fraunces, DM_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

const dmSans = DM_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
});

const fraunces = Fraunces({
    variable: "--font-serif",
    subsets: ["latin"],
    weight: "variable",
});

const dmMono = DM_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: "400",
});

export const metadata: Metadata = {
    title: "UniDeal — LPU Campus Marketplace",
    description: "Buy and sell second-hand items on LPU campus.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${dmMono.variable}`}>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}