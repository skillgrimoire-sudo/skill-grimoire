import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/contact",
  "Contact Us",
  "Contact Skill Grimoire, Bengaluru, for partnership, programme and institutional enquiries. Email office@skillgrimoire.com and our support desk will respond promptly."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
