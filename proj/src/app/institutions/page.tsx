"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { WeatherProvider } from "@/context/WeatherContext";
import WeatherBackground from "@/components/weather/WeatherBackground";
import { AuthProvider } from "@/context/AuthContext";
import { 
  GraduationCap, 
  Landmark, 
  ArrowRight, 
  CheckCircle2,
  Megaphone,
  ClipboardList,
  Users,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  HeadphonesIcon,
  Target
} from "lucide-react";

// FAQ Component
function FAQItem({ question, children }: { question: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[#1E2D45] rounded-2xl bg-[#0B1220]/50 overflow-hidden transition-all duration-300 hover:border-[#E5B869]/30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-white"
      >
        <span className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#E5B869]" />
          {question}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-[#E5B869]" />}
      </button>
      <div hidden={!isOpen} className="px-6 pb-5 pt-1 text-sm text-gray-400 leading-relaxed pl-14">
        {children}
      </div>
    </div>
  );
}

export default function InstitutionsPage() {
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#partner") {
      setTimeout(() => {
        document.getElementById("partner")?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    }
  }, []);

  return (
    <AuthProvider>
      <WeatherProvider>
        <WeatherBackground>
          <div className="min-h-screen flex flex-col font-sans relative">
            <Navbar />
            
            <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-24 space-y-24 md:space-y-32">
              
              {/* ── HERO SECTION ── */}
              <section className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <h4 className="text-[#E5B869] font-bold tracking-[0.2em] uppercase text-sm">For Institutions</h4>
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                    The partnership page for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D075] to-[#E5B869]">schools and colleges.</span>
                  </h1>
                  <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
                    Two buyers, two variables. Schools need guidance after 10th; colleges need placement readiness. Choose your path below.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                     {/* School Button */}
                     <button 
                       onClick={() => document.getElementById('partner')?.scrollIntoView({ behavior: 'smooth' })}
                       className="flex-1 group relative bg-[#10192A]/80 border border-[#1E2D45] hover:border-[#E5B869]/60 rounded-2xl p-5 text-left transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-md"
                     >
                       <div className="absolute inset-0 bg-gradient-to-br from-[#E5B869]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 rounded-xl bg-[#0A101C] border border-[#1E2D45] flex items-center justify-center">
                           <GraduationCap className="w-6 h-6 text-[#E5B869]" />
                         </div>
                         <div>
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">For</p>
                           <h3 className="text-xl font-bold text-white font-serif">Schools</h3>
                         </div>
                       </div>
                       <div className="flex items-center justify-between text-sm text-[#E5B869] font-medium border-t border-[#1E2D45] pt-4 group-hover:border-[#E5B869]/30 transition-colors">
                         <span>Partner as a School</span>
                         <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                       </div>
                     </button>
                     
                     {/* College Button */}
                     <button 
                       onClick={() => document.getElementById('partner')?.scrollIntoView({ behavior: 'smooth' })}
                       className="flex-1 group relative bg-[#10192A]/80 border border-[#1E2D45] hover:border-[#E5B869]/60 rounded-2xl p-5 text-left transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-md"
                     >
                       <div className="absolute inset-0 bg-gradient-to-br from-[#E5B869]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 rounded-xl bg-[#0A101C] border border-[#1E2D45] flex items-center justify-center">
                           <Landmark className="w-6 h-6 text-[#E5B869]" />
                         </div>
                         <div>
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">For</p>
                           <h3 className="text-xl font-bold text-white font-serif">Colleges</h3>
                         </div>
                       </div>
                       <div className="flex items-center justify-between text-sm text-[#E5B869] font-medium border-t border-[#1E2D45] pt-4 group-hover:border-[#E5B869]/30 transition-colors">
                         <span>Partner as a College</span>
                         <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                       </div>
                     </button>
                  </div>
                </div>
                
                <div className="flex-1 hidden md:block">
                  <div className="w-full aspect-[4/3] rounded-[2rem] border border-[#E5B869]/20 shadow-[0_0_50px_rgba(229,184,105,0.15)] flex items-center justify-center overflow-hidden relative group">
                     <Image
                       src="/images/institutions_handshake.jpg"
                       alt="Partnership Handshake"
                       fill
                       className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                       priority
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </section>

              {/* ── SHARED PARTNERSHIP MODEL ── */}
              <section className="bg-[#10192A]/60 border border-[#1E2D45] rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                 <div className="text-center md:text-left mb-12">
                   <h4 className="text-[#E5B869] font-bold tracking-widest uppercase text-xs mb-2">Shared Partnership Model</h4>
                   <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">
                     What we handle <br className="hidden md:block" /> vs <span className="text-[#E5B869]">what you handle.</span>
                   </h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Block 1 */}
                    <div className="bg-[#0A101C] border border-[#1E2D45] rounded-2xl p-6 flex flex-col items-start hover:border-[#E5B869]/50 transition-colors">
                       <div className="w-12 h-12 bg-[#E5B869]/10 rounded-xl flex items-center justify-center mb-6 border border-[#E5B869]/30">
                          <GraduationCap className="w-6 h-6 text-[#E5B869]" />
                       </div>
                       <h3 className="text-lg font-bold text-white mb-3 font-serif">Skill Grimoire handles</h3>
                       <p className="text-sm text-gray-400 leading-relaxed">
                         Curriculum, educators, production, delivery structure, certificates, the Founder&apos;s Grant and programme support.
                       </p>
                    </div>
                    {/* Block 2 */}
                    <div className="bg-[#0A101C] border border-[#1E2D45] rounded-2xl p-6 flex flex-col items-start hover:border-[#E5B869]/50 transition-colors">
                       <div className="w-12 h-12 bg-[#E5B869]/10 rounded-xl flex items-center justify-center mb-6 border border-[#E5B869]/30">
                          <Landmark className="w-6 h-6 text-[#E5B869]" />
                       </div>
                       <h3 className="text-lg font-bold text-white mb-3 font-serif">Your institution handles</h3>
                       <p className="text-sm text-gray-400 leading-relaxed">
                         Student access and one point of contact. Nothing else is required to begin the conversation.
                       </p>
                    </div>
                    {/* Block 3 */}
                    <div className="bg-[#0A101C] border border-[#1E2D45] rounded-2xl p-6 flex flex-col items-start hover:border-[#E5B869]/50 transition-colors bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#E5B869]/5 to-transparent">
                       <div className="w-12 h-12 bg-[#E5B869] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#E5B869]/20">
                          <CheckCircle2 className="w-6 h-6 text-[#0A101C]" />
                       </div>
                       <h3 className="text-lg font-bold text-white mb-3 font-serif">Together we build</h3>
                       <p className="text-sm text-gray-400 leading-relaxed">
                         Stronger futures for students and institutions through collaboration, trust and shared success.
                       </p>
                    </div>
                 </div>
              </section>

              {/* ── PROCESS TIMELINE ── */}
              <section>
                <div className="text-center mb-16">
                   <h4 className="text-[#E5B869] font-bold tracking-widest uppercase text-xs mb-2">Process</h4>
                   <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">How the partnership works.</h2>
                   <p className="text-gray-400 mt-4 max-w-xl mx-auto">Simple steps. Clear outcomes. Stronger futures.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 relative">
                   {/* Decorative connecting line (desktop) */}
                   <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#E5B869]/50 to-transparent" />
                   
                   {[
                     { num: "01", icon: <Megaphone/>, title: "Introductory call", desc: "We understand your institution type, student count and outcome goals." },
                     { num: "02", icon: <ClipboardList/>, title: "Programme fit", desc: "We select the right school or college path and confirm commercial terms." },
                     { num: "03", icon: <Users/>, title: "Student onboarding", desc: "Students are enrolled through your institution, not through a public checkout." },
                     { num: "04", icon: <Award/>, title: "Delivery & recognition", desc: "Students learn, are assessed, and top performers are recognised." },
                   ].map((step, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center text-center relative z-10 group">
                        <div className="w-24 h-24 rounded-full bg-[#10192A] border-2 border-[#E5B869]/30 flex items-center justify-center mb-6 group-hover:border-[#E5B869] group-hover:shadow-[0_0_20px_rgba(229,184,105,0.4)] transition-all">
                           <div className="text-[#E5B869] flex items-center justify-center [&>svg]:w-10 [&>svg]:h-10">
                             {step.icon}
                           </div>
                        </div>
                        <div className="absolute top-0 right-1/2 translate-x-4 -translate-y-4 text-xs font-serif font-bold text-[#E5B869] bg-[#0B1220] px-2">{step.num}</div>
                        <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-sm text-gray-400 px-4">{step.desc}</p>
                     </div>
                   ))}
                </div>
              </section>

              {/* ── FAQ & ENQUIRY GRID ── */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
                 
                 {/* FAQ Column */}
                 <div className="space-y-6">
                    <div>
                      <h4 className="text-[#E5B869] font-bold tracking-widest uppercase text-xs mb-2">FAQ</h4>
                      <h2 className="text-3xl font-serif font-bold text-white mb-8">Questions institutions ask <span className="text-[#E5B869]">first.</span></h2>
                    </div>
                    <div className="space-y-3">
                       <FAQItem question="Does it clash with our syllabus?">
                         No. Our programmes run as parallel workshops or after-school digital sessions, perfectly complementing existing academics without interference.
                       </FAQItem>
                       <FAQItem question="What does the institution need to provide?">
                         Simply student enrollment data and a primary point of contact. We handle all technical infrastructure and content delivery.
                       </FAQItem>
                       <FAQItem question="How are students assessed?">
                         Through project-based evaluations, practical quizzes, and AI-driven skill tests integrated seamlessly into the learning platform.
                       </FAQItem>
                       <FAQItem question="Who teaches it?">
                         Industry experts and AI-facilitated interactive modules crafted by top-tier curriculum designers.
                       </FAQItem>
                    </div>
                 </div>

                 {/* Enquiry Form Column */}
                 <div id="partner" className="bg-[#10192A]/80 border border-[#1E2D45] rounded-[2rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-[0.05] blur-3xl rounded-full" />
                    
                    <h4 className="text-[#E5B869] font-bold tracking-widest uppercase text-xs mb-2 relative z-10">Partnership Enquiry</h4>
                    <h2 className="text-3xl font-serif font-bold text-white mb-4 relative z-10">Start the conversation.</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-sm relative z-10">
                      We'll use these details only to respond to your enquiry. No student registration or payment is collected here.
                    </p>
                    
                    <div className="flex gap-4 mb-8">
                       <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#E5B869]" /><span className="text-[10px] text-gray-300 font-bold uppercase">100% Secure</span></div>
                       <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#E5B869]" /><span className="text-[10px] text-gray-300 font-bold uppercase">Quick Response</span></div>
                       <div className="flex items-center gap-2"><Target className="w-4 h-4 text-[#E5B869]" /><span className="text-[10px] text-gray-300 font-bold uppercase">Better Outcomes</span></div>
                    </div>
                    
                    <PartnershipForm />
                 </div>
              </section>

            </main>
          </div>
        </WeatherBackground>
      </WeatherProvider>
    </AuthProvider>
  );
}

function PartnershipForm() {
  const [formData, setFormData] = useState({
    institutionName: "",
    institutionType: "10th",
    contactPerson: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/partner-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
      setFormData({
        institutionName: "",
        institutionType: "10th",
        contactPerson: "",
        email: "",
        message: ""
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Institution Name</label>
            <input 
              required
              type="text" 
              value={formData.institutionName}
              onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
              placeholder="Enter institution name" 
              className="w-full bg-[#0A101C] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/60 transition-colors" 
            />
        </div>
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Institution Type</label>
            <select 
              value={formData.institutionType}
              onChange={(e) => setFormData({...formData, institutionType: e.target.value})}
              className="w-full bg-[#0A101C] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/60 transition-colors appearance-none"
            >
              <option value="10th">10th</option>
              <option value="PU">PU</option>
              <option value="Degree College">Degree College</option>
            </select>
        </div>
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Your Name</label>
            <input 
              required
              type="text" 
              value={formData.contactPerson}
              onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              placeholder="Enter your name" 
              className="w-full bg-[#0A101C] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/60 transition-colors" 
            />
        </div>
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Work Email</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@institution.edu" 
              className="w-full bg-[#0A101C] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/60 transition-colors" 
            />
        </div>
      </div>
      
      <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">What would you like to discuss?</label>
          <textarea 
            rows={3} 
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Type your message" 
            className="w-full bg-[#0A101C] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/60 transition-colors resize-none" 
          />
      </div>
      
      <button 
        type="submit" 
        disabled={status === "loading"}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {status === "loading" ? "Sending..." : "Send enquiry"} <ArrowRight className="w-4 h-4" />
      </button>
      
      {status === "success" && (
        <p className="text-sm text-green-400 mt-2 text-center">Enquiry sent successfully. We'll be in touch!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400 mt-2 text-center">Failed to send enquiry. Please try again.</p>
      )}
    </form>
  );
}
