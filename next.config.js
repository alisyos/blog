/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // ESLint 오류가 있어도 빌드를 진행합니다
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
