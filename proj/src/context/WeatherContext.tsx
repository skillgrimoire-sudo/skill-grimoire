"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { WeatherConditionType, WeatherDataResponse } from "@/app/api/weather/route";

interface WeatherContextType {
  weather: WeatherDataResponse;
  isLive: boolean;
  isLoading: boolean;
  /** 0-24 float representing current hour (6.0 = 6:00 AM, 18.5 = 6:30 PM) */
  currentHour: number;
  /** 0-1 representing sun position on arc (0 = east/6AM, 0.5 = zenith/noon, 1.0 = west/6PM). null if night. */
  sunProgress: number | null;
  /** 0-1 representing moon position on arc (0 = east/6PM, 0.5 = zenith/midnight, 1.0 = west/6AM). null if day. */
  moonProgress: number | null;
  setManualCondition: (condition: WeatherConditionType) => void;
  setManualHour: (hour: number) => void;
  resetToLive: () => void;
  refreshWeather: () => Promise<void>;
  searchLocation: (query: string) => Promise<boolean>;
  requestGpsLocation: () => void;
}

const defaultWeather: WeatherDataResponse = {
  city: "Detecting...",
  country: "India",
  temp: 24,
  feelsLike: 24,
  condition: "cloudy",
  conditionLabel: "Detecting Location...",
  wmoCode: 1,
  isDay: true,
  timeOfDay: "afternoon",
  humidity: 60,
  windSpeed: 10,
  localTime: "12:00 PM",
  formattedDate: "",
  source: "fallback",
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

/** Get the current fractional hour from browser local time */
function getCurrentHourFromBrowser(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

/** Map a fractional hour (0-24) → time of day string */
function hourToTimeOfDay(hour: number): "morning" | "afternoon" | "sunset" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 19) return "sunset";
  if (hour >= 19 && hour < 22) return "evening";
  return "night";
}

/** Compute sun arc progress: 0 (east at 6AM) → 0.5 (zenith at noon) → 1 (west at 6PM). null if sun is below horizon. */
function computeSunProgress(hour: number): number | null {
  // Sun visible from 5:30 AM to 18:30 PM (6:30 PM)
  const sunriseHour = 5.5;
  const sunsetHour = 18.5;
  if (hour < sunriseHour || hour > sunsetHour) return null;
  return (hour - sunriseHour) / (sunsetHour - sunriseHour);
}

/** Compute moon arc progress: 0 (east at 6PM) → 0.5 (zenith at midnight) → 1 (west at 6AM). null if moon is below horizon. */
function computeMoonProgress(hour: number): number | null {
  const moonriseHour = 18.5;
  const moonsetHour = 5.5;
  // Moon is visible from 18:30 to 5:30 (next day)
  if (hour >= moonriseHour) {
    // 18.5 → 24: map to 0 → ~0.5
    return (hour - moonriseHour) / (24 - moonriseHour + moonsetHour);
  }
  if (hour <= moonsetHour) {
    // 0 → 5.5: map to ~0.5 → 1
    return (24 - moonriseHour + hour) / (24 - moonriseHour + moonsetHour);
  }
  return null;
}

/** Determine condition label for manual hour/condition combinations */
function getConditionLabel(condition: WeatherConditionType): string {
  switch (condition) {
    case "thunderstorm": return "Thunderstorm & Tempest";
    case "sunny": return "Radiant & Clear Sky";
    case "rainy": return "Gentle Rain Showers";
    case "cloudy": return "Ethereal Overcast";
    case "sunset": return "Golden Sunset Glow";
    case "night": return "Starry Cosmic Night";
    case "hazy": return "Hazy & Dusty Veil";
    default: return "Clear Sky";
  }
}

