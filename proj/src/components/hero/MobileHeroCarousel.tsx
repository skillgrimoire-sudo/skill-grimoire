"use client";

import React from "react";
import Image from "next/image";
import { Play, Sparkles, GraduationCap, Users, Laptop, Award, ChevronDown } from "lucide-react";
import TopCoursesCard from "./cards/TopCoursesCard";
import SkillProgressCard from "./cards/SkillProgressCard";
import CertificateCard from "./cards/CertificateCard";
import ScholarshipCard from "./cards/ScholarshipCard";
import CareerGrowthCard from "./cards/CareerGrowthCard";
import GlobalCommunityCard from "./cards/GlobalCommunityCard";
import PortalCard from "./cards/PortalCard";
import HeroCenterCharacter from "./HeroCenterCharacter";

interface MobileHeroCarouselProps {
  onOpenVideo: () => void;
}

export default function MobileHeroCarousel({ onOpenVideo }: MobileHeroCarouselProps) {
  return (
    <div className="lg:hidden w-full flex flex-col gap-8 sm:gap-12 py-2">
      
      {/* ── CARD 1 (1st Page): Hero Intro & Student Character ── */}
      <div className="pro-card shimmer-on-hover relative w-full bg-[#0e1627]/12 backdrop-blur-md border border-[#E5B869]/25 rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] overflow-hidden flex flex-col justify-between gap-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d2a344]/15 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-md border border-[#E5B869]/30">
              <Image
                src="/images/sg_nav_logo.png"
                alt="Skill Grimoire"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-serif font-bold text-xs tracking-wider text-white">
              SKILL GRIMOIRE
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5B869]/15 border border-[#E5B869]/35">
            <Sparkles className="w-3 h-3 text-[#E5B869]" />
            <span className="text-[9px] font-bold text-[#E5B869] uppercase tracking-wider">
              AI-POWERED FUTURE-READY LEARNING
            </span>
          </div>

          {/* Headings */}
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
            Learn.<br />
            Upskill.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#F5D075] to-[#D4A043]">
              Get Future Ready.
            </span>
          </h1>

          <p className="text-xs text-gray-300 leading-relaxed">
            The all-in-one ecosystem to learn, teach and transform careers with the power of AI.
          </p>

          {/* Video CTA */}
          <a
            href="https://youtu.be/B3pLlC2T6Pw?si=1lIXXt7m1XXNc95Y"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] shadow-[0_4px_20px_rgba(229,184,105,0.4)] active:scale-95 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>View Intro Video</span>
          </a>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5B869]/15">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1627]/40 border border-[#E5B869]/15 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-lg bg-[#10192A]/60 border border-[#E5B869]/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-[#E5B869]" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">100+</div>
                <div className="text-[10px] text-gray-400">Skills</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1627]/40 border border-[#E5B869]/15 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-lg bg-[#10192A]/60 border border-[#E5B869]/30 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-[#E5B869]" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Expert</div>
                <div className="text-[10px] text-gray-400">Instructors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Character Graphic */}
        <div className="relative pt-2">
          <HeroCenterCharacter />
        </div>

        {/* Swipe Down Hint */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
          <span>Swipe down for Curriculum</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#E5B869] animate-bounce" />
        </div>
      </div>

      {/* ── CARD 2 (2nd Page, below 1st): Curriculum & Skill Progress ── */}
      <div className="pro-card shimmer-on-hover relative w-full bg-[#0e1627]/12 backdrop-blur-md border border-[#E5B869]/25 rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] overflow-hidden flex flex-col gap-4">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#d2a344]/12 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 pb-2 border-b border-[#E5B869]/15">
          <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
          <span className="text-xs font-serif font-bold tracking-wider text-[#E5B869] uppercase">
            Curriculum & Mastery
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="w-full">
            <TopCoursesCard />
          </div>
          <div className="w-full">
            <SkillProgressCard />
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5B869]/15">
            <div className="p-2 rounded-xl bg-[#0e1627]/40 border border-[#E5B869]/20 backdrop-blur-sm flex flex-col items-center text-center">
              <GraduationCap className="w-4 h-4 text-[#E5B869] mb-1" />
              <span className="text-[10px] font-bold text-gray-200">Learn</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1627]/40 border border-[#E5B869]/20 backdrop-blur-sm flex flex-col items-center text-center">
              <Laptop className="w-4 h-4 text-[#E5B869] mb-1" />
              <span className="text-[10px] font-bold text-gray-200">Practice</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0e1627]/40 border border-[#E5B869]/20 backdrop-blur-sm flex flex-col items-center text-center">
              <Award className="w-4 h-4 text-[#E5B869] mb-1" />
              <span className="text-[10px] font-bold text-gray-200">Certify</span>
            </div>
          </div>
        </div>

        {/* Swipe Down Hint */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
          <span>Swipe down for Credentials</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#E5B869] animate-bounce" />
        </div>
      </div>

      {/* ── CARD 3 (3rd Page, below 2nd): Credentials, Career & Ecosystem ── */}
      <div className="pro-card shimmer-on-hover relative w-full bg-[#0e1627]/12 backdrop-blur-md border border-[#E5B869]/25 rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] overflow-hidden flex flex-col gap-4">
        {/* Subtle Ambient Glow */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#d2a344]/12 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 pb-2 border-b border-[#E5B869]/15">
          <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
          <span className="text-xs font-serif font-bold tracking-wider text-[#E5B869] uppercase">
            Credentials & Growth
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="w-full">
            <CertificateCard />
          </div>
          <div className="w-full">
            <ScholarshipCard />
          </div>
          <div className="w-full">
            <CareerGrowthCard />
          </div>
          <div className="w-full">
            <GlobalCommunityCard />
          </div>
          <div className="w-full">
            <PortalCard />
          </div>
        </div>

        {/* Swipe Down Hint to SG Card */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-2 border-t border-[#E5B869]/15">
          <span>Continue down to Skill Grimoire Initiative</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#E5B869] animate-bounce" />
        </div>
      </div>

    </div>
  );
}
