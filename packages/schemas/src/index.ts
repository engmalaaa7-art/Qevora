import { z } from "zod";

// --- Bilingual Text ---
export const BilingualTextSchema = z.object({
  en: z.string().nullable().optional(),
  ar: z.string().nullable().optional(),
}).refine(data => data.en || data.ar, {
  message: "At least one language (en or ar) must be provided"
});

export type BilingualText = z.infer<typeof BilingualTextSchema>;

// --- Theme System ---
export const ColorSystemSchema = z.object({
  primary: z.string(),
  primaryDark: z.string(),
  primaryLight: z.string(),
  secondary: z.string(),
  secondaryDark: z.string(),
  secondaryLight: z.string(),
  background: z.string(),
  backgroundAlt: z.string(),
  surface: z.string(),
  surfaceElevated: z.string(),
  text: z.string(),
  textSecondary: z.string(),
  textMuted: z.string(),
  textInverse: z.string(),
  border: z.string(),
  borderStrong: z.string(),
  success: z.string(),
  warning: z.string(),
  error: z.string(),
  info: z.string(),
  overlay: z.string(),
});

export const TypographySystemSchema = z.object({
  fontFamily: z.object({
    primary: z.string(),
    arabic: z.string(),
    mono: z.string(),
  }),
  fontWeights: z.object({
    regular: z.number(),
    medium: z.number(),
    semibold: z.number(),
    bold: z.number(),
    extrabold: z.number(),
  }),
  scale: z.object({
    xs: z.string(),
    sm: z.string(),
    base: z.string(),
    lg: z.string(),
    xl: z.string(),
    "2xl": z.string(),
    "3xl": z.string(),
    "4xl": z.string(),
    "5xl": z.string(),
    "6xl": z.string(),
  }),
  lineHeights: z.object({
    tight: z.number(),
    snug: z.number(),
    normal: z.number(),
    relaxed: z.number(),
    loose: z.number(),
  }),
});

export const SpacingSystemSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  "2xl": z.string(),
  "3xl": z.string(),
});

export const BorderRadiusSchema = z.object({
  none: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  "2xl": z.string(),
  full: z.string(),
});

export const ShadowsSchema = z.object({
  none: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
});

export const LayoutSystemSchema = z.object({
  containerMaxWidth: z.string(),
  navbarHeight: z.string(),
  sectionPaddingY: z.string(),
  gridColumns: z.number(),
  gutter: z.string(),
});

export const ThemeSchema = z.object({
  colorScheme: z.enum(["light", "dark"]),
  colors: ColorSystemSchema,
  typography: TypographySystemSchema,
  spacing: SpacingSystemSchema,
  borderRadius: BorderRadiusSchema,
  shadows: ShadowsSchema,
  layout: LayoutSystemSchema,
});

export type Theme = z.infer<typeof ThemeSchema>;

// --- Section Styles ---
export const SectionStyleSchema = z.object({
  backgroundColor: z.string().nullable().optional(),
  backgroundImage: z.string().nullable().optional(),
  backgroundGradient: z.string().nullable().optional(),
  paddingTop: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
  paddingBottom: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
  fullWidth: z.boolean().optional(),
  containerWidth: z.enum(["narrow", "default", "wide", "full"]).optional(),
});

export type SectionStyle = z.infer<typeof SectionStyleSchema>;

// --- Sections ---
export const SectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  isVisible: z.boolean().default(true),
  content: z.record(z.any()),
  style: SectionStyleSchema.optional(),
});

export type Section = z.infer<typeof SectionSchema>;

// --- Page SEO ---
export const PageSEOSchema = z.object({
  title: BilingualTextSchema,
  description: BilingualTextSchema.optional(),
  keywords: z.array(z.string()).optional(),
  ogTitle: BilingualTextSchema.optional(),
  ogDescription: BilingualTextSchema.optional(),
  ogImageUrl: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

// --- Pages ---
export const PageSchema = z.object({
  id: z.string(),
  slug: z.string().refine(val => val.startsWith("/"), {
    message: "Slug must start with '/'",
  }),
  title: BilingualTextSchema,
  pageType: z.string(),
  isInNavigation: z.boolean(),
  navigationOrder: z.number(),
  seo: PageSEOSchema,
  sections: z.array(SectionSchema),
});

export type Page = z.infer<typeof PageSchema>;

// --- Assets ---
export const ImageAssetSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  source: z.enum(["stock", "uploaded", "generated"]),
  alt: BilingualTextSchema,
  width: z.number().optional(),
  height: z.number().optional(),
  category: z.string().optional(),
});

