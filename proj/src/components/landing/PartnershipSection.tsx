"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Handshake, MonitorSmartphone, MonitorPlay, TrendingUp } from "lucide-react";

export default function PartnershipSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      id: "01",
      title: "We partner with your institution.",
      description: "A simple agreement, no infrastructure, no staffing, nothing for you to build.",
      image: "/images/partnership_handshake_v2.jpg",
      icon: <Handshake className="w-6 h-6 text-[#E5B869]" />
    },
    {
      id: "02",
      title: "Registration is built into your existing fee.",
      description: "Students are enrolled as part of what they already pay. Zero upfront cost to the institution.",
      image: "/images/partnership_registration_v2.jpg",
      icon: <MonitorSmartphone className="w-6 h-6 text-[#E5B869]" />
    },
    {
      id: "03",
      title: "Students learn through recorded lessons.",
      description: "Structured, level-tiered, taught by educators with master's degrees in AI — delivered entirely through your institution.",
      image: "/images/partnership_learning.jpg",
      icon: <MonitorPlay className="w-6 h-6 text-[#E5B869]" />
    },
    {
      id: "04",
      title: "You earn a revenue share.",
      description: "Top performers earn the Founder's Grant and certificates. Your outcomes improve.",
      image: "/images/partnership_growth.jpg",
      icon: <TrendingUp className="w-6 h-6 text-[#E5B869]" />
    }
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        ref={cardRef}
        className={`pro-card shimmer-on-hover bg-[#0e1627]/12 backdrop-blur-md border border-[#E5B869]/25 rounded-[40px] p-8 lg:p-12 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 text-[#E5B869] text-xs font-bold tracking-widest uppercase">
            The Partnership
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight flex items-center gap-4">
            How it works.
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#F5D075] to-[#E5B869] mt-4 rounded-full"></div>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group pro-card flex flex-col lg:flex-row gap-8 items-center p-6 sm:p-8 rounded-3xl bg-[#10192A]/30 border border-white/5 hover:border-[#E5B869]/35 hover:bg-[#10192A]/60 transition-all duration-500 overflow-hidden"
            >
              {/* Text Side */}
              <div className="flex-1 flex gap-6 w-full">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F5D075] to-[#C69234] shrink-0 flex items-center justify-center shadow-lg text-black font-serif text-2xl font-bold group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(229,184,105,0.45)] transition-all duration-300">
                  {step.id}
                </div>
                <div className="flex flex-col pt-1 max-w-md">
                  <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-[#E5B869] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Image Side */}
              <div className="flex-1 relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden shadow-lg border border-[#E5B869]/20 group-hover:border-[#E5B869]/45 transition-colors duration-500">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#E5B869]/60 bg-[#10192A]/70 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:border-[#E5B869] transition-all duration-300">
                  {step.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
