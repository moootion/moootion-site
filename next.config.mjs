/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages için tamamen statik çıktı (out/ klasörü)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
