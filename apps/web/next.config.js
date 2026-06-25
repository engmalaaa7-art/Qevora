/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@qevora/schemas",
    "@qevora/shared",
    "@qevora/design-system",
    "@qevora/qevora-renderer",
    "@qevora/ui"
  ],
};

module.exports = nextConfig;
