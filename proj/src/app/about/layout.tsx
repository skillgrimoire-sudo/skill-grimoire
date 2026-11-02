import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/about",
  "About Us: Bridging Academics and Work",
  "Skill Grimoire Private Limited is a Bengaluru-based AI-integrated skill development company. We work through schools and colleges so students learn the real work employers expect, not just exam answers."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
