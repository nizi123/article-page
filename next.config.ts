// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/musicconv/loading/:sid", destination: "/musicconv?v=loading&sid=:sid" },
      { source: "/musicconv/result/:sid",  destination: "/musicconv?v=result&sid=:sid"  },
      { source: "/musicconv/guestbook",     destination: "/musicconv?v=saved"          },
      { source: "/musicconv/guestbook/:id", destination: "/musicconv?v=saved&id=:id"   },
    ];
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'labchasm.com' }],
        destination: 'https://labchasm.framer.website/',
        permanent: true, // 308
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'www.labchasm.com' }],
        destination: 'https://labchasm.framer.website/',
        permanent: true, // 308
      },
    ];
  },
};

export default nextConfig;
