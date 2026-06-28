const isProduction = process.env.NODE_ENV === "production";

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://qevora-api-production-016a.up.railway.app",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://qevora-ai.vercel.app",
  environment: process.env.NODE_ENV || "production",
};
