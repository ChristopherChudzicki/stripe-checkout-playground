import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // A test-mode playground: keep every response, API routes included, out of search engines.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
  },
}

export default nextConfig
