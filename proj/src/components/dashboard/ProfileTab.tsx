"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Calendar, BookOpen, GraduationCap, Award, Clock } from "lucide-react";

function formatDob(dateVal?: string | Date | null): string {
  if (!dateVal) return "Not provided";

  let year: number;
  let month: number;
  let day: number;

  if (typeof dateVal === "string") {
    const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    } else {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Not provided";
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  } else if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return "Not provided";
    year = dateVal.getFullYear();
    month = dateVal.getMonth() + 1;
    day = dateVal.getDate();
  } else {
    return "Not provided";
  }

  const suffixes = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const suffix = (day > 10 && day < 20) ? "th" : suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[month - 1] || "";

  return `${day}${suffix} ${monthName}, ${year}`;
}

export default function ProfileTab() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.student) {
          setStudentData(data.student);
          setEnrollments(data.student.enrollments || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ── Section: Personal Information ── */}
      <div className="bg-[#10192A]/60 border border-[#E5B869]/20 rounded-2xl p-6 shadow-lg backdrop-blur-md">
        <h3 className="text-sm font-bold text-[#E5B869] uppercase tracking-wider mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5B869]/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#E5B869]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Full Name</p>
              <p className="text-sm font-semibold text-white">{user?.name || user?.username || "Student"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5B869]/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#E5B869]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email Address</p>
              <p className="text-sm font-semibold text-white">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5B869]/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#E5B869]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Date of Birth</p>
              <p className="text-sm font-semibold text-white">
                {formatDob(studentData?.dateOfBirth || user?.dateOfBirth)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5B869]/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-[#E5B869]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Current Class / Level</p>
              <p className="text-sm font-semibold text-white">
                {studentData?.studentClass || user?.studentClass || "Enrolled Student"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Enrolled Courses & Progress ── */}
      <div className="bg-[#10192A]/60 border border-[#E5B869]/20 rounded-2xl p-6 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-[#E5B869] uppercase tracking-wider">Courses & Progress</h3>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 120h logged
          </span>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-gray-400">Loading progress...</div>
          ) : enrollments.length === 0 ? (
            <div className="text-sm text-gray-400">Not enrolled in any courses yet.</div>
          ) : enrollments.map((enr, idx) => (
            <div key={idx} className="bg-[#152033] border border-[#1E2D45] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#090F1C] flex items-center justify-center border border-[#1E2D45] shrink-0">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-1 truncate">{enr.course.title}</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[#090F1C] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        enr.progressPercent === 100 ? "bg-emerald-400" : "bg-[#E5B869]"
                      }`}
                      style={{ width: `${enr.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 w-9">{enr.progressPercent}%</span>
                </div>
              </div>
              {enr.progressPercent === 100 && (
                <div className="hidden sm:block shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase">
                  Completed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
