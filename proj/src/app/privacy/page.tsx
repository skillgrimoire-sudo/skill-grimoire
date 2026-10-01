import React from "react";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { WeatherProvider } from "@/context/WeatherContext";
import WeatherBackground from "@/components/weather/WeatherBackground";

export default function PrivacyPolicyPage() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <WeatherBackground>
          <div className="min-h-screen bg-[#060B14] flex flex-col font-sans">
            <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-gray-300">
        <h1 className="text-4xl font-bold text-white mb-2">Skill Grimoire — Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective date: October 2026 &middot; Last updated: October 2026</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <p className="mb-4">
              <strong>Skill Grimoire Private Limited</strong> (&quot;Skill Grimoire&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a private limited company incorporated under the Companies Act, 2013 (CIN: U85499KA2026PTC228844), having its registered office at No. 56, Sri Maruthi Nilaya, Doddabidarakallu, Nagasandra, Bangalore North, Bengaluru, Karnataka 560073, India. Contact for support and data requests: <strong>office@skillgrimoire.com</strong>. Partnership enquiries: <strong>school@skillgrimoire.com</strong> (schools), <strong>pu@skillgrimoire.com</strong> (PU / Classes 11–12), <strong>college@skillgrimoire.com</strong> (degree colleges).
            </p>
            <p className="mb-4">
              This Privacy Policy explains how we collect, use, share and protect personal data when you register on our website, use our courses, participate in our assessments, challenges and the Founder&apos;s Grant, or otherwise interact with us. It is published in accordance with the <strong>Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;)</strong>, the Information Technology Act, 2000 and rules thereunder, and other applicable Indian law. Skill Grimoire is the <strong>Data Fiduciary</strong> for the personal data described here.
            </p>
            <p>
              By registering on our website or clicking &quot;I Agree&quot;, you (and, if you are under 18, your parent or legal guardian on your behalf) consent to the practices described in this Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Who this Policy covers</h2>
            <p>
              Students of our partner schools and colleges who register for Skill Grimoire courses; parents/guardians of students below 18; and visitors to our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Personal data we collect</h2>
            <div className="space-y-4">
              <p><strong>A. Data you provide at registration:</strong> full name; date of birth; class/year of study; institution name and institution code; email address; mobile number; parent/guardian name, contact details and consent confirmation (for students under 18); city/state.</p>
              <p><strong>B. Data generated when you use our services:</strong> course progress and completion records; assessment responses, challenge submissions and scores (including scores generated with the assistance of automated/AI evaluation systems); award, grant and certificate records, including any venture proposal or supporting material you submit for the Founder&apos;s Grant; support queries and communications with us.</p>
              <p><strong>C. Technical data:</strong> device type, browser, IP address, log data, and cookies (see Clause 9).</p>
              <p><strong>D. Optional location data:</strong> our website can display a live sky/weather theme. If you grant your browser&apos;s location permission, your <strong>approximate location is used only in your browser</strong> to fetch local sunrise/sunset and weather from a third-party weather service (Open-Meteo). <strong>We do not store your location on our servers.</strong> Declining this permission does not affect access to courses.</p>
              <p><strong>E. Payment data:</strong> where fees are collected by your institution, we receive only enrolment confirmation from the institution — not your payment details. If you ever pay us directly online, payments are processed by an RBI-authorised payment gateway; we do not store your card, UPI or banking credentials.</p>
              <p>We do <strong>not</strong> knowingly collect sensitive data such as religion, caste, health information, passwords to third-party services, or biometric data. Please do not upload such information.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Children&apos;s data (students under 18)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registration by a student under 18 requires <strong>verifiable consent of a parent or legal guardian</strong>, obtained as part of the registration flow, as required by Section 9 of the DPDP Act.</li>
              <li>We do <strong>not</strong> undertake behavioural monitoring of children or serve targeted advertising to children. We do not display third-party advertising on our platform at all.</li>
              <li>A parent/guardian may exercise any of the rights in Clause 8 on the child&apos;s behalf.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Purposes for which we use your data</h2>
            <p className="mb-4">
              We use personal data only to: (a) create and manage your account and verify your enrolment through your institution; (b) deliver courses, recorded lessons, and monthly live classes; (c) conduct assessments and challenges, evaluate submissions (including with AI-assisted evaluation), publish results and leaderboards, and award certificates; (c-i) receive, evaluate and administer applications and proposals under the Founder&apos;s Grant, including any interviews, presentations or defence sessions forming part of that evaluation; (d) issue and verify certificates (including QR-based verification); (e) send you service communications by SMS, WhatsApp, email or in-app notification (class schedules, challenge dates, results, certificates); (f) share limited reports with your institution as described in Clause 5; (g) improve our courses and platform; (h) maintain security, prevent fraud and malpractice; and (i) comply with law, including tax and audit obligations.
            </p>
            <p>
              We will not use your personal data for purposes materially different from the above without fresh notice and consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Who we share data with</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Your institution:</strong> enrolment status, course completion, participation and results in assessments/challenges, and the identity of certificate and Founder&apos;s Grant recipients. Aggregate performance reports may also be shared. This sharing is inherent to the programme and is a condition of enrolment.</li>
              <li><strong>Service providers (Data Processors):</strong> hosting, video delivery, communication (SMS/WhatsApp/email) and payment providers, bound by contract to process data only on our instructions.</li>
              <li><strong>Weather service:</strong> if you enable the location feature, your browser contacts Open-Meteo directly; we receive nothing.</li>
              <li><strong>Legal:</strong> courts, law-enforcement or regulators where required by law; and any successor entity if our business is reorganised or transferred, subject to this Policy.</li>
            </ul>
            <p className="mt-4">We do <strong>not sell</strong> personal data. We do <strong>not</strong> share personal data with advertisers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Storage, security and retention</h2>
            <p className="mb-4">
              Data is stored on reputable cloud infrastructure with reasonable security safeguards appropriate to the nature of the data, including encryption in transit and access controls, as required under the DPDP Act and IT Act. No system is perfectly secure; you use the platform at your own risk to the extent permitted by law, and you must keep your login credentials confidential.
            </p>
            <p>
              We retain: (a) account and course data while your account is active and for up to <strong>3 years</strong> thereafter; (b) <strong>certificate, award and Founder&apos;s Grant records for up to 8 years</strong>, so that certificates remain verifiable and to meet tax/audit obligations; (c) data required for legal compliance, for the period required by law. Thereafter data is deleted or irreversibly anonymised.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and analytics</h2>
            <p>
              We use essential cookies for login and session management, and basic analytics to understand aggregate usage. You can control cookies through your browser; disabling essential cookies may break login.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your rights (Data Principal rights under the DPDP Act)</h2>
            <p className="mb-4">
              You (or your parent/guardian, for minors) have the right to: (a) <strong>access</strong> a summary of your personal data and processing activities; (b) <strong>correct or update</strong> inaccurate or incomplete data; (c) <strong>erase</strong> data that is no longer necessary for the stated purposes (note: erasure of assessment or certificate records may make your certificate unverifiable and may end your participation in the programme); (d) <strong>grievance redressal</strong> as per Clause 10; (e) <strong>nominate</strong> a person to exercise your rights in case of death or incapacity; and (f) <strong>withdraw consent</strong> at any time, with the consequence that we may be unable to continue providing the services. Withdrawal does not affect processing already carried out.
            </p>
            <p>
              To exercise any right, email <strong>office@skillgrimoire.com</strong> from your registered email with the subject &quot;Data Request&quot;. We will respond within the timelines prescribed under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Duties of Data Principals</h2>
            <p>
              Under the DPDP Act you must not impersonate another person, suppress material information, or register false or frivolous grievances or complaints.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Grievance Officer</h2>
            <p className="mb-4">
              <strong>Grievance Officer:</strong> Grievance Officer appointed as per company policy, Skill Grimoire Private Limited, No. 56, Sri Maruthi Nilaya, Doddabidarakallu, Nagasandra, Bangalore North, Bengaluru, Karnataka 560073. Email: <strong>office@skillgrimoire.com</strong> (subject line &quot;Grievance&quot;).
            </p>
            <p>
              We acknowledge complaints promptly and endeavour to resolve them within the timelines under applicable law. If you remain unsatisfied, you may approach the <strong>Data Protection Board of India</strong> as provided under the DPDP Act.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to this Policy</h2>
            <p>
              We may update this Policy from time to time. Material changes will be notified on the website or by email/SMS. Continued use after the effective date of a change constitutes acceptance. The current version will always be available on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Governing law</h2>
            <p>
              This Policy is governed by the laws of India. Subject to Clause 10, the courts at <strong>Bengaluru, Karnataka</strong> shall have exclusive jurisdiction.
            </p>
          </section>
        </div>
      </main>
          </div>
        </WeatherBackground>
      </WeatherProvider>
    </AuthProvider>
  );
}
