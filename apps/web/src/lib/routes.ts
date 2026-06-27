export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  EDITOR: "/editor",
  TEMPLATES: "/templates",
  PRICING: "/pricing",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  ANALYTICS: "/analytics",
  BILLING: "/billing",
  DOMAINS: "/domains",
  HISTORY: "/history",
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.PRICING,
  ROUTES.TEMPLATES,
];
