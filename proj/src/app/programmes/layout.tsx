import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/programmes",
  "Skill Courses for Class 10, PUC, UG & PG",
  "Four tiers of AI-integrated skill programmes: career and stream guidance for Class 10, AI workplace skills for 11th and 12th (PUC), and professional skills in Finance, Marketing and HR for undergraduate and postgraduate students."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
