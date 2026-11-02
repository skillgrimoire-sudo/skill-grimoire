import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import AutoReloadOnIdle from "@/components/layout/AutoReloadOnIdle";
import FoundersGrantBanner from "@/components/layout/FoundersGrantBanner";
import {
  SITE_URL,
  SITE_NAME,
  LEGAL_NAME,
  DEFAULT_DESCRIPTION,
  KEYWORDS,
  organizationJsonLd,
  jsonLd,
} from "@/lib/seo";

const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Skill Grimoire | AI Skill Development for Schools & Colleges in India",
    template: "%s | Skill Grimoire",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: LEGAL_NAME, url: SITE_URL }],
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: "Skill Grimoire | AI Skill Development for Schools & Colleges in India",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Skill Grimoire — AI-integrated skill development for schools and colleges",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Grimoire | AI Skill Development for Schools & Colleges in India",
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/favicon_zoomed.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/images/favicon_zoomed.png",
    apple: "/images/favicon_zoomed.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={`${cinzel.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen bg-[#070B12] text-gray-100 font-sans antialiased selection:bg-[#E5B869] selection:text-black flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
        />
        <AutoReloadOnIdle />
        <FoundersGrantBanner />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
