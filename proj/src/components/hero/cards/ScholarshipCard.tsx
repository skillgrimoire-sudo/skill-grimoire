"use client";

import React from "react";
import { Trophy, Sparkles, Award } from "lucide-react";

export default function ScholarshipCard() {
  return (
    <div className="sg-card p-3.5 w-full h-full flex items-center justify-between gap-3 group hover:border-[#E5B869]/60 transition-all duration-300">
      {/* 3D Gold Trophy Icon Container */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFF1C5] via-[#E5B869] to-[#996515] p-[1.5px] shadow-[0_0_20px_rgba(229,184,105,0.4)] shrink-0 flex items-center justify-center">
        <div className="w-full h-full bg-[#0E1729] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent pointer-events-none" />
          <Trophy className="w-6 h-6 text-[#F5D075] animate-pulse-glow" />
        </div>
      </div>

      {/* Scholarship Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#E5B869] uppercase tracking-wider font-bold">
            Founders Grant
          </span>
          <Sparkles className="w-2.5 h-2.5 text-[#E5B869]" />
        </div>
        <h4 className="font-serif font-bold text-white text-xs sm:text-sm tracking-wide truncate">
          Top Performer
        </h4>
        <p className="text-[11px] text-gray-300 truncate">
          You are eligible for Founders Grant
        </p>
      </div>

      <div className="hidden sm:flex flex-col items-end shrink-0">
        <span className="text-[10px] font-bold text-[#E5B869] bg-[#E5B869]/10 border border-[#E5B869]/25 px-2 py-0.5 rounded-full">
          Merit Grant
        </span>
      </div>
    </div>
  );
}
