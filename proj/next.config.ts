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
};

export default nextConfig;
