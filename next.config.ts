import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        /*
         * The Hub is internal. Every page already carries a noindex meta tag
         * from the root layout, but a meta tag only protects HTML — a PDF or
         * an image can be crawled and indexed on its own, without the page
         * that links to it ever being fetched.
         *
         * Applied site-wide rather than to a list of document paths: nothing
         * here is meant to be indexed, and a blanket rule cannot miss a route
         * someone adds later.
         *
         * This is not access control. Anyone with the URL can still read it.
         */
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
