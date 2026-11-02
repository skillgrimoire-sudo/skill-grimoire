"use client";

import React, { useState } from 'react';
import { Compass, Users, Handshake, ShieldCheck, Leaf, ArrowRight, PlayCircle, CheckCircle2, Landmark, BookOpen, Star, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import RuralAccessModal from './RuralAccessModal';

const RuralAccessSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative w-full min-h-[900px] flex items-center overflow-hidden rounded-3xl my-12" id="rural-access">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/rural_access_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay to ensure text readability */}
      </div>

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-[2rem] shadow-2xl flex flex-col gap-4 max-w-2xl mx-auto lg:mx-0"
        >
          <div className="flex items-center gap-3 text-amber-400 font-semibold tracking-wider text-sm">
            <Compass className="w-5 h-5" />
            <span className="uppercase text-xs tracking-widest">Rural Access Initiative</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-serif leading-tight">
            Somewhere in a<br />
            government school there<br />
            is a student who would be<br />
            excellent at this, and who<br />
            will never hear about it.
          </h1>

          <h3 className="text-xl md:text-2xl text-amber-400 font-medium">
            We built Skill Grimoire so that changes.
          </h3>

          <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-xl">
            A share of everything our partner institutions pay us teaches students in rural and aided schools, completely free. Nothing removed, nothing watered down. We're not asking anyone to donate. We built a business that pays for it.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {[
              { icon: Users, text: "Completely free for rural & aided schools" },
              { icon: Handshake, text: "Funded by partner institutions" },
              { icon: ShieldCheck, text: "Nothing removed, nothing watered down" },
              { icon: Leaf, text: "Built as a self-sustaining model" },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-start gap-1.5 border border-white/20 rounded-lg p-2.5 bg-white/5">
                <feature.icon className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-white text-[10px] md:text-[11px] font-medium leading-tight">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-200 to-amber-400 text-slate-900 font-semibold rounded-xl flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              Partner with us
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 text-gray-300 text-sm border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Transparency first. Impact you can see.</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Floating Connections Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="hidden lg:flex flex-col justify-center items-center relative h-full"
        >
          {/* We use SVGs to draw connecting lines, simplified here with absolute positioning */}
          <div className="relative w-[500px] h-[600px] flex flex-col justify-between items-center">
             
             {/* Top Icons */}
             <div className="flex justify-between w-full mt-24 px-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Landmark className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium text-center">Partner<br/>Institutions</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium text-center">Knowledge<br/>& Resources</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium text-center">Opportunities<br/>Unlocked</span>
                </div>
             </div>

             {/* Connection Lines via SVG */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
               <path d="M 64 160 Q 250 280 250 424" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
               <path d="M 250 160 Q 250 280 250 424" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
               <path d="M 436 160 Q 250 280 250 424" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
               {/* Glowing dots */}
               <circle cx="64" cy="160" r="4" fill="#fbbf24" />
               <circle cx="250" cy="160" r="4" fill="#fbbf24" />
               <circle cx="436" cy="160" r="4" fill="#fbbf24" />
             </svg>

             {/* Bottom Icon */}
             <div className="flex flex-col items-center gap-3 mb-24 z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center relative z-10">
                    <GraduationCap className="w-10 h-10 text-slate-900" />
                  </div>
                </div>
                <span className="text-white font-semibold text-center mt-2 drop-shadow-md">Students in<br/>Underserved Schools</span>
             </div>

          </div>
        </motion.div>
      </div>

      <RuralAccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default RuralAccessSection;
