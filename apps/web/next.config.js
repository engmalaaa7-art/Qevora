/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: [
    "@qevora/schemas",
    "@qevora/shared",
    "@qevora/design-system",
    "@qevora/qevora-renderer",
    "@qevora/ui"
  ],
};

module.exports = nextConfig;

