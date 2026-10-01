"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ScrollText,
  Shield,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  FileText,
  Eye,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WeatherProvider } from "@/context/WeatherContext";
import WeatherBackground from "@/components/weather/WeatherBackground";

// ── Accept Terms Content ──────────────────────────────────────────────────────

function AcceptTermsContent() {
  const { user, isLoading, refresh } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [hasScrolledPrivacy, setHasScrolledPrivacy] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/student-login");
      return;
    }
    // If already accepted, go home
    if (user.termsAcceptedAt) {
      router.replace("/");
      return;
    }
  }, [isLoading, user, router]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) {
      if (activeTab === "terms") setHasScrolledTerms(true);
      else setHasScrolledPrivacy(true);
    }
  };

  const handleAccept = async () => {
    if (!termsChecked || !privacyChecked) {
      setError("Please read and accept both the Terms & Conditions and Privacy Policy.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/accept-terms", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to record acceptance. Please try again.");
        return;
      }
      await refresh();
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-2 border-[#E5B869] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-sm text-center">
          <div className="sg-card overflow-hidden p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-serif font-bold text-xl text-white mb-2">Welcome, {user.name || user.username}!</h2>
            <p className="text-sm text-gray-400 mb-4">
              You&apos;ve accepted our Terms &amp; Conditions. Redirecting to your dashboard...
            </p>
            <div className="w-8 h-8 border-2 border-[#E5B869] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative z-10">
      <div className="w-full max-w-2xl">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 mb-3">
            <span className="text-[#E5B869] text-xs font-semibold tracking-widest uppercase">✦ Skill Grimoire</span>
          </div>
          <p className="text-gray-500 text-xs">Please review and accept before continuing</p>
        </div>

        <div className="sg-card overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E5B869]/15 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#E5B869] to-[#C69234] flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(229,184,105,0.4)]">
              <ScrollText className="w-6 h-6 text-black" />
            </div>
            <h2 className="font-serif font-bold text-lg text-white">Terms & Conditions</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Please review and accept our policies to continue using Skill Grimoire
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="px-6 pt-4">
            <div className="flex bg-[#080E1C] rounded-xl p-1 border border-[#1E2D45]">
              <button
                onClick={() => setActiveTab("terms")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "terms"
                    ? "bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Terms & Conditions
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "privacy"
                    ? "bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="px-6 pt-4">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-[340px] overflow-y-auto rounded-xl bg-[#060B14] border border-[#1E2D45] p-5 text-xs text-gray-300 leading-relaxed custom-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>

            {/* Scroll hint */}
            {((activeTab === "terms" && !hasScrolledTerms) ||
              (activeTab === "privacy" && !hasScrolledPrivacy)) && (
              <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-[#E5B869]/70 animate-pulse">
                <ChevronDown className="w-3 h-3" />
                <span>Scroll to read the full document</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Checkboxes & Submit */}
          <div className="px-6 py-5 space-y-4">
            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                  termsChecked
                    ? "bg-[#E5B869] border-[#E5B869] shadow-[0_0_10px_rgba(229,184,105,0.4)]"
                    : "border-[#1E2D45] bg-[#080E1C] group-hover:border-[#E5B869]/50"
                }`}>
                  {termsChecked && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-300 leading-relaxed">
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" className="text-[#E5B869] hover:text-white underline underline-offset-2 font-medium inline-flex items-center gap-0.5">
                  Terms & Conditions <Eye className="w-3 h-3 inline" />
                </a>
              </span>
            </label>

            {/* Privacy checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                  privacyChecked
                    ? "bg-[#E5B869] border-[#E5B869] shadow-[0_0_10px_rgba(229,184,105,0.4)]"
                    : "border-[#1E2D45] bg-[#080E1C] group-hover:border-[#E5B869]/50"
                }`}>
                  {privacyChecked && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-300 leading-relaxed">
                I have read and agree to the{" "}
                <a href="/privacy" target="_blank" className="text-[#E5B869] hover:text-white underline underline-offset-2 font-medium inline-flex items-center gap-0.5">
                  Privacy Policy <Eye className="w-3 h-3 inline" />
                </a>
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Accept button */}
            <button
              onClick={handleAccept}
              disabled={isSubmitting || !termsChecked || !privacyChecked}
              className="w-full py-3 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  I Accept — Continue to Skill Grimoire
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-600 text-center leading-relaxed">
              By clicking &quot;I Accept&quot;, you confirm that you (or your parent/legal guardian, if you are under 18)
              have read, understood and agree to be bound by our Terms &amp; Conditions and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(229, 184, 105, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(229, 184, 105, 0.4);
        }
      `}</style>
    </div>
  );
}

// ── Terms Content (inline) ────────────────────────────────────────────────────

function TermsContent() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white mb-1">Skill Grimoire — Terms & Conditions (Student Registration)</h3>
        <p className="text-[10px] text-gray-500">Effective date: October 2026 · Last updated: October 2026</p>
      </div>
      <p>
        These Terms & Conditions (&quot;Terms&quot;) are an electronic record under the Information Technology Act, 2000 and a legally binding agreement between <strong className="text-white">Skill Grimoire Private Limited</strong>, a private limited company incorporated under the Companies Act, 2013 (CIN: U85499KA2026PTC228844), having its registered office at No. 56, Sri Maruthi Nilaya, Doddabidarakallu, Nagasandra, Bangalore North, Bengaluru, Karnataka 560073, India (&quot;Skill Grimoire&quot;, &quot;we&quot;, &quot;us&quot;) and the person registering on our website (&quot;you&quot;, &quot;Student&quot;).
      </p>
      <p>
        <strong className="text-white">If the Student is under 18 years of age</strong>, these Terms are entered into by the Student&apos;s parent or legal guardian on the Student&apos;s behalf (a contract with a minor being void under the Indian Contract Act, 1872), and every reference to &quot;you&quot; includes that parent/guardian. By ticking &quot;I Agree&quot; during registration, you accept these Terms and our Privacy Policy, which forms part of these Terms.
      </p>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">1. Eligibility and registration</h4>
        <p>1.1 Registration is open to students of institutions that have a subsisting partnership agreement with Skill Grimoire, using the institution code provided (&quot;Partner Institution&quot;), and to such other persons as we may permit.</p>
        <p className="mt-1.5">1.2 You must provide true, accurate, current and complete information and keep it updated. One account per Student. Accounts are personal and <strong className="text-white">non-transferable</strong>.</p>
        <p className="mt-1.5">1.3 We may decline, suspend or terminate any registration that is false, duplicate, fraudulent, or in breach of these Terms.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">2. The services</h4>
        <p>2.1 Skill Grimoire provides recorded skill-development lessons, periodic live online classes, assessments and challenges, certificates, and the Founder&apos;s Grant, all as described on our website (&quot;Services&quot;).</p>
        <p className="mt-1.5">2.2 Course content, schedules, features, assessment formats and platform functionality may be <strong className="text-white">modified, updated, replaced or discontinued</strong> by us at any time to keep the programme current, without liability, provided the overall substance of the enrolled course is maintained during your academic year.</p>
        <p className="mt-1.5">2.3 Live classes run subject to educator availability; a missed live class may be substituted with a recording or a rescheduled session at our discretion.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">3. Licence to content; intellectual property</h4>
        <p>3.1 All content on the platform — videos, scripts, presentations, question banks, assessments, certificates, logos, and the marks &quot;Skill Grimoire&quot; and &quot;Build Your Skills&quot; — is owned by or licensed to Skill Grimoire and protected under the Copyright Act, 1957 and the Trade Marks Act, 1999.</p>
        <p className="mt-1.5">3.2 You are granted a <strong className="text-white">limited, personal, non-exclusive, non-transferable, revocable licence</strong> to stream and view the content for your own private, non-commercial learning during your enrolment period only.</p>
        <p className="mt-1.5">3.3 You must <strong className="text-white">not</strong>: download (except where a download button is provided), record, screen-capture, copy, reproduce, share, forward, publish, upload elsewhere, sell, rent, or make the content available to any other person or platform; share your login with anyone; or use the content to build a competing product or to train any machine-learning system.</p>
        <p className="mt-1.5"><strong className="text-red-400">3.4 Breach of Clause 3.3 results in immediate termination of access without refund</strong>, forfeiture of any pending certificate or grant, and entitles us to recover damages and pursue civil and criminal remedies, including under the Copyright Act, 1957 and the Information Technology Act, 2000.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">4. Code of conduct</h4>
        <p>You must not: impersonate any person; use another student&apos;s account; engage in any form of malpractice in assessments or challenges; probe, scrape, reverse-engineer, or interfere with the platform&apos;s security or operation; or upload unlawful, obscene, or infringing material. We may suspend or terminate access for breach, with <strong className="text-white">no refund</strong>.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">5. Assessments, challenges and evaluation</h4>
        <p>5.1 Assessments and challenges (including any live online challenge event) are conducted on dates, formats and rules notified by us. Questions may be <strong className="text-white">randomised per student</strong>.</p>
        <p className="mt-1.5">5.2 Evaluation may be performed by automated systems, <strong className="text-white">including AI-assisted evaluation</strong>, with or without human review. You consent to such evaluation.</p>
        <p className="mt-1.5">5.3 <strong className="text-white">All decisions of Skill Grimoire regarding scores, rankings, eligibility, disqualification, results, grants and certificates are final and binding.</strong></p>
        <p className="mt-1.5">5.4 We are not responsible for your device, power or internet connectivity during any online assessment.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">6. Awards, the Founder&apos;s Grant, and certificates</h4>
        <p>6.1 <strong className="text-white">Certificates</strong> are issued only on satisfying the published completion and assessment criteria. A certificate is a skill certificate issued by Skill Grimoire and is <strong className="text-white">not a degree, diploma or government-approved qualification</strong>.</p>
        <p className="mt-1.5">6.2 <strong className="text-white">The Founder&apos;s Grant</strong> is a discretionary award under which Skill Grimoire may provide funding to a Student who identifies a genuine problem, develops and validates a solution. It is <strong className="text-white">not a scholarship, not a prize, and not an investment</strong>: Skill Grimoire takes no equity, ownership or revenue share.</p>
        <p className="mt-1.5">6.3 Grants are awarded solely on evaluation by Skill Grimoire. <strong className="text-white">No institution has any role in, or influence over, selection.</strong></p>
        <p className="mt-1.5">6.4 The number of grants, their amounts, and whether any grant is made at all in a given cycle are <strong className="text-white">entirely at our discretion</strong>.</p>
        <p className="mt-1.5">6.5 Disbursement may be made to the Student&apos;s or parent&apos;s bank account, at our discretion and after verification.</p>
        <p className="mt-1.5">6.6 Grants and any other awards are <strong className="text-white">subject to deduction of tax at source</strong>. Recipients are advised to obtain their own tax advice.</p>
        <p className="mt-1.5">6.7 Where a recipient is under 18, disbursement requires the written consent of a parent or legal guardian.</p>
        <p className="mt-1.5">6.8 Students enrolled through our free programme receive the same certificate. <strong className="text-white">The Founder&apos;s Grant and other monetary awards are not part of the free programme.</strong></p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">7. Fees, taxes and refunds</h4>
        <p>7.1 Where your Partner Institution collects the course fee, <strong className="text-white">your payment terms and refund are governed by the institution&apos;s policy</strong>.</p>
        <p className="mt-1.5">7.2 Where you pay Skill Grimoire directly: you may cancel within <strong className="text-white">7 days of payment provided you have not accessed any content</strong>; once accessed, fees are non-refundable.</p>
        <p className="mt-1.5">7.3 Prices for future academic years may be revised prospectively.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">8. No guarantee of outcomes</h4>
        <p><strong className="text-white">We do not promise or guarantee any admission, job, internship, placement, salary, or any particular outcome.</strong> Testimonials on our website are illustrative only.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">9. Availability; disclaimer</h4>
        <p>The Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not warrant uninterrupted or error-free operation.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">10. Limitation of liability</h4>
        <p>Our total aggregate liability to you shall not exceed the fees actually received by Skill Grimoire from you for that academic year.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">11. Indemnity</h4>
        <p>You agree to indemnify and hold harmless Skill Grimoire and its directors, employees and partners from any claim arising from your breach of these Terms.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">12. Termination</h4>
        <p>We may suspend or terminate your access immediately for breach of these Terms, malpractice, non-payment, or where your Partner Institution&apos;s agreement with us ends.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">13. Communications</h4>
        <p>You consent to receive service communications from us by SMS, WhatsApp, email and in-app notification.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">14. Governing law and dispute resolution</h4>
        <p>14.1 These Terms are governed by the laws of <strong className="text-white">India</strong>.</p>
        <p className="mt-1.5">14.2 Disputes shall be referred to <strong className="text-white">arbitration by a sole arbitrator seated in Bengaluru, Karnataka</strong>, conducted in English under the Arbitration and Conciliation Act, 1996.</p>
        <p className="mt-1.5">14.3 The courts at <strong className="text-white">Bengaluru, Karnataka</strong> shall have exclusive jurisdiction.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">15. Grievance Officer</h4>
        <p><strong className="text-white">Grievance Officer appointed as per company policy</strong>, Skill Grimoire Private Limited, No. 56, Sri Maruthi Nilaya, Doddabidarakallu, Nagasandra, Bangalore North, Bengaluru, Karnataka 560073 — <strong className="text-white">office@skillgrimoire.com</strong> (subject &quot;Grievance&quot;).</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">16. General</h4>
        <p><strong className="text-white">16.1 Amendments:</strong> We may amend these Terms by posting the updated version on the website.</p>
        <p className="mt-1.5"><strong className="text-white">16.2 Assignment:</strong> You may not assign these Terms. We may assign them to a successor of our business.</p>
        <p className="mt-1.5"><strong className="text-white">16.3 Severability & waiver:</strong> If any clause is held invalid, the rest survive.</p>
        <p className="mt-1.5"><strong className="text-white">16.4 Force majeure:</strong> We are not liable for delay or failure caused by events beyond reasonable control.</p>
        <p className="mt-1.5"><strong className="text-white">16.5 Entire agreement:</strong> These Terms and the Privacy Policy are the entire agreement between you and Skill Grimoire regarding the Services.</p>
      </div>
    </div>
  );
}

// ── Privacy Content (inline) ──────────────────────────────────────────────────

function PrivacyContent() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white mb-1">Skill Grimoire — Privacy Policy</h3>
        <p className="text-[10px] text-gray-500">Effective date: October 2026 · Last updated: October 2026</p>
      </div>
      <p>
        <strong className="text-white">Skill Grimoire Private Limited</strong> (&quot;Skill Grimoire&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a private limited company incorporated under the Companies Act, 2013 (CIN: U85499KA2026PTC228844), having its registered office at No. 56, Sri Maruthi Nilaya, Doddabidarakallu, Nagasandra, Bangalore North, Bengaluru, Karnataka 560073, India. Contact for support and data requests: <strong className="text-white">office@skillgrimoire.com</strong>. Partnership enquiries: <strong className="text-white">school@skillgrimoire.com</strong> (schools), <strong className="text-white">pu@skillgrimoire.com</strong> (PU / Classes 11–12), <strong className="text-white">college@skillgrimoire.com</strong> (degree colleges).
      </p>
      <p>
        This Privacy Policy explains how we collect, use, share and protect personal data when you register on our website, use our courses, participate in our assessments, challenges and the Founder&apos;s Grant, or otherwise interact with us. It is published in accordance with the <strong className="text-white">Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;)</strong>, the Information Technology Act, 2000 and rules thereunder, and other applicable Indian law. Skill Grimoire is the <strong className="text-white">Data Fiduciary</strong> for the personal data described here.
      </p>
      <p>By registering on our website or clicking &quot;I Agree&quot;, you (and, if you are under 18, your parent or legal guardian on your behalf) consent to the practices described in this Policy.</p>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">1. Who this Policy covers</h4>
        <p>Students of our partner schools and colleges who register for Skill Grimoire courses; parents/guardians of students below 18; and visitors to our website.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">2. Personal data we collect</h4>
        <p><strong className="text-white">A. Data you provide at registration:</strong> full name; date of birth; class/year of study; institution name and institution code; email address; mobile number; parent/guardian name, contact details and consent confirmation (for students under 18); city/state.</p>
        <p className="mt-1.5"><strong className="text-white">B. Data generated when you use our services:</strong> course progress and completion records; assessment responses, challenge submissions and scores (including scores generated with the assistance of automated/AI evaluation systems); award, grant and certificate records.</p>
        <p className="mt-1.5"><strong className="text-white">C. Technical data:</strong> device type, browser, IP address, log data, and cookies.</p>
        <p className="mt-1.5"><strong className="text-white">D. Optional location data:</strong> our website can display a live sky/weather theme. If you grant your browser&apos;s location permission, your approximate location is used only in your browser. <strong className="text-white">We do not store your location on our servers.</strong></p>
        <p className="mt-1.5"><strong className="text-white">E. Payment data:</strong> where fees are collected by your institution, we receive only enrolment confirmation — not your payment details.</p>
        <p className="mt-1.5">We do <strong className="text-white">not</strong> knowingly collect sensitive data such as religion, caste, health information, passwords to third-party services, or biometric data.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">3. Children&apos;s data (students under 18)</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>Registration by a student under 18 requires <strong className="text-white">verifiable consent of a parent or legal guardian</strong>, as required by Section 9 of the DPDP Act.</li>
          <li>We do <strong className="text-white">not</strong> undertake behavioural monitoring of children or serve targeted advertising to children.</li>
          <li>A parent/guardian may exercise any rights on the child&apos;s behalf.</li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">4. Purposes for which we use your data</h4>
        <p>We use personal data only to: (a) create and manage your account; (b) deliver courses, recorded lessons, and monthly live classes; (c) conduct assessments and challenges, evaluate submissions (including with AI-assisted evaluation); (c-i) evaluate applications for the Founder&apos;s Grant; (d) issue and verify certificates; (e) send service communications; (f) share limited reports with your institution; (g) improve our platform; (h) maintain security; and (i) comply with law.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">5. Who we share data with</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-white">Your institution:</strong> enrolment status, course completion, results, and certificate/grant recipients.</li>
          <li><strong className="text-white">Service providers (Data Processors):</strong> hosting, video delivery, communication and payment providers.</li>
          <li><strong className="text-white">Weather service:</strong> if you enable location, your browser contacts Open-Meteo directly.</li>
          <li><strong className="text-white">Legal:</strong> courts, law-enforcement or regulators where required by law.</li>
        </ul>
        <p className="mt-2">We do <strong className="text-white">not sell</strong> personal data. We do <strong className="text-white">not</strong> share personal data with advertisers.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">6. Storage, security and retention</h4>
        <p>Data is stored on reputable cloud infrastructure with reasonable security safeguards. We retain: (a) account and course data for up to <strong className="text-white">3 years</strong> after account closure; (b) certificate, award and Founder&apos;s Grant records for up to <strong className="text-white">8 years</strong>.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">7. Cookies and analytics</h4>
        <p>We use essential cookies for login and session management, and basic analytics for aggregate usage.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">8. Your rights (Data Principal rights under the DPDP Act)</h4>
        <p>You have the right to: (a) <strong className="text-white">access</strong> a summary of your data; (b) <strong className="text-white">correct or update</strong> data; (c) <strong className="text-white">erase</strong> data no longer necessary; (d) <strong className="text-white">grievance redressal</strong>; (e) <strong className="text-white">nominate</strong> a person; and (f) <strong className="text-white">withdraw consent</strong>.</p>
        <p className="mt-1.5">To exercise any right, email <strong className="text-white">office@skillgrimoire.com</strong> from your registered email with the subject &quot;Data Request&quot;.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">9. Duties of Data Principals</h4>
        <p>Under the DPDP Act you must not impersonate another person, suppress material information, or register false or frivolous grievances.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">10. Grievance Officer</h4>
        <p><strong className="text-white">Grievance Officer</strong> appointed as per company policy, Skill Grimoire Private Limited, No. 56, Sri Maruthi Nilaya, Doddabidarakallu, Nagasandra, Bangalore North, Bengaluru, Karnataka 560073. Email: <strong className="text-white">office@skillgrimoire.com</strong> (subject line &quot;Grievance&quot;).</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">11. Changes to this Policy</h4>
        <p>We may update this Policy from time to time. Material changes will be notified on the website or by email/SMS.</p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#E5B869] mb-2">12. Governing law</h4>
        <p>This Policy is governed by the laws of India. The courts at <strong className="text-white">Bengaluru, Karnataka</strong> shall have exclusive jurisdiction.</p>
      </div>
    </div>
  );
}

// ── Page Wrapper ──────────────────────────────────────────────────────────────

export default function AcceptTermsPage() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <WeatherBackground>
          <AcceptTermsContent />
        </WeatherBackground>
      </WeatherProvider>
    </AuthProvider>
  );
}
