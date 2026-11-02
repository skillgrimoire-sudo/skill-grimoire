// Central place for search-engine (SEO) settings used across the site.

export const SITE_URL = "https://skillgrimoire.com";
export const SITE_NAME = "Skill Grimoire";
export const LEGAL_NAME = "Skill Grimoire Private Limited";
export const CONTACT_EMAIL = "office@skillgrimoire.com";

export const DEFAULT_DESCRIPTION =
  "Skill Grimoire is a Bengaluru-based AI-integrated skill development company. We partner with schools, junior and PU colleges, and degree colleges across India to deliver practical, job-ready skill programmes for Class 10, Class 11 and 12, undergraduate and postgraduate students, with free access for rural and aided institutions.";

export const KEYWORDS = [
  "Skill Grimoire",
  "skill development company Bengaluru",
  "AI skill development for students",
  "AI courses for school students",
  "skill development programme for colleges",
  "employability skills training",
  "placement readiness training for colleges",
  "career guidance after 10th",
  "skill courses for Class 11 and 12 students",
  "free AI course for rural students",
  "EdTech India",
  "Founder's Grant Challenge",
];

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/company/skillgrimoire/",
  "https://youtu.be/B3pLlC2T6Pw",
];

/** Safely turns structured data into a string for a <script type="application/ld+json"> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      legalName: LEGAL_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/sg_nav_logo.png`,
      image: `${SITE_URL}/og-image.jpg`,
      description: DEFAULT_DESCRIPTION,
      email: CONTACT_EMAIL,
      foundingDate: "2026",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      areaServed: { "@type": "Country", name: "India" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: CONTACT_EMAIL,
        areaServed: "IN",
        availableLanguage: ["English", "Kannada"],
      },
      sameAs: SOCIAL_PROFILES,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Skill Grimoire — AI-integrated skill development for schools and colleges",
};

/** Builds the title, description, canonical link and social-share preview for one page. */
export function pageMetadata(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      locale: "en_IN",
      url: path,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** For private pages (logins, admin, course player) that should never appear in Google. */
export const noIndex = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