export const FontAssetSchema = z.object({
  family: z.string(),
  weights: z.array(z.number()),
  source: z.string(),
});

export const AssetsSchema = z.object({
  images: z.array(ImageAssetSchema).default([]),
  fonts: z.array(FontAssetSchema).default([]),
});

export type Assets = z.infer<typeof AssetsSchema>;

// --- Ecommerce ---
export const ProductSchema = z.object({
  id: z.string(),
  name: BilingualTextSchema,
  description: BilingualTextSchema.optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().optional(),
  imageUrls: z.array(z.string().url()),
  category: BilingualTextSchema.optional(),
  inStock: z.boolean().default(true),
  sku: z.string().optional(),
  slug: z.string(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: BilingualTextSchema,
  slug: z.string(),
});

export const EcommerceSchema = z.object({
  enabled: z.boolean(),
  currency: z.string(),
  currencySymbol: BilingualTextSchema,
  cartEnabled: z.boolean().default(true),
  checkoutType: z.enum(["display-only", "whatsapp", "email"]),
  orderEmail: z.string().email().optional(),
  whatsappOrder: z.string().optional(),
  products: z.array(ProductSchema).default([]),
  categories: z.array(CategorySchema).default([]),
}).nullable().optional();

export type Ecommerce = z.infer<typeof EcommerceSchema>;

// --- Site Metadata ---
export const SiteMetadataSchema = z.object({
  siteName: BilingualTextSchema,
  tagline: BilingualTextSchema.optional(),
  description: BilingualTextSchema.optional(),
  language: z.enum(["en", "ar", "bilingual"]),
  direction: z.enum(["ltr", "rtl"]),
  favicon: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  industry: z.string(),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  address: BilingualTextSchema.nullable().optional(),
  socialLinks: z.record(z.string().nullable().optional()).default({}),
  seo: z.object({
    defaultTitle: BilingualTextSchema,
    defaultDescription: BilingualTextSchema.optional(),
    keywords: z.array(z.string()).optional(),
    ogImageUrl: z.string().nullable().optional(),
  }),
});

export type SiteMetadata = z.infer<typeof SiteMetadataSchema>;

// --- Root Site Schema ---
export const SiteSchemaValidator = z.object({
  schemaVersion: z.string().default("1.0"),
  siteId: z.string().uuid(),
  projectId: z.string().uuid(),
  generatedAt: z.string(),
  metadata: SiteMetadataSchema,
  theme: ThemeSchema,
  pages: z.array(PageSchema).min(1, "Site must have at least 1 page"),
  ecommerce: EcommerceSchema,
  assets: AssetsSchema,
});

export type SiteSchema = z.infer<typeof SiteSchemaValidator>;

// --- Deployments ---
export const DeploymentSchemaValidator = z.object({
  deploymentId: z.string(),
  projectId: z.string().uuid(),
  versionId: z.string(),
  status: z.enum(["publishing", "live", "unpublished", "failed"]),
  urls: z.object({
    subdomain: z.string().url(),
    customDomain: z.string().url().nullable().optional(),
  }),
  ssl: z.object({
    status: z.enum(["issued", "pending", "failed"]),
    expiresAt: z.string().nullable().optional(),
  }),
  publishedAt: z.string(),
  metrics: z.object({
    deployDurationMs: z.number(),
    totalBytes: z.number(),
  }).optional(),
});

export type DeploymentSchema = z.infer<typeof DeploymentSchemaValidator>;

// --- Helpers ---
export function validateSiteSchema(schema: unknown): { success: true; data: SiteSchema } | { success: false; errors: z.ZodIssue[] } {
  const result = SiteSchemaValidator.safeParse(schema);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.issues };
  }
}
