/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      jspdf: "jspdf/dist/jspdf.es.min.js",
    },
  },
};

export default nextConfig;

