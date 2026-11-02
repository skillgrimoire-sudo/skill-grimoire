import type { Metadata } from "next";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/institutions",
  "Skill Programmes for Schools & Colleges",
  "Partner with Skill Grimoire to bring AI-integrated skill development and placement readiness to your school, junior or PU college, or degree college anywhere in India. We handle curriculum, delivery, assessment and certificates alongside your syllabus."
);

// The same questions and answers shown in the FAQ on this page, so Google can show them in search results.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  url: `${SITE_URL}/institutions`,
  mainEntity: [
    {
      q: "Does it clash with our syllabus?",
      a: "No. Our programmes run as parallel workshops or after-school digital sessions, perfectly complementing existing academics without interference.",
    },
    {
      q: "What does the institution need to provide?",
      a: "Simply student enrollment data and a primary point of contact. We handle all technical infrastructure and content delivery.",
    },
    {
      q: "How are students assessed?",
      a: "Through project-based evaluations, practical quizzes, and AI-driven skill tests integrated seamlessly into the learning platform.",
    },
    {
      q: "Who teaches it?",
      a: "Industry experts and AI-facilitated interactive modules crafted by top-tier curriculum designers.",
    },
  ].map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
      {children}
    </>
  );
}
