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
  const isDark = intent.toneKeywords.includes("dark") || intent.toneKeywords.includes("luxury") || intent.toneKeywords.includes("minimalist");
  return {
    colorScheme: isDark ? "dark" : "light",
    colors: isDark ? {
      primary: "#C8BFFF",          // Electric Violet
      primaryDark: "#6D28D9",      // Vibrant Purple
      primaryLight: "#F5F3FF",
      secondary: "#44F1BC",        // Neon Mint
      secondaryDark: "#047857",    // Deep Emerald
      secondaryLight: "#ECFDF5",
      background: "#09090B",       // Obsidian Black
      backgroundAlt: "#111217",    // Dark Slate
      surface: "#111217",          // Container Slate
      surfaceElevated: "#171A21",  // Popover/Interactive Card
      text: "#F9FAFB",             // High-contrast white-gray
      textSecondary: "#9CA3AF",    // Neutral gray
      textMuted: "#4B5563",        // Dark gray
      textInverse: "#09090B",      // Text on light backgrounds
      border: "rgba(255, 255, 255, 0.08)", // Transparent glassmorphic border
      borderStrong: "rgba(255, 255, 255, 0.2)",
      success: "#44F1BC",
      warning: "#FFB955",
      error: "#FFB4AB",
      info: "#2FD9F4",
      overlay: "rgba(0,0,0,0.7)",
    } : {
      primary: "#6D28D9",          // Premium Purple
      primaryDark: "#4C1D95",
      primaryLight: "#F5F3FF",
      secondary: "#10B981",        // Emerald Green
      secondaryDark: "#047857",
      secondaryLight: "#ECFDF5",
      background: "#F9FAFB",
      backgroundAlt: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceElevated: "#F3F4F6",
      text: "#111827",
      textSecondary: "#4B5563",
      textMuted: "#9CA3AF",
      textInverse: "#FFFFFF",
      border: "#E5E7EB",
      borderStrong: "#D1D5DB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
      overlay: "rgba(0,0,0,0.5)",
    },
    typography: {
      fontFamily: {
        primary: "Rubik",
        arabic: "Rubik",
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
    shadows: isDark ? {
      none: "none",
      sm: "0 1px 2px rgba(0,0,0,0.5)",
      md: "0 4px 6px rgba(0,0,0,0.6)",
      lg: "0 10px 15px rgba(0,0,0,0.7)",
      xl: "0 0 20px rgba(109, 40, 217, 0.15)", // Ambient violet glow
    } : {
      none: "none",
      sm: "0 1px 2px rgba(0,0,0,0.05)",
      md: "0 4px 6px rgba(0,0,0,0.07)",
      lg: "0 10px 15px rgba(0,0,0,0.1)",
      xl: "0 20px 25px rgba(0,0,0,0.1)",
    },
    layout: { containerMaxWidth: "1440px", navbarHeight: "72px", sectionPaddingY: "5rem", gridColumns: 12, gutter: "1.5rem" },
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
              headline: { en: "The Future of Your Business Starts Here", ar: "مستقبل أعمالك يبدأ هنا" },
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
        { family: "Rubik", weights: [300, 400, 500, 600, 700, 800], source: "google" }
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
