/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // firebase-admin roda só no servidor (rota /api/auth/hub) e não deve ser empacotado.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
