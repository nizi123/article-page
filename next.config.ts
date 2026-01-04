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


  async redirects() {
    return [
      // labchasm.com/  (루트만) -> framer로
      {
        source: "/",
        has: [{ type: "host", value: "labchasm.com" }] as const,
        destination: "https://labchasm.framer.website/",
        permanent: true,
      },
      // www.labchasm.com/ (루트만) -> framer로
      {
        source: "/",
        has: [{ type: "host", value: "www.labchasm.com" }] as const,
        destination: "https://labchasm.framer.website/",
        permanent: true,
      },
    ];
  },
};



export default nextConfig;
