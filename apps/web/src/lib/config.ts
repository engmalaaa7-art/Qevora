const isProduction = process.env.NODE_ENV === "production";

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || (isProduction ? "" : "http://localhost:8000"),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || (isProduction ? "" : "http://localhost:3000"),
  environment: process.env.NODE_ENV || "development",
};
