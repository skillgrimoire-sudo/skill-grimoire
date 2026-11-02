import React from "react";
import { cookies } from "next/headers";
import { WeatherProvider } from "@/context/WeatherContext";
import { AuthProvider } from "@/context/AuthContext";
import WeatherBackground from "@/components/weather/WeatherBackground";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import LandingHeroSection from "@/components/landing/LandingHeroSection";
import GapsSection from "@/components/landing/GapsSection";
import PartnershipSection from "@/components/landing/PartnershipSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import PartnerFinaleSection from "@/components/landing/PartnerFinaleSection";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata(
    "/",
    "AI Skill Development for Schools & Colleges in India",
    "Skill Grimoire partners with schools, junior and PU colleges, and degree colleges across India to deliver AI-integrated, job-ready skill programmes, from Class 10 career guidance to undergraduate and postgraduate courses. Free for rural and aided institutions."
  ),
  title: { absolute: "Skill Grimoire | AI Skill Development for Schools & Colleges in India" },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  let isStudent = false;

  if (token) {
    const payload = await verifyJwt(token);
    // Any non-admin logged-in user is treated as a student
    if (payload && payload.role !== "ADMIN") {
      isStudent = true;
    }
  }

  return (
    <AuthProvider>
      <WeatherProvider>
        <WeatherBackground>
          {/* Top Institutional Navigation Bar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="relative z-10 flex flex-col justify-between">
            {isStudent ? (
              <StudentDashboard />
            ) : (
              <div className="flex flex-col gap-12 w-full max-w-screen-2xl mx-auto pb-24">
                <HeroSection />
                <LandingHeroSection />
                <GapsSection />
                <PartnershipSection />
                <BenefitsSection />
                <PartnerFinaleSection />
              </div>
            )}
          </main>
        </WeatherBackground>
      </WeatherProvider>
    </AuthProvider>
  );
}