/** Derive condition from hour when not weather-locked */
function deriveConditionFromHour(hour: number, currentCondition: WeatherConditionType): WeatherConditionType {
  const weatherLocked = currentCondition === "thunderstorm" || currentCondition === "rainy" || currentCondition === "hazy";
  if (weatherLocked) return currentCondition;

  const timeOfDay = hourToTimeOfDay(hour);
  if (timeOfDay === "sunset") return "sunset";
  if (timeOfDay === "night" || timeOfDay === "evening") return "night";
  if (timeOfDay === "morning") return "cloudy";
  return "sunny";
}

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherDataResponse>(defaultWeather);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  /** When null → use browser time (live). When set → manual slider hour (0-24) */
  const [manualHour, setManualHourState] = useState<number | null>(null);
  /** Live browser hour, updated every 30s */
  const [liveHour, setLiveHour] = useState<number>(getCurrentHourFromBrowser());

  // Keep live hour strictly synchronized with the user's local browser clock
  useEffect(() => {
    const handleSync = () => {
      setLiveHour(getCurrentHourFromBrowser());
    };

    // 1. Asynchronously sync on mount to capture browser time without cascading effect warning
    const initTimer = setTimeout(handleSync, 0);

    // 2. High-frequency tick (every 10s) to keep minute transitions accurate
    const interval = setInterval(handleSync, 10000);

    // 3. Immediately resync whenever user returns to the tab or wakes up laptop
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleSync);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const currentHour = manualHour !== null ? manualHour : liveHour;

  const sunProgress = useMemo(() => computeSunProgress(currentHour), [currentHour]);
  const moonProgress = useMemo(() => computeMoonProgress(currentHour), [currentHour]);

  const fetchWeatherData = useCallback(async (lat?: number, lon?: number) => {
    setIsLoading(true);
    try {
      let url = "/api/weather";
      if (lat !== undefined && lon !== undefined) {
        url += `?lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: WeatherDataResponse = await res.json();
        setWeather(data);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("sg_weather_cache", JSON.stringify(data));
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchLocation = useCallback(async (query: string): Promise<boolean> => {
    if (!query || !query.trim()) return false;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data: WeatherDataResponse = await res.json();
        if (data && data.city) {
          setWeather(data);
          setIsLive(true);
          setManualHourState(null);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("sg_custom_city", query.trim());
              localStorage.setItem("sg_weather_cache", JSON.stringify(data));
            } catch (_) {}
          }
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Location search error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestGpsLocation = useCallback(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoords = { lat: latitude, lon: longitude };
          setCoords(newCoords);
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("sg_custom_city");
              localStorage.setItem("sg_coords", JSON.stringify(newCoords));
            } catch (_) {}
          }
          fetchWeatherData(latitude, longitude);
        },
        (err) => {
          console.warn("GPS Geolocation error:", err.message);
          setIsLoading(false);
        },
        { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
      );
    }
  }, [fetchWeatherData]);

  // On mount: Fetch live weather prioritizing custom city or GPS
  useEffect(() => {
    let customCity: string | null = null;
    let cachedCoords: { lat: number; lon: number } | null = null;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("sg_weather_cache");
        if (cached) setWeather(JSON.parse(cached));
        customCity = localStorage.getItem("sg_custom_city");
        const c = localStorage.getItem("sg_coords");
        if (c) cachedCoords = JSON.parse(c);
      } catch (_) {}
    }

    if (customCity) {
      searchLocation(customCity);
      return;
    }

    if (cachedCoords) {
      setCoords(cachedCoords);
      fetchWeatherData(cachedCoords.lat, cachedCoords.lon);
    } else {
      fetchWeatherData();
    }

    // Attempt high-accuracy GPS
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoords = { lat: latitude, lon: longitude };
          setCoords(newCoords);
          try {
            localStorage.setItem("sg_coords", JSON.stringify(newCoords));
          } catch (_) {}
          fetchWeatherData(latitude, longitude);
        },
        (err) => {
          console.warn("GPS geolocation prompt dismissed or denied:", err.message);
        },
        { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
      );
    }
  }, [fetchWeatherData, searchLocation]);

  // Manual condition switcher
  const setManualCondition = (condition: WeatherConditionType) => {
    setIsLive(false);
    const isDay = ["morning", "afternoon", "sunset"].includes(hourToTimeOfDay(currentHour));

    setWeather((prev) => ({
      ...prev,
      condition,
      conditionLabel: getConditionLabel(condition),
      isDay,
      timeOfDay: hourToTimeOfDay(currentHour),
      source: "simulated",
    }));
  };

  // Manual hour slider (0-24 continuous)
  const setManualHour = (hour: number) => {
    setIsLive(false);
    const clampedHour = Math.max(0, Math.min(24, hour));
    setManualHourState(clampedHour);

    const timeOfDay = hourToTimeOfDay(clampedHour);
    const isDay = ["morning", "afternoon", "sunset"].includes(timeOfDay);
    const newCondition = deriveConditionFromHour(clampedHour, weather.condition);

    // Format time display
    const displayHour = Math.floor(clampedHour) % 12 || 12;
    const displayMinute = Math.floor((clampedHour % 1) * 60).toString().padStart(2, "0");
    const amPm = clampedHour < 12 || clampedHour >= 24 ? "AM" : "PM";

    setWeather((prev) => ({
      ...prev,
      timeOfDay,
      isDay,
      condition: newCondition,
      conditionLabel: getConditionLabel(newCondition),
      localTime: `${displayHour}:${displayMinute} ${amPm}`,
      source: "simulated",
    }));
  };

  // Reset to live
  const resetToLive = () => {
    setIsLive(true);
    setManualHourState(null);
    setLiveHour(getCurrentHourFromBrowser());
    if (coords) {
      fetchWeatherData(coords.lat, coords.lon);
    } else {
      fetchWeatherData();
    }
  };

  return (
    <WeatherContext.Provider
      value={{
        weather,
        isLive,
        isLoading,
        currentHour,
        sunProgress,
        moonProgress,
        setManualCondition,
        setManualHour,
        resetToLive,
        refreshWeather: () => fetchWeatherData(coords?.lat, coords?.lon),
        searchLocation,
        requestGpsLocation,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
