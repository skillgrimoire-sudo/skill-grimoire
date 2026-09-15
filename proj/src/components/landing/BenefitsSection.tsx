"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Users,
  Building2,
  Briefcase,
  Award,
  Percent,
  Brain,
  BookOpen
} from "lucide-react";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic for a fast start, smooth finish
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export default function BenefitsSection() {
  const students = useCountUp(10000, 2000);
  const institutions = useCountUp(100, 1500);

  const bannerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);

  useEffect(() => {
    const observerCallback = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === bannerRef.current) setBannerVisible(true);
          if (entry.target === listRef.current) setListVisible(true);
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.12 });
    if (bannerRef.current) observer.observe(bannerRef.current);
    if (listRef.current) observer.observe(listRef.current);

    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      title: "Zero upfront cost",
      description: "The fee is embedded in your existing structure. You invest nothing to launch.",
      symbol: <span className="text-[#E5B869] font-bold font-serif text-xl sm:text-2xl">0</span>,
      badgeText: "Zero Cost"
    },
    {
      title: "Revenue share",
      description: "A percentage of every registration comes back to your institution.",
      symbol: <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B869]" />,
      badgeText: "Rev Share"
    },
    {
      title: "Nothing overlaps your syllabus",
      description: "If you already teach it, we don't. Not one wasted hour.",
      symbol: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B869]" />,
      badgeText: "Zero Overlap"
    },
    {
      title: "Taught by AI specialists & experienced professionals in AI field",
      description: "Every educator holds a masters degree in Artificial Intelligence and years of real-world experience in AI industry.",
      symbol: <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B869]" />,
      badgeText: "AI Masters"
    },
    {
      title: "Founders Grant & certificates",
      description: "Recognition your top students can show for themselves.",
      symbol: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B869]" />,
      badgeText: "Grant & Recognition"
    },
    {
      title: "Built for placements",
      description: "Students meet their first job already knowing the work.",
      symbol: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B869]" />,
      badgeText: "Job Ready"
    }
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">

      {/* ── METRICS BANNER CARD ── */}
      <div
        ref={bannerRef}
        className={`pro-card shimmer-on-hover w-full bg-[#0e1627]/12 backdrop-blur-md border border-[#E5B869]/25 rounded-[40px] p-8 md:p-12 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-700 ease-out ${bannerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#d2a344]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#d2a344]/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-12">

          <div ref={students.ref} className="flex flex-col items-center text-center group cursor-default">
            <div className="w-20 h-20 rounded-full border border-[#d2a344]/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#d2a344]/15 group-hover:border-[#E5B869] group-hover:shadow-[0_0_20px_rgba(229,184,105,0.3)] transition-all duration-300">
              <Users className="w-10 h-10 text-[#d2a344]" />
            </div>
            <h3 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#F5D075] to-[#D4A043] mb-2 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
              {students.count.toLocaleString()}+
            </h3>
            <p className="text-gray-300 tracking-wider text-sm uppercase font-semibold">No of Students</p>
          </div>

          <div className="hidden md:block w-[1px] h-32 bg-gradient-to-b from-transparent via-[#d2a344]/50 to-transparent"></div>

          <div ref={institutions.ref} className="flex flex-col items-center text-center group cursor-default">
            <div className="w-20 h-20 rounded-full border border-[#d2a344]/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#d2a344]/15 group-hover:border-[#E5B869] group-hover:shadow-[0_0_20px_rgba(229,184,105,0.3)] transition-all duration-300">
              <Building2 className="w-10 h-10 text-[#d2a344]" />
            </div>
            <h3 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#F5D075] to-[#D4A043] mb-2 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
              {institutions.count}+
            </h3>
            <p className="text-gray-300 tracking-wider text-sm uppercase font-semibold">Partnered Institutions</p>
          </div>

        </div>
      </div>

      {/* ── BENEFITS LIST CARD WITH ONE-BY-ONE SEQUENTIAL REVEAL ── */}
      <div
        ref={listRef}
        className="w-full bg-[#0e1627]/12 backdrop-blur-md border border-[#E5B869]/25 rounded-[40px] p-6 lg:p-10 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] text-white"
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ease-out ${listVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
                }`}
              style={{
                transitionDelay: listVisible ? `${idx * 160}ms` : "0ms",
              }}
            >
              <div className="group pro-card flex flex-col sm:flex-row gap-5 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-[#10192A]/35 border border-white/5 hover:border-[#E5B869]/35 hover:bg-[#10192A]/70 transition-all duration-400 overflow-hidden relative items-start sm:items-center justify-between">

                {/* Left content: Check indicator + Text */}
                <div className="flex flex-1 gap-4 sm:gap-5 items-start relative z-10">
                  <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 flex items-center justify-center group-hover:border-[#E5B869] group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(229,184,105,0.35)] transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5 text-[#E5B869]" />
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-2xl">
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-gray-100 group-hover:text-[#E5B869] transition-colors duration-300">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>

                {/* Right side: Dedicated Symbol Badge (Unified across all points) */}
                <div className="flex items-center gap-3 shrink-0 px-4 py-2.5 rounded-2xl bg-[#0e1627]/60 border border-[#E5B869]/20 group-hover:border-[#E5B869]/45 group-hover:bg-[#10192A]/90 transition-all duration-300 z-10 self-end sm:self-auto">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/25 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(229,184,105,0.3)] transition-all">
                    {benefit.symbol}
                  </div>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-[#E5B869] transition-colors">
                    {benefit.badgeText}
                  </span>
                </div>

                {/* Subtle Background Watermark Symbol on card hover */}
                <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 ease-out z-0">
                  <div className="scale-[4]">
                    {benefit.symbol}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
