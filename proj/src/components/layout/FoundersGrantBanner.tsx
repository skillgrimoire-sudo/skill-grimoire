"use client";

import { usePathname } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";

/**
 * FoundersGrantBanner:
 * Bold scrolling announcement bar at the very top of every public page.
 * The whole bar links to the Founder's Grant Challenge page (/register).
 * Hidden on admin pages. To remove it after the event, delete <FoundersGrantBanner /> from app/layout.tsx.
 *
 * To change the wording, edit ITEMS below.
 *   kind "title" → large gold-on-black headline
 *   kind "prize" → black chip with gold text (stands out most)
 *   no kind      → bold dark text on the gold strip
 */
type Item = { text: string; kind?: "title" | "prize" };

const ITEMS: Item[] = [
  { text: "Founder’s Grant Challenge 2027", kind: "title" },
  { text: "₹3 Lakh+ Prize Pool", kind: "prize" },
  { text: "Free Registration" },
  { text: "UG & PG Students · All of India" },
  { text: "Team of 2–4 Members · 10 Sectors" },
  { text: "Registration: 8 Nov 2026 – 31 Jan 2027" },
  { text: "Grand Finals in Bengaluru" },
];

function Piece({ item }: { item: Item }) {
  if (item.kind === "title") {
    return <span className="fgc-title">{item.text}</span>;
  }
  if (item.kind === "prize") {
    return (
      <span className="fgc-prize">
        <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
        {item.text}
      </span>
    );
  }
  return <span className="fgc-item">{item.text}</span>;
}

export default function FoundersGrantBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const row = (copy: number) => (
    <div className="fgc-marquee-group" aria-hidden={copy > 0 ? true : undefined}>
      {ITEMS.map((item) => (
        <span key={`${copy}-${item.text}`} className="inline-flex items-center">
          <Piece item={item} />
          <span className="fgc-sep" aria-hidden="true">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <a
      href="/register"
      aria-label="Founder’s Grant Challenge 2027: national innovation challenge for UG and PG students. ₹3 Lakh+ prize pool. Free registration. Register now."
      className="fgc-banner group relative flex items-stretch w-full overflow-hidden no-underline"
    >
      {/* Left badge */}
      <span className="fgc-badge">
        <span className="fgc-dot" aria-hidden="true" />
        <span className="hidden sm:inline">National Challenge</span>
      </span>

      {/* Scrolling text */}
      <div className="fgc-marquee relative flex-1 flex items-center overflow-hidden">
        <div className="fgc-marquee-track flex">
          {row(0)}
          {row(1)}
        </div>
      </div>

      {/* Call to action */}
      <span className="fgc-cta-wrap">
        <span className="fgc-cta">
          <span className="hidden sm:inline">Register Now</span>
          <span className="sm:hidden">Register</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </span>
    </a>
  );
}
