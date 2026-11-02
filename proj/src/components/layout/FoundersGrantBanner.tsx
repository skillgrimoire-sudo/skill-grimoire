"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";

/**
 * FoundersGrantBanner:
 * Scrolling announcement bar shown at the very top of every public page.
 * The whole bar links to the Founder's Grant Challenge page (/register).
 * Hidden on admin pages. To remove it after the event, delete <FoundersGrantBanner /> from app/layout.tsx.
 */
const ITEMS = [
  "Founder’s Grant Challenge 2027",
  "₹3 Lakh+ prize pool",
  "Free registration for UG and PG students",
  "Teams of 2–4 · 10 sectors · All of India",
  "Registration: 8 Nov 2026 – 31 Jan 2027",
  "Grand Finals: 7–9 May 2027, Bengaluru",
];

export default function FoundersGrantBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const row = (copy: number) => (
    <div className="fgc-marquee-group" aria-hidden={copy > 0 ? true : undefined}>
      {ITEMS.map((text) => (
        <span key={`${copy}-${text}`} className="inline-flex items-center gap-3 px-5 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
          {text}
        </span>
      ))}
    </div>
  );

  return (
    <a
      href="/register"
      aria-label="Founder’s Grant Challenge 2027: national innovation challenge for UG and PG students. Free registration. Open the page."
      className="fgc-banner group relative flex items-center w-full h-10 overflow-hidden text-[#140E05] text-[13px] font-semibold tracking-wide no-underline"
    >
      <span className="hidden sm:inline-flex items-center h-full shrink-0 px-4 bg-[#070B12] text-[#F7D794] font-serif text-[12px] tracking-[0.18em] uppercase">
        National Challenge
      </span>

      <div className="fgc-marquee relative flex-1 h-full flex items-center overflow-hidden">
        <div className="fgc-marquee-track flex">
          {row(0)}
          {row(1)}
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 h-full shrink-0 px-4 bg-[#070B12] text-[#F7D794] text-[12.5px] font-semibold group-hover:text-white transition-colors">
        <span className="hidden sm:inline">Register now</span>
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </a>
  );
}
