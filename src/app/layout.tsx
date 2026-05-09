import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { ToastFromSearchParams } from "@/components/toast";

export const metadata: Metadata = {
  title: "CourseForge",
  description:
    "A Next.js, Supabase, Stripe, and Claude API course platform portfolio project."
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        <main>{children}</main>
        <Suspense fallback={null}>
          <ToastFromSearchParams />
        </Suspense>
      </body>
    </html>
  );
}
