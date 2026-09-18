"use client";

import React, { useState } from "react";
import { Sparkles, Play, GraduationCap, Users } from "lucide-react";
import TopCoursesCard from "./cards/TopCoursesCard";
import SkillProgressCard from "./cards/SkillProgressCard";
import CertificateCard from "./cards/CertificateCard";
import ScholarshipCard from "./cards/ScholarshipCard";
import AiMentorCard from "./cards/AiMentorCard";
import LearningPathsCard from "./cards/LearningPathsCard";
import RecordedClassesCard from "./cards/RecordedClassesCard";
import GlobalCommunityCard from "./cards/GlobalCommunityCard";
import CareerGrowthCard from "./cards/CareerGrowthCard";
import PortalCard from "./cards/PortalCard";
import BottomProcessStrip from "./cards/BottomProcessStrip";
import HeroCenterCharacter from "./HeroCenterCharacter";
import VideoModal from "./VideoModal";
import MobileHeroCarousel from "./MobileHeroCarousel";

export default function HeroSection() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
      <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />

      {/* ======= DESKTOP VIEW ======= */}
      <div className="hidden lg:flex lg:flex-col gap-3.5">

        {/* ── ROW 1: Left Hero column (3 cols) + HUD Grid Right (9 cols) ─────── */}
        <div className="grid grid-cols-12 gap-3.5 items-stretch">

          {/* Left: brand + CTA + stats */}
          <div className="col-span-3 flex flex-col justify-between gap-4">

            {/* Brand messaging */}
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5B869]/15 border border-[#E5B869]/35 self-start">
                <Sparkles className="w-3 h-3 text-[#E5B869]" />
                <span className="text-[9px] font-bold tracking-wider text-[#E5B869] uppercase">
                  AI-POWERED FUTURE-READY LEARNING
                </span>
              </div>

              <h1 className="font-serif text-4xl xl:text-[42px] font-extrabold text-white leading-[1.1] tracking-tight">
                Learn.<br />Upskill.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#F5D075] to-[#D4A043]">
                  Get Future Ready.
                </span>
              </h1>

              <p className="text-xs text-gray-300 leading-relaxed">
                The all-in-one ecosystem to learn, teach and transform careers with the power of AI.
              </p>

              <a
                href="https://youtu.be/B3pLlC2T6Pw?si=1lIXXt7m1XXNc95Y"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(229,184,105,0.45)] transition-all duration-200 cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-black ml-0.5" />
                </div>
                View Intro Video
              </a>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E5B869]/20">
                {[
                  { icon: <GraduationCap className="w-3.5 h-3.5 text-[#E5B869]" />, value: "100+", label: "Skills" },
                  { icon: <Users className="w-3.5 h-3.5 text-[#E5B869]" />, value: "Expert", label: "Instructors" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1627]/70 border border-[#E5B869]/15">
                    <div className="w-7 h-7 rounded-lg bg-[#10192A] border border-[#E5B869]/30 flex items-center justify-center shrink-0">
                      {s.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs leading-tight">{s.value}</div>
                      <div className="text-[10px] text-gray-400">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Community fills remaining space */}
            <div className="flex-1 min-h-0">
              <GlobalCommunityCard />
            </div>
          </div>

          {/* Right: 3-column equal HUD grid — each column has 3 fixed-height rows */}
          <div className="col-span-9 grid grid-cols-3 gap-3.5">

            {/* ── Col A ── */}
            <div className="flex flex-col gap-3.5">
              {/* A1 */}
              <div className="h-[200px] overflow-hidden">
                <TopCoursesCard />
              </div>
              {/* A2 */}
              <div className="h-[200px] overflow-hidden">
                <AiMentorCard />
              </div>
              {/* A3 */}
              <div className="h-[200px] overflow-hidden">
                <LearningPathsCard />
              </div>
            </div>

            {/* ── Col B (centre) ── */}
            <div className="flex flex-col gap-3.5">
              {/* B1 */}
              <div className="h-[200px] overflow-hidden">
                <SkillProgressCard />
              </div>
              {/* B2 – Student visual, constrained height */}
              <div className="h-[200px] overflow-hidden">
                <HeroCenterCharacter />
              </div>
              {/* B3 */}
              <div className="h-[200px] overflow-hidden">
                <CareerGrowthCard />
              </div>
            </div>

            {/* ── Col C ── */}
            <div className="flex flex-col gap-3.5">
              {/* C1 */}
              <div className="h-[200px] overflow-hidden">
                <CertificateCard />
              </div>
              {/* C2 – two stacked smaller cards sharing 200px */}
              <div className="h-[200px] flex flex-col gap-2 overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <ScholarshipCard />
                </div>
                <div className="flex-1 overflow-hidden">
                  <RecordedClassesCard />
                </div>
              </div>
              {/* C3 */}
              <div className="h-[200px] overflow-hidden">
                <PortalCard />
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM PROCESS STRIP ─────────────────────────────────────────── */}
        <BottomProcessStrip />
      </div>

      {/* ======= MOBILE VIEW ======= */}
      <MobileHeroCarousel onOpenVideo={() => setVideoModalOpen(true)} />
    </section>
  );
}
