/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A stray package-lock.json in the home folder confuses root detection
  outputFileTracingRoot: __dirname
};

module.exports = nextConfig;
