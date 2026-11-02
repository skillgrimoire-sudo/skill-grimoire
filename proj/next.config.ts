import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Keep private areas (admin, course player, account pages, API) out of search results.
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/admin", headers: noIndex },
      { source: "/admin/:path*", headers: noIndex },
      { source: "/api/:path*", headers: noIndex },
      { source: "/learn/:path*", headers: noIndex },
      { source: "/accept-terms", headers: noIndex },
      { source: "/change-password", headers: noIndex },
    ];
  },
  async redirects() {
    return [
      { source: "/founders-grant", destination: "/register", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // Founder's Grant Challenge 2027 registration page (static file in public/register/)
      { source: "/register", destination: "/register/index.html" },
    ];
  },
};

export default nextConfig;
