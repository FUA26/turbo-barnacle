import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["100.116.51.61"],
  // Listen di semua interface (termasuk IP eksternal)
  // Gunakan environment variable HOSTNAME dan PORT jika tersedia
  experimental: {
    serverComponents: {
      hostname: process.env.HOSTNAME || "0.0.0.0",
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    },
  },
};

export default nextConfig;
