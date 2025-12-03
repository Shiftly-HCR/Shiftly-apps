import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TamaguiProvider } from "@/providers/TamaguiProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { SessionCacheDebug } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shiftly web app",
  description: "Recrutement HCR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TamaguiProvider>
          <QueryProvider>
            <SessionProvider>
              {children}
              {/* <SessionCacheDebug /> */}
            </SessionProvider>
          </QueryProvider>
        </TamaguiProvider>
      </body>
    </html>
  );
}
