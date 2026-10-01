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
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const c = localStorage.getItem("sg_coords");
        if (c) return JSON.parse(c);
      } catch (_) {}
    }
    return null;
  });
  /** When null → use browser time (live). When set → manual slider hour (0-24) */
  const [manualHour, setManualHourState] = useState<number | null>(null);
  /** Live browser hour, updated every 30s */
  const [liveHour, setLiveHour] = useState<number>(getCurrentHourFromBrowser());

  const lastFetchIdRef = React.useRef(0);
  const hasGpsCoordsRef = React.useRef(false);

  // Initialize GPS flag if coords already present in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const c = localStorage.getItem("sg_coords");
        if (c) hasGpsCoordsRef.current = true;
      } catch (_) {}
    }
  }, []);

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
    const fetchId = ++lastFetchIdRef.current;
    const isGps = lat !== undefined && lon !== undefined;
    if (isGps) {
      hasGpsCoordsRef.current = true;
    } else if (hasGpsCoordsRef.current) {
      // Do not overwrite GPS coordinates with a fallback IP fetch
      return;
    }

    setIsLoading(true);
    try {
      let url = "/api/weather";
      if (lat !== undefined && lon !== undefined) {
        url += `?lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: WeatherDataResponse = await res.json();
        if (fetchId === lastFetchIdRef.current) {
          setWeather(data);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("sg_weather_cache", JSON.stringify(data));
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      if (fetchId === lastFetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const searchLocation = useCallback(async (query: string): Promise<boolean> => {
    if (!query || !query.trim()) return false;
    const fetchId = ++lastFetchIdRef.current;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data: WeatherDataResponse = await res.json();
        if (data && data.city && fetchId === lastFetchIdRef.current) {
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
      if (fetchId === lastFetchIdRef.current) {
        setIsLoading(false);
      }
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
          hasGpsCoordsRef.current = true;
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
        { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
      );
    }
  }, [fetchWeatherData]);

  // On mount: Fetch live weather prioritizing custom city or GPS
  useEffect(() => {
    let customCity: string | null = null;
    let cachedCoords: { lat: number; lon: number } | null = null;
    if (typeof window !== "undefined") {
      try {
        customCity = localStorage.getItem("sg_custom_city");
        const c = localStorage.getItem("sg_coords");
        if (c) cachedCoords = JSON.parse(c);
        const cached = localStorage.getItem("sg_weather_cache");
        if (cached) {
          const parsedCache = JSON.parse(cached);
          setWeather(parsedCache);
        }
      } catch (_) {}
    }

    if (customCity) {
      searchLocation(customCity);
      return;
    }

    if (cachedCoords) {
      setCoords(cachedCoords);
      hasGpsCoordsRef.current = true;
      fetchWeatherData(cachedCoords.lat, cachedCoords.lon);
    }

    // Attempt geolocation with fast cached fix first, avoiding race conditions with IP lookup
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const handlePosition = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lon: longitude };
        setCoords(newCoords);
        hasGpsCoordsRef.current = true;
        try {
          localStorage.removeItem("sg_custom_city");
          localStorage.setItem("sg_coords", JSON.stringify(newCoords));
        } catch (_) {}
        fetchWeatherData(latitude, longitude);
      };

      const handleFallback = () => {
        // Only fallback to IP lookup if we don't already have GPS coordinates
        if (!hasGpsCoordsRef.current) {
          fetchWeatherData();
        }
      };

      // 1. Fast attempt with maximumAge (instant if browser/OS already has fix from permission)
      navigator.geolocation.getCurrentPosition(
        handlePosition,
        () => {
          // 2. If fast lookup didn't have cached fix, try standard lookup
          navigator.geolocation.getCurrentPosition(
            handlePosition,
            handleFallback,
            { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
          );
        },
        { timeout: 4000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    } else if (!cachedCoords) {
      fetchWeatherData();
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

    let activeCoords = coords;
    if (!activeCoords && typeof window !== "undefined") {
      try {
        const c = localStorage.getItem("sg_coords");
        if (c) activeCoords = JSON.parse(c);
      } catch (_) {}
    }

    if (activeCoords) {
      hasGpsCoordsRef.current = true;
      setCoords(activeCoords);
      fetchWeatherData(activeCoords.lat, activeCoords.lon);
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
        refreshWeather: () => {
          let activeCoords = coords;
          if (!activeCoords && typeof window !== "undefined") {
            try {
              const c = localStorage.getItem("sg_coords");
              if (c) activeCoords = JSON.parse(c);
            } catch (_) {}
          }
          if (activeCoords) {
            return fetchWeatherData(activeCoords.lat, activeCoords.lon);
          }
          return fetchWeatherData();
        },
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
