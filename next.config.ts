import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // CV uploads are capped at 5 MB by validation; allow a little headroom for
    // multipart overhead so the server action receives the file.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
