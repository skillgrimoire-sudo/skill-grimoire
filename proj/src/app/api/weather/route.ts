import { NextRequest, NextResponse } from "next/server";

export type WeatherConditionType =
  | "thunderstorm"
  | "rainy"
  | "cloudy"
  | "sunny"
  | "sunset"
  | "night"
  | "hazy";

export interface WeatherDataResponse {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: WeatherConditionType;
  conditionLabel: string;
  wmoCode: number;
  isDay: boolean;
  timeOfDay: "morning" | "afternoon" | "sunset" | "evening" | "night";
  humidity: number;
  windSpeed: number;
  localTime: string;
  formattedDate: string;
  source: "live" | "fallback" | "simulated";
}

// Map WMO Weather Codes to our dynamic themes
function mapWmoToCondition(code: number, isDay: boolean, hour: number, precipitation: number = 0): {
  condition: WeatherConditionType;
  conditionLabel: string;
  timeOfDay: "morning" | "afternoon" | "sunset" | "evening" | "night";
} {
  let timeOfDay: "morning" | "afternoon" | "sunset" | "evening" | "night" = "morning";
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else if (hour >= 17 && hour < 19) timeOfDay = "sunset";
  else if (hour >= 19 && hour < 22) timeOfDay = "evening";
  else timeOfDay = "night";

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return {
      condition: "thunderstorm",
      conditionLabel: "Thunderstorm & Tempest",
      timeOfDay,
    };
  }

  // Active / heavy rain only when precipitation is significant (>= 1.5mm) or heavy rain codes (63, 65, 82)
  if ([63, 65, 82].includes(code) || ([51, 53, 55, 56, 57, 61, 66, 67, 80, 81].includes(code) && precipitation >= 1.5)) {
    return {
      condition: "rainy",
      conditionLabel: "Rain Showers",
      timeOfDay,
    };
  }

  // Fog / Haze
  if ([45, 48].includes(code)) {
    return {
      condition: "hazy",
      conditionLabel: "Hazy & Misty",
      timeOfDay,
    };
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      condition: "cloudy",
      conditionLabel: "Misty Overcast",
      timeOfDay,
    };
  }

  // Dense overcast
  if (code === 3) {
    if (timeOfDay === "sunset") return { condition: "sunset", conditionLabel: "Cloudy Sunset", timeOfDay };
    if (!isDay || timeOfDay === "night" || timeOfDay === "evening") return { condition: "night", conditionLabel: "Overcast Night", timeOfDay };
    return {
      condition: "cloudy",
      conditionLabel: "Overcast Sky",
      timeOfDay,
    };
  }

  // Partly Cloudy, Light Drizzle / Passing clouds, or Clear skies
  // During daytime, strictly follow natural sunlight and time of day
  if (timeOfDay === "sunset") {
    return {
      condition: "sunset",
      conditionLabel: "Golden Sunset",
      timeOfDay,
    };
  }

  if (!isDay || timeOfDay === "night" || timeOfDay === "evening") {
    return {
      condition: "night",
      conditionLabel: [2, 51, 53].includes(code) ? "Partly Cloudy Night" : "Starry Night",
      timeOfDay,
    };
  }

  // Daytime: morning or afternoon
  if (code === 2 || [51, 53, 55, 61].includes(code)) {
    return {
      condition: "sunny",
      conditionLabel: "Partly Sunny",
      timeOfDay,
    };
  }

  return {
    condition: "sunny",
    conditionLabel: "Clear & Sunny",
    timeOfDay,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const cityParam = searchParams.get("city");

  let lat = latParam ? parseFloat(latParam) : null;
  let lon = lonParam ? parseFloat(lonParam) : null;
  let cityName = cityParam || "";
  let countryName = "India";

  // 1. If city/PIN code query is explicitly provided, geocode it to coordinates
  if (cityParam && cityParam.trim() !== "") {
    try {
      const searchRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityParam.trim())}&countrycodes=in&format=json&limit=1`,
        {
          headers: { "User-Agent": "SkillGrimoireWeather/1.0" },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData && searchData.length > 0) {
          lat = parseFloat(searchData[0].lat);
          lon = parseFloat(searchData[0].lon);
          const parts = searchData[0].display_name.split(",");
          let clean = parts[0]?.trim() || cityParam.trim();
          clean = clean
            .replace(/Yallappa Nayakana Hosakote/i, "Y N Hosakote")
            .replace(/Y\.?\s*N\.?\s*Hosakote/i, "Y N Hosakote");
          cityName = clean;
          countryName = "India";
        }
      }
    } catch (e) {
      console.warn("City geocode search failed:", e);
    }
  }

  // 2. If coordinates are provided (from browser GPS), reverse-geocode them to get the actual city/village
  if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
    if (!cityName) {
      // Try OpenStreetMap Nominatim for exact village / town / locality level resolution
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          {
            headers: { "User-Agent": "SkillGrimoireWeather/1.0" },
            signal: AbortSignal.timeout(3500),
          }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          const nCity =
            nomData.address?.village ||
            nomData.address?.suburb ||
            nomData.address?.town ||
            nomData.address?.city ||
            nomData.address?.county ||
            nomData.address?.state_district;
          if (nCity) cityName = nCity;
          if (nomData.address?.country) countryName = nomData.address.country;
        }
      } catch {}

      // Fallback to BigDataCloud reverse geocode
      if (!cityName) {
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
            { signal: AbortSignal.timeout(3500) }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const detectedCity =
              geoData.locality ||
              geoData.city ||
              geoData.principalSubdivision ||
              geoData.localityInfo?.administrative?.[2]?.name;
            if (detectedCity) cityName = detectedCity;
            if (geoData.countryName) countryName = geoData.countryName;
          }
        } catch {}
      }

      // Normalize common extended names for cleaner UI display
      if (cityName) {
        cityName = cityName
          .replace(/Yallappa Nayakana Hosakote/i, "Y N Hosakote")
          .replace(/Y\.?\s*N\.?\s*Hosakote/i, "Y N Hosakote");
      }
    }
  } else {
    // If coordinates are not provided, detect user's current location via IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfIp = request.headers.get("cf-connecting-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || realIp || cfIp || "";
    const isLocalOrPrivate = !clientIp || clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("192.168.") || clientIp.startsWith("10.") || clientIp.startsWith("172.");

    try {
      const ipUrl = isLocalOrPrivate ? "http://ip-api.com/json/" : `http://ip-api.com/json/${clientIp}`;
      const ipRes = await fetch(ipUrl, { signal: AbortSignal.timeout(3500) });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.status === "success") {
          lat = ipData.lat;
          lon = ipData.lon;
          if (!cityName) cityName = ipData.city || ipData.regionName || "Your Location";
          if (ipData.country) countryName = ipData.country;
        }
      }
    } catch {}
  }

  // Fallback if everything fails
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
    lat = 12.9716;
    lon = 77.5946;
  }
  if (!cityName) {
    cityName = "Your Location";
  }

  try {
    // 1. Fetch live Open-Meteo data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto&timeformat=unixtime`;
    
    const weatherRes = await fetch(weatherUrl, { next: { revalidate: 300 } });
    
    if (!weatherRes.ok) {
      throw new Error(`OpenMeteo HTTP error: ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    const isDay = current.is_day === 1;
    const wmoCode = current.weather_code ?? 0;
    const temp = Math.round(current.temperature_2m ?? 24);
    const feelsLike = Math.round(current.apparent_temperature ?? temp);
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const windSpeed = Math.round(current.wind_speed_10m ?? 12);
    const precipitation = typeof current.precipitation === "number" ? current.precipitation : 0;

    // Parse local time from response using UTC offset to get correct local hour
    // Open-Meteo returns current.time as a unix timestamp when timeformat=unixtime
    const utcOffsetSeconds: number = weatherData.utc_offset_seconds ?? 0;
    const currentUnixTime: number = typeof current.time === "number" ? current.time : Math.floor(Date.now() / 1000);
    const localTimestamp = currentUnixTime + utcOffsetSeconds;
    const localHour = Math.floor((localTimestamp % 86400) / 3600);

    const mapped = mapWmoToCondition(wmoCode, isDay, localHour, precipitation);

    // Format display date and time
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: weatherData.timezone || "Asia/Kolkata",
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: weatherData.timezone || "Asia/Kolkata",
    });

    const now = new Date();
    const localTimeString = timeFormatter.format(now);
    const formattedDateString = dateFormatter.format(now);

    const response: WeatherDataResponse = {
      city: cityName,
      country: countryName,
      temp,
      feelsLike,
      condition: mapped.condition,
      conditionLabel: mapped.conditionLabel,
      wmoCode,
      isDay,
      timeOfDay: mapped.timeOfDay,
      humidity,
      windSpeed,
      localTime: localTimeString,
      formattedDate: formattedDateString,
      source: "live",
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("Weather fetch fallback trigger:", err);
    // Graceful fallback with atmospheric state strictly driven by actual local time of day
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    let timeOfDay: "morning" | "afternoon" | "sunset" | "evening" | "night" = "afternoon";
    if (currentHour >= 5 && currentHour < 12) timeOfDay = "morning";
    else if (currentHour >= 12 && currentHour < 17) timeOfDay = "afternoon";
    else if (currentHour >= 17 && currentHour < 19) timeOfDay = "sunset";
    else if (currentHour >= 19 && currentHour < 22) timeOfDay = "evening";
    else timeOfDay = "night";

    const isDay = currentHour >= 6 && currentHour < 18;
    let condition: WeatherConditionType = "sunny";
    let conditionLabel = "Partly Sunny";

    if (timeOfDay === "sunset") {
      condition = "sunset";
      conditionLabel = "Golden Sunset";
    } else if (!isDay || timeOfDay === "night" || timeOfDay === "evening") {
      condition = "night";
      conditionLabel = "Starry Night";
    } else {
      condition = "sunny";
      conditionLabel = "Partly Sunny";
    }

    const fallbackResponse: WeatherDataResponse = {
      city: cityName || "Your Location",
      country: countryName || "India",
      temp: 28,
      feelsLike: 29,
      condition,
      conditionLabel,
      wmoCode: 2,
      isDay,
      timeOfDay,
      humidity: 50,
      windSpeed: 10,
      localTime: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      formattedDate: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      source: "fallback",
    };
    return NextResponse.json(fallbackResponse, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}
