import { SiteSchema, validateSiteSchema } from "@qevora/schemas";

// --- Prompt Version & Governance ---
export const PROMPT_VERSION = "v1.2.4-production";
export const TARGET_AI_MODEL = "claude-3-5-sonnet-20241022";

export interface GovernanceTrace {
  traceId: string;
  projectId: string;
  userId: string;
  promptVersion: string;
  aiModel: string;
  rawPrompt: string;
  intentJson: any;
  sitePlan: any;
  themeJson: any;
  validationResult: any;
  repairAttempts: number;
  tokenUsage: {
    input: number;
    output: number;
    cached?: number;
  };
  latenciesMs: {
    intent: number;
    planning: number;
    generation: number;
    validation: number;
    total: number;
  };
}

// --- Prompt Templates ---
export const PROMPT_TEMPLATES = {
  systemPrompt: `You are Qevora AI, an expert website architect and bilingual content specialist.
Your mission: Transform natural language requests into valid Qevora Site Schema JSON.
ABSOLUTE RULES:
1. Output ONLY valid JSON. No markdown. No prose. No code fences.
2. Never fabricate real contact details. Use placeholders.
3. Always include navbar and footer on every page.
4. Set direction "rtl" when language is "ar" — no exceptions.`,

  intentExtraction: `Analyze the following website request and extract structured intent.
Return ONLY a JSON object:
{
  "siteType": "business|portfolio|ecommerce|blog|saas|landing|agency|personal",
  "industry": "from approved list",
  "primaryLanguage": "en|ar",
  "direction": "ltr|rtl",
  "isBilingual": boolean,
  "businessName": "string or null",
  "toneKeywords": ["professional|modern|warm|bold|minimal|luxury"]
}`,

  schemaGeneration: `Generate a complete Qevora Site Schema JSON document matching the schema specification.
Return ONLY valid JSON.`,

  repairPrompt: `A Qevora Site Schema failed validation. Fix the errors listed below.
Return the COMPLETE corrected schema, not just the fixed parts.
Fix ONLY the listed errors.`
};

// --- Mock Pipeline Engine (Simulating API actions) ---
export function mockExtractIntent(prompt: string) {
  const isArabic = /[\u0600-\u06FF]/.test(prompt);
  const hasStore = /shop|store|بيع|شراء|متجر/i.test(prompt);

  return {
    siteType: hasStore ? "ecommerce" : "business",
    industry: hasStore ? "ecommerce" : "business",
    primaryLanguage: isArabic ? "ar" : "en",
    direction: isArabic ? "rtl" : "ltr",
    isBilingual: prompt.includes("bilingual") || prompt.includes("ثنائي"),
    businessName: "Nova Corp",
    toneKeywords: ["modern", "professional"],
  };
}

export function mockGenerateTheme(intent: any) {
  const isDark = intent.toneKeywords.includes("dark");
  return {
    colorScheme: isDark ? "dark" : "light",
    colors: {
      primary: "#7C3AED",
      primaryDark: "#5B21B6",
      primaryLight: "#EDE9FE",
      secondary: "#F59E0B",
      secondaryDark: "#D97706",
      secondaryLight: "#FEF3C7",
      background: isDark ? "#0F1117" : "#FFFFFF",
      backgroundAlt: isDark ? "#1A1D27" : "#F9FAFB",
      surface: isDark ? "#1E2130" : "#FFFFFF",
      surfaceElevated: isDark ? "#242838" : "#F3F4F6",
      text: isDark ? "#F9FAFB" : "#111827",
      textSecondary: isDark ? "#9CA3AF" : "#6B7280",
      textMuted: isDark ? "#6B7280" : "#9CA3AF",
      textInverse: "#FFFFFF",
      border: isDark ? "#374151" : "#E5E7EB",
      borderStrong: isDark ? "#4B5563" : "#D1D5DB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
      overlay: "rgba(0,0,0,0.5)",
    },
    typography: {
      fontFamily: {
        primary: "Inter",
        arabic: "Cairo",
        mono: "JetBrains Mono",
      },
      fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
      scale: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
      },
      lineHeights: { tight: 1.2, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 },
    },
    spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem", xl: "3rem", "2xl": "5rem", "3xl": "8rem" },
    borderRadius: { none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", "2xl": "1.5rem", full: "9999px" },
    shadows: { none: "none", sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.07)", lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.1)" },
    layout: { containerMaxWidth: "1280px", navbarHeight: "72px", sectionPaddingY: "5rem", gridColumns: 12, gutter: "1.5rem" },
  };
}

