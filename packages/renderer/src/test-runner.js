const assert = require("assert");
const { validateSiteSchema } = require("../../schemas/dist/index.js");
const { renderSite } = require("../dist/index.js");

// Mock Site Schema
const mockSchema = {
  schemaVersion: "1.0",
  siteId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  projectId: "8b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  generatedAt: new Date().toISOString(),
  metadata: {
    siteName: { en: "Nova Corp", ar: "نوفا جروب" },
    language: "bilingual",
    direction: "ltr",
    industry: "business",
    seo: {
      defaultTitle: { en: "Nova", ar: "نوفا" }
    }
  },
  theme: {
    colorScheme: "light",
    colors: {
      primary: "#7C3AED",
      primaryDark: "#5B21B6",
      primaryLight: "#EDE9FE",
      secondary: "#F59E0B",
      secondaryDark: "#D97706",
      secondaryLight: "#FEF3C7",
      background: "#FFFFFF",
      backgroundAlt: "#F9FAFB",
      surface: "#FFFFFF",
      surfaceElevated: "#F3F4F6",
      text: "#111827",
      textSecondary: "#6B7280",
      textMuted: "#9CA3AF",
      textInverse: "#FFFFFF",
      border: "#E5E7EB",
      borderStrong: "#D1D5DB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
      overlay: "rgba(0,0,0,0.5)"
    },
    typography: {
      fontFamily: {
        primary: "Inter",
        arabic: "Cairo",
        mono: "JetBrains Mono"
      },
      fontWeights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
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
        "6xl": "3.75rem"
      },
      lineHeights: {
        tight: 1.2,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      }
    },
    spacing: {
      xs: "0.5rem",
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
      xl: "3rem",
      "2xl": "5rem",
      "3xl": "8rem"
    },
    borderRadius: {
      none: "0",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      "2xl": "1.5rem",
      full: "9999px"
    },
    shadows: {
      none: "none",
      sm: "0 1px 2px rgba(0,0,0,0.05)",
      md: "0 4px 6px rgba(0,0,0,0.07)",
      lg: "0 10px 15px rgba(0,0,0,0.1)",
      xl: "0 20px 25px rgba(0,0,0,0.1)"
    },
    layout: {
      containerMaxWidth: "1280px",
      navbarHeight: "72px",
      sectionPaddingY: "5rem",
      gridColumns: 12,
      gutter: "1.5rem"
    }
  },
  pages: [
    {
      id: "page-home",
      slug: "/",
      title: { en: "Home", ar: "الرئيسية" },
      pageType: "home",
      isInNavigation: true,
      navigationOrder: 1,
      seo: {
        title: { en: "Nova Home", ar: "نوفا الرئيسية" },
        noIndex: false,
        noFollow: false
      },
      sections: [
        {
          id: "sec-navbar",
          type: "navbar",
          order: 1,
          content: {
            logoText: { en: "Nova", ar: "نوفا" },
            links: [{ id: "link-1", label: { en: "Home", ar: "الرئيسية"}, href: "/" }]
          }
        },
        {
          id: "sec-hero",
          type: "hero",
          order: 2,
          content: {
            headline: { en: "Find Your Dream Home", ar: "اعثر على منزل أحلامك" },
            subheadline: { en: "Premium properties in Riyadh", ar: "عقارات فاخرة في الرياض" },
            primaryCta: { label: { en: "Contact Us", ar: "اتصل بنا" }, href: "/contact" }
          }
        },
        {
          id: "sec-footer",
          type: "footer",
          order: 99,
          content: {
            logoText: { en: "Nova", ar: "نوفا" },
            copyrightText: { en: "© 2026 Nova.", ar: "© ٢٠٢٦ نوفا."}
          }
        }
      ]
    }
  ],
  ecommerce: null,
  assets: {
    images: [],
    fonts: []
  }
};

function runTestSuite() {
  console.log("=== Running Qevora Quality Gates Test Suite ===");

  // 1. Validate Schema
  console.log("\n1. Testing Site Schema Zod validator...");
  const valResult = validateSiteSchema(mockSchema);
  assert.strictEqual(valResult.success, true, "Zod schema validation failed");
  console.log("✓ Zod schema validation passed.");

  // 2. Test Renderer
  console.log("\n2. Testing Renderer Engine (Static Build mode)...");
  const renderResult = renderSite(mockSchema, { mode: "publish", activeLanguage: "en" });
  assert.strictEqual(renderResult.success, true, "Renderer failed to compile page");
  assert.ok(renderResult.files["index.html"], "index.html was not generated");
  
  const html = renderResult.files["index.html"];
  assert.ok(html.includes("<!DOCTYPE html>"), "Missing HTML doc declaration");
  assert.ok(html.includes("Nova Home"), "HTML output does not contain page title");
  assert.ok(html.includes("Find Your Dream Home"), "HTML output does not contain Hero headline");
  assert.ok(html.includes("var(--color-primary)"), "HTML output does not contain CSS variables styling");
  
  console.log("✓ Static renderer compilation passed.");
  console.log("\n=== ALL QUALITY GATE TESTS PASSED SUCCESSFULLY ===");
}

runTestSuite();
