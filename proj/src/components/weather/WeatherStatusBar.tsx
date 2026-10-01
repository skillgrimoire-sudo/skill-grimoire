"use client";

import React, { useState } from "react";
import { useWeather } from "@/context/WeatherContext";
import {
  CloudLightning,
  Sun,
  CloudRain,
  Cloud,
  Moon,
  RotateCcw,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  Minimize2,
  Maximize2,
} from "lucide-react";

// Fallback icon component for Sunset
function SunsetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10V2" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="m16 6-4 4-4-4" />
      <path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}

// Hazy icon
function HazeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14" />
      <path d="M3 12h18" />
      <path d="M5 16h14" />
      <path d="M7 20h10" />
    </svg>
  );
}

export default function WeatherStatusBar() {
  const {
    weather,
    isLive,
    isLoading,
    currentHour,
    setManualCondition,
    setManualHour,
    resetToLive,
  } = useWeather();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Map condition → icon
  const conditionIcon = () => {
    switch (weather.condition) {
      case "thunderstorm":
        return <CloudLightning className="w-4 h-4 text-amber-400 animate-pulse" />;
      case "sunny":
        return <Sun className="w-4 h-4 text-amber-300" />;
      case "rainy":
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case "cloudy":
        return <Cloud className="w-4 h-4 text-gray-300" />;
      case "sunset":
        return <SunsetIcon className="w-4 h-4 text-orange-400" />;
      case "night":
        return <Moon className="w-4 h-4 text-indigo-300" />;
      case "hazy":
        return <HazeIcon className="w-4 h-4 text-amber-500" />;
      default:
        return <Sun className="w-4 h-4 text-amber-300" />;
    }
  };

  // Slider: 0-24 continuous hours
  const sliderValue = currentHour;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hour = Number(e.target.value);
    setManualHour(hour);
  };

  // Format hour for display with exact time
  const formatHour = (h: number): string => {
    const totalMinutes = Math.round(h * 60);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    
    const hour12 = hours24 % 12 || 12;
    // 24 is midnight, treat as AM. hours24=0 is 12:00 AM
    const amPm = hours24 < 12 ? "AM" : "PM";
    const mm = mins.toString().padStart(2, "0");
    
    return `${hour12}:${mm} ${amPm}`;
  };

  const handleResetToLive = () => {
    setIsExpanded(false);
    resetToLive();
  };

  // Determine slider track gradient (day-night spectrum across 24 hours)
  const sliderTrackGradient = `linear-gradient(to right, 
    #1a1a3e 0%, 
    #1a1a3e 20%, 
    #2d3a6e 22%, 
    #F5D075 28%, 
    #87CEEB 35%, 
    #FFD700 50%, 
    #87CEEB 65%, 
    #F59E0B 72%, 
    #8B3A5E 78%, 
    #1a1a3e 82%, 
    #1a1a3e 100%
  )`;

  // Minimized floating pill view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] transition-all duration-300 ease-in-out">
        <div
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 sm:gap-3 bg-[#0c1322]/95 hover:bg-[#101a2e]/98 backdrop-blur-xl border border-[#E5B869]/40 hover:border-[#E5B869]/80 rounded-full px-3.5 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(229,184,105,0.2)] cursor-pointer transition-all duration-200 hover:scale-[1.03]"
          title="Click to maximize weather controller"
        >
          {/* Live / Sim Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {conditionIcon()}
            <span className="text-[10px] font-bold text-[#E5B869] uppercase tracking-wider">
              {isLive ? "LIVE" : "SIM"}
            </span>
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Location & Temp */}
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#E5B869] shrink-0" />
            <span className="text-white font-semibold truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]" suppressHydrationWarning>
              {weather.city}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-[#E5B869] font-bold" suppressHydrationWarning>
              {weather.temp}°C
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/15 hidden xs:block" />

          {/* Current time */}
          <div className="hidden xs:flex items-center text-[11px] text-gray-300 font-medium tabular-nums" suppressHydrationWarning>
            {formatHour(currentHour)}
          </div>

          {/* Maximize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="flex items-center gap-1 bg-[#152033] group-hover:bg-[#E5B869] text-gray-200 group-hover:text-black border border-[#E5B869]/30 group-hover:border-[#E5B869] rounded-full px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all duration-150 ml-1 shadow-sm"
            title="Maximize weather controller"
            aria-label="Maximize weather controller"
          >
            <Maximize2 className="w-3 h-3 text-[#E5B869] group-hover:text-black" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Expand</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] w-[95%] max-w-4xl transition-all duration-300 ease-in-out">
      {/* Expanded atmosphere selector — renders ABOVE the pill */}
      {isExpanded && (
        <div className="mb-2 bg-[#090e1c]/97 backdrop-blur-2xl border border-[#E5B869]/35 rounded-2xl p-3 shadow-2xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-gray-400 font-semibold w-full text-center mb-1">
              Select Atmosphere
            </span>

            {(
              [
                { key: "thunderstorm", label: "⚡ Thunderstorm", icon: <CloudLightning className="w-3.5 h-3.5" /> },
                { key: "sunny",        label: "☀ Clear / Sunny",  icon: <Sun className="w-3.5 h-3.5" /> },
                { key: "rainy",        label: "🌧 Rainy",          icon: <CloudRain className="w-3.5 h-3.5" /> },
                { key: "cloudy",       label: "⛅ Overcast",       icon: <Cloud className="w-3.5 h-3.5" /> },
                { key: "sunset",       label: "🌇 Golden Sunset",  icon: <SunsetIcon className="w-3.5 h-3.5" /> },
                { key: "night",        label: "🌌 Starry Night",   icon: <Moon className="w-3.5 h-3.5" /> },
                { key: "hazy",         label: "🌫 Hazy / Dusty",   icon: <HazeIcon className="w-3.5 h-3.5" /> },
              ] as const
            ).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setManualCondition(key);
                  setIsExpanded(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  weather.condition === key
                    ? "bg-[#E5B869] text-black border-[#E5B869] shadow-[0_0_12px_rgba(229,184,105,0.55)]"
                    : "bg-[#101827] text-gray-300 border-gray-700 hover:border-[#E5B869]/60 hover:text-white"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-white/5 flex items-center justify-center w-full text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E5B869]" />
                Location: <strong className="text-white" suppressHydrationWarning>{weather.city}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Status Pill ─────────────────────────────────────────────── */}
      <div className="bg-[#0c1322]/92 backdrop-blur-xl border border-[#E5B869]/30 rounded-2xl px-4 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(229,184,105,0.12)] flex flex-col gap-2">

        {/* Top row: status + info + buttons */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: status badge + location */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Live / Sim Badge */}
            <div className="flex items-center gap-1.5 bg-[#101827] border border-[#E5B869]/25 rounded-full px-2.5 py-1 shrink-0">
              {conditionIcon()}
              <span className="text-[10px] font-bold text-[#E5B869] uppercase tracking-wider">
                {isLive ? "LIVE" : "SIM"}
              </span>
              {isLive && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            {/* Location display - visible on mobile & desktop directly beside LIVE button */}
            <div className="flex items-center gap-1 text-gray-300 min-w-0 shrink">
              <MapPin className="w-3 h-3 text-[#E5B869] shrink-0" />
              <span className="text-white text-xs font-semibold truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]" suppressHydrationWarning>
                {weather.city}
              </span>
            </div>

            {/* Desktop / tablet additional info */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 shrink-0">
              <span className="text-gray-600">•</span>
              <span className="font-semibold text-white" suppressHydrationWarning>{weather.temp}°C</span>
              <span className="text-gray-600">•</span>
              <span className="capitalize text-gray-300 truncate max-w-[140px]" suppressHydrationWarning>{weather.conditionLabel}</span>
            </div>
          </div>

          {/* Right: buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="flex items-center gap-1.5 bg-[#101827] hover:bg-[#192840] text-gray-200 hover:text-white border border-[#E5B869]/30 hover:border-[#E5B869]/60 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all duration-150"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5B869]" />
              <span className="hidden sm:inline">Atmosphere</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {!isLive && (
              <button
                onClick={handleResetToLive}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#E5B869] to-[#C69234] hover:brightness-110 text-black font-bold rounded-full px-2.5 sm:px-3 py-1.5 text-xs transition-all duration-150 shadow-md disabled:opacity-60"
              >
                <RotateCcw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Back to Live</span>
                <span className="xs:hidden">Live</span>
              </button>
            )}

            {/* Minimize button */}
            <button
              onClick={() => {
                setIsMinimized(true);
                setIsExpanded(false);
              }}
              className="flex items-center gap-1 bg-[#101827] hover:bg-[#192840] text-gray-300 hover:text-[#E5B869] border border-[#E5B869]/30 hover:border-[#E5B869]/60 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-150"
              title="Minimize weather bar"
              aria-label="Minimize weather bar"
            >
              <Minimize2 className="w-3.5 h-3.5 text-[#E5B869]" />
              <span className="hidden sm:inline text-[11px]">Minimize</span>
            </button>
          </div>
        </div>

        {/* Bottom row: 24-hour continuous time slider */}
        <div className="flex items-center gap-2.5 w-full">
          <Sun className="w-3.5 h-3.5 text-[#E5B869] shrink-0" />

          <div className="flex-1 flex flex-col gap-0.5">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="24"
                step="0.25"
                value={sliderValue}
                onChange={handleSliderChange}
                className="weather-time-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: sliderTrackGradient,
                }}
                title={`Time: ${formatHour(sliderValue)}`}
              />
            </div>
            {/* Hour markers */}
            <div className="flex justify-between px-0.5">
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
                <span
                  key={h}
                  className={`text-[7px] font-medium leading-none transition-colors duration-300 ${
                    Math.abs(currentHour - h) < 1.5 ? "text-[#E5B869]" : "text-gray-600"
                  }`}
                >
                  {h === 0 || h === 24 ? "12a" : h === 6 ? "6a" : h === 12 ? "12p" : h === 18 ? "6p" : h === 3 ? "3a" : h === 9 ? "9a" : h === 15 ? "3p" : "9p"}
                </span>
              ))}
            </div>
          </div>

          <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />

          {/* Current time display */}
          <div className="hidden sm:flex items-center gap-1 bg-[#101827] border border-[#E5B869]/20 rounded-full px-2 py-0.5 shrink-0">
            <span className="text-[10px] font-bold text-white tabular-nums" suppressHydrationWarning>
              {formatHour(currentHour)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