export function mockAssembleSchema(
  projectId: string,
  siteId: string,
  intent: any,
  theme: any
): SiteSchema {
  const isAr = intent.primaryLanguage === "ar";
  const name = isAr ? "نوفا جروب" : "Nova Corp";
  const headline = isAr ? "مستقبل أعمالك يبدأ هنا" : "The Future of Your Business Starts Here";

  return {
    schemaVersion: "1.0",
    siteId,
    projectId,
    generatedAt: new Date().toISOString(),
    metadata: {
      siteName: { en: intent.isBilingual ? "Nova Corp" : !isAr ? name : null, ar: intent.isBilingual ? "نوفا جروب" : isAr ? name : null },
      language: intent.isBilingual ? "bilingual" : intent.primaryLanguage,
      direction: intent.direction,
      industry: intent.industry,
      socialLinks: {},
      seo: {
        defaultTitle: { en: "Nova Corp", ar: "نوفا جروب" },
        defaultDescription: { en: "The future of your business", ar: "مستقبل أعمالك" }
      }
    },
    theme,
    pages: [
      {
        id: "page-home",
        slug: "/",
        title: { en: "Home", ar: "الرئيسية" },
        pageType: "home",
        isInNavigation: true,
        navigationOrder: 1,
        seo: {
          title: { en: "Home | Nova", ar: "الرئيسية | نوفا" },
          noIndex: false,
          noFollow: false
        },
        sections: [
          {
            id: "sec-navbar",
            type: "navbar",
            order: 1,
            isVisible: true,
            content: {
              logoText: { en: "Nova Corp", ar: "نوفا جروب" },
              links: [
                { id: "link-home", label: { en: "Home", ar: "الرئيسية" }, href: "/" }
              ],
              showLanguageToggle: intent.isBilingual,
              sticky: true,
              variant: "solid"
            }
          },
          {
            id: "sec-hero",
            type: "hero",
            order: 2,
            isVisible: true,
            content: {
              headline: { en: intent.isBilingual ? "The Future of Your Business" : !isAr ? headline : null, ar: intent.isBilingual ? "مستقبل أعمالك يبدأ هنا" : isAr ? headline : null },
              subheadline: { en: "Premium business scaling platforms", ar: "منصات متميزة لتطوير الأعمال" },
              primaryCta: { label: { en: "Get Started", ar: "ابدأ الآن" }, href: "/contact" },
              imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
              variant: "split"
            }
          },
          {
            id: "sec-features",
            type: "features",
            order: 3,
            isVisible: true,
            content: {
              heading: { en: "Why Choose Us", ar: "لماذا تختارنا" },
              items: [
                {
                  id: "f1",
                  title: { en: "Fast Integration", ar: "دمج سريع" },
                  description: { en: "Deploy in seconds", ar: "انشر في ثوانٍ معدودة" }
                }
              ]
            }
          },
          {
            id: "sec-footer",
            type: "footer",
            order: 99,
            isVisible: true,
            content: {
              logoText: { en: "Nova Corp", ar: "نوفا جروب" },
              tagline: { en: "The future is here", ar: "المستقبل هنا" },
              copyrightText: { en: "© 2026 Nova. All rights reserved.", ar: "© ٢٠٢٦ نوفا. جميع الحقوق محفوظة." }
            }
          }
        ]
      }
    ],
    ecommerce: null,
    assets: {
      images: [
        {
          id: "img-hero",
          url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
          source: "stock",
          alt: { en: "Modern business office", ar: "مكتب أعمال حديث" }
        }
      ],
      fonts: [
        { family: "Inter", weights: [400, 600, 700], source: "google" },
        { family: "Cairo", weights: [400, 600, 700], source: "google" }
      ]
    }
  };
}

// --- Generator Pipeline Entry ---
export interface PipelineResult {
  schema: SiteSchema;
  trace: GovernanceTrace;
}

export function executeGenerationPipeline(
  projectId: string,
  userId: string,
  prompt: string
): PipelineResult {
  const startTime = Date.now();

  const intentStart = Date.now();
  const intent = mockExtractIntent(prompt);
  const intentLatency = Date.now() - intentStart;

  const planStart = Date.now();
  // Simulating plan stage
  const planLatency = Date.now() - planStart;

  const genStart = Date.now();
  const theme = mockGenerateTheme(intent);
  const schema = mockAssembleSchema(projectId, "site_uuid", intent, theme);
  const genLatency = Date.now() - genStart;

  const valStart = Date.now();
  const valResult = validateSiteSchema(schema);
  const valLatency = Date.now() - valStart;

  const totalLatency = Date.now() - startTime;

  const trace: GovernanceTrace = {
    traceId: "trace_" + Math.random().toString(36).substring(7),
    projectId,
    userId,
    promptVersion: PROMPT_VERSION,
    aiModel: TARGET_AI_MODEL,
    rawPrompt: prompt,
    intentJson: intent,
    sitePlan: schema.pages.map(p => ({ id: p.id, sections: p.sections.map(s => s.type) })),
    themeJson: theme,
    validationResult: valResult,
    repairAttempts: 0,
    tokenUsage: {
      input: 3200,
      output: 1400
    },
    latenciesMs: {
      intent: intentLatency,
      planning: planLatency,
      generation: genLatency,
      validation: valLatency,
      total: totalLatency
    }
  };

  return {
    schema,
    trace
  };
}
