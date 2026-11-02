import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/student-login",
  "Student Login",
  "Sign in to your Skill Grimoire student account to continue your courses, track your skill progress and access your certificates."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
