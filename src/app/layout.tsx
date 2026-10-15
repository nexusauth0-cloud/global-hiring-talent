import type { Metadata, Viewport } from "next";
import "./globals.css";
import { company, siteUrl } from "@/lib/config";


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} — Workforce Solutions & Recruitment`,
    template: `%s | ${company.name}`,
  },
  description:
    "Global Hiring Talent connects organisations with qualified professionals across technology, engineering, healthcare, finance, logistics and energy through permanent, contract and executive recruitment solutions.",
  applicationName: company.name,
  openGraph: {
    type: "website",
    siteName: company.name,
    title: `${company.name} — Workforce Solutions & Recruitment`,
    description:
      "Permanent, contract and executive recruitment solutions across multiple industries.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b2b4a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen bg-white antialiased">
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-md bg-brand-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
