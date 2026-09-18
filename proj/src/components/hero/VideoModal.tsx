"use client";

import React, { useState } from "react";
import { X, Play, Volume2, Sparkles, CheckCircle2, ExternalLink } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0B1220] border border-[#E5B869]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(229,184,105,0.25)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#E5B869]/20 bg-[#070D18]">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#E5B869] shrink-0" />
            <h3 className="font-serif font-semibold text-white text-xs sm:text-base truncate">
              Skill Grimoire — Introduction & AI Ecosystem
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <a
              href="https://youtu.be/B3pLlC2T6Pw?si=1lIXXt7m1XXNc95Y"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#E5B869] hover:bg-[#E5B869]/10 border border-[#E5B869]/30 transition"
              title="Open in YouTube"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 active:scale-95 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden">
          {isPlaying ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/B3pLlC2T6Pw?autoplay=1&rel=0"
              title="Skill Grimoire Introduction Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-[#060A14] via-[#0E1729] to-[#040710] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              {/* Simulated Cinematic Video Graphic */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E5B869_1px,transparent_1px)] [background-size:24px_24px]" />

              <div className="relative z-10 max-w-md space-y-3 sm:space-y-4">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-[#E5B869] to-[#FFF0C0] p-1 shadow-[0_0_30px_rgba(229,184,105,0.6)] flex items-center justify-center cursor-pointer group active:scale-95 transition-transform"
                  aria-label="Play video"
                >
                  <div className="w-full h-full bg-[#0B1220] rounded-full flex items-center justify-center group-hover:bg-[#121B2D] transition">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-[#E5B869] fill-[#E5B869] ml-0.5 sm:ml-1" />
                  </div>
                </button>

                <div>
                  <h4 className="font-serif text-base sm:text-xl font-bold text-white mb-1">
                    Transforming Education with AI Intelligence
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-2 sm:line-clamp-none">
                    Discover how Skill Grimoire bridges academia and high-impact industry careers through tailored AI pathways.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#E5B869] font-medium pt-1 sm:pt-2">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100+ AI Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Mentorship
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Global Certifications
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
