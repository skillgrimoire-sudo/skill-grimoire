import React from "react";
import Navbar from "@/components/layout/Navbar";
import { WeatherProvider } from "@/context/WeatherContext";
import WeatherBackground from "@/components/weather/WeatherBackground";
import { AuthProvider } from "@/context/AuthContext";
import RuralAccessSection from "@/components/landing/RuralAccessSection";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/rural-access",
  "Free Skill Education for Rural Schools",
  "Through the Rural Access Initiative, a share of what partner institutions pay funds AI-integrated skill education for students in rural and aided schools and colleges, completely free, with nothing removed or watered down."
);

export default function RuralAccessPage() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <WeatherBackground>
          <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col w-full px-4 sm:px-6 lg:px-8 pb-12 pt-24">
               <RuralAccessSection />
            </main>
          </div>
        </WeatherBackground>
      </WeatherProvider>
    </AuthProvider>
  );
}
