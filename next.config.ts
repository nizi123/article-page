/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // 상태별 + 고유 sid 경로
      { source: "/musicconv/loading/:sid", destination: "/musicconv?v=loading&sid=:sid" },
      { source: "/musicconv/result/:sid",  destination: "/musicconv?v=result&sid=:sid"  },

      // 저장/피드 전용 경로
      { source: "/musicconv/guestbook",     destination: "/musicconv?v=saved"        },
      { source: "/musicconv/guestbook/:id", destination: "/musicconv?v=saved&id=:id" },
    ];
  },
};

module.exports = nextConfig;
