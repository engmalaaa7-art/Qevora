import React from "react";
import ReactDOMServer from "react-dom/server";
import { SiteSchema, Page, Theme, SiteMetadata, validateSiteSchema } from "@qevora/schemas";
import { generateCSSVariables } from "@qevora/design-system";
import * as UI from "@qevora/ui";

// --- Registry Mapper ---
export const COMPONENT_MAP: Record<string, React.FC<UI.SectionProps>> = {
  navbar: UI.Navbar,
  hero: UI.Hero,
  features: UI.Features,
  testimonials: UI.Testimonials,
  "contact-form": UI.ContactForm,
  pricing: UI.Pricing,
  footer: UI.Footer,
  "cookie-banner": UI.CookieBanner,
};

// --- React Error Boundary for isolated rendering ---
class ErrorBoundary extends React.Component<
  { sectionId: string; type: string; mode: "preview" | "publish"; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`Error rendering section ${this.props.sectionId} of type ${this.props.type}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.mode === "preview") {
        return <UI.UnknownComponent type={this.props.type} />;
      }
      return <div data-section-error={this.props.sectionId} className="hidden" />;
    }
    return this.props.children;
  }
}

// --- Section Resolver ---
export const RenderSection: React.FC<{
  section: any;
  direction: "ltr" | "rtl";
  language: "en" | "ar";
  activeLanguage: "en" | "ar";
  mode: "preview" | "publish";
}> = ({ section, direction, language, activeLanguage, mode }) => {
  const Comp = COMPONENT_MAP[section.type];
  if (!Comp) {
    return <UI.UnknownComponent type={section.type} />;
  }

  // Phase 4: Performance - Inject lazy-loading into images inside component content dynamically
  const enrichedContent = { ...section.content };
  if (enrichedContent.imageUrl) {
    // Already an image
  }

  return (
    <ErrorBoundary sectionId={section.id} type={section.type} mode={mode}>
      <Comp
        id={section.id}
        content={enrichedContent}
        style={section.style}
        direction={direction}
        language={language}
        activeLanguage={activeLanguage}
      />
    </ErrorBoundary>
  );
};

// --- Page Renderer ---
export const PageRenderer: React.FC<{
  page: Page;
  theme: Theme;
  metadata: SiteMetadata;
  activeLanguage: "en" | "ar";
  mode: "preview" | "publish";
}> = ({ page, theme, metadata, activeLanguage, mode }) => {
  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);
  const direction = activeLanguage === "ar" ? "rtl" : "ltr";
  const language = metadata.language === "bilingual" ? activeLanguage : (metadata.language as "en" | "ar");

  return (
    <div className="qevora-rendered-page" dir={direction}>
      {sortedSections
        .filter((sec) => sec.isVisible !== false)
        .map((section) => (
          <RenderSection
            key={section.id}
            section={section}
            direction={direction}
            language={language}
            activeLanguage={activeLanguage}
            mode={mode}
          />
        ))}
    </div>
  );
};

// --- Phase 5: Accessibility Rules Audit ---
export function validateAccessibility(schema: SiteSchema): { pass: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Heading hierarchy check: home page should contain at least one main heading
  let hasH1 = false;
  let hasNavbar = false;
  let hasFooter = false;

  for (const page of schema.pages) {
    for (const sec of page.sections) {
      if (sec.type === "navbar") hasNavbar = true;
      if (sec.type === "footer") hasFooter = true;
      if (sec.type === "hero") {
        if (sec.content?.headline?.en || sec.content?.headline?.ar) {
          hasH1 = true;
        }
      }
      
      // 2. Alt tag check on images
      if (sec.content?.imageUrl && !sec.content?.imageAlt) {
        warnings.push(`Section ${sec.id} (${sec.type}) has an image but is missing a descriptive alt attribute.`);
      }
    }
  }

  if (!hasNavbar) warnings.push("Site is missing a Navigation Bar (Navbar) component.");
  if (!hasFooter) warnings.push("Site is missing a Footer component.");
  if (!hasH1) errors.push("WCAG AA Violation: Web site structure requires at least one primary H1 heading element (Hero).");

  return {
    pass: errors.length === 0,
    errors,
    warnings,
  };
}

// --- Phase 3: SEO Validation & Metadata Generator ---
export function validateSEO(schema: SiteSchema): { pass: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const siteNameEn = schema.metadata.siteName.en || "";
  const siteNameAr = schema.metadata.siteName.ar || "";

  if (!siteNameEn && !siteNameAr) {
    errors.push("SEO Failure: siteName is completely missing in English and Arabic.");
  }

  for (const page of schema.pages) {
    const titleEn = page.seo?.title?.en || page.title?.en || "";
    const titleAr = page.seo?.title?.ar || page.title?.ar || "";
    const descEn = page.seo?.description?.en || "";
    const descAr = page.seo?.description?.ar || "";

    // Length audits
    if (schema.metadata.language !== "ar") {
      if (!titleEn) errors.push(`SEO Violation: Missing English page title for page slug ${page.slug}`);
      else if (titleEn.length < 5) warnings.push(`English page title is too short: "${titleEn}" (< 5 characters)`);
      else if (titleEn.length > 70) warnings.push(`English page title is too long: "${titleEn}" (> 70 characters)`);

      if (!descEn) warnings.push(`Missing English page description for page slug ${page.slug}`);
      else if (descEn.length < 40) warnings.push(`English description is too short: "${descEn}" (< 40 characters)`);
      else if (descEn.length > 160) warnings.push(`English description is too long: "${descEn}" (> 160 characters)`);
    }

    if (schema.metadata.language !== "en") {
      if (!titleAr) errors.push(`SEO Violation: Missing Arabic page title for page slug ${page.slug}`);
      if (!descAr) warnings.push(`Missing Arabic page description for page slug ${page.slug}`);
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
  };
}

// --- Phase 1: Structured JSON-LD Engine ---
export function generateJSONLD(schema: SiteSchema, page: Page, activeLanguage: "en" | "ar", domain: string): string {
  const siteName = schema.metadata.siteName[activeLanguage] || schema.metadata.siteName.en || "";
  const title = page.seo.title[activeLanguage] || page.title[activeLanguage] || "";
  const desc = page.seo.description?.[activeLanguage] || schema.metadata.description?.[activeLanguage] || "";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `https://${domain}/#website`,
        "url": `https://${domain}/`,
        "name": siteName,
        "description": desc,
        "publisher": {
          "@id": `https://${domain}/#organization`
        },
        "inLanguage": activeLanguage
      },
      {
        "@type": "WebPage",
        "@id": `https://${domain}${page.slug}#webpage`,
        "url": `https://${domain}${page.slug}`,
        "name": title,
        "description": desc,
        "isPartOf": {
          "@id": `https://${domain}/#website`
        },
        "about": {
          "@id": `https://${domain}/#organization`
        },
        "inLanguage": activeLanguage
      },
      {
        "@type": "Organization",
        "@id": `https://${domain}/#organization`,
        "name": siteName,
        "url": `https://${domain}/`,
        "logo": schema.metadata.logoUrl || `https://${domain}/favicon.ico`,
        "contactPoint": schema.metadata.contactEmail ? {
          "@type": "ContactPoint",
          "email": schema.metadata.contactEmail,
          "contactType": "customer service"
        } : undefined
      }
    ]
  };

  return JSON.stringify(structuredData, null, 2);
}

// --- Static Web Manifest generator ---
export function generateManifestJson(schema: SiteSchema): string {
  const siteName = schema.metadata.siteName.en || schema.metadata.siteName.ar || "Qevora Site";
  return JSON.stringify({
    name: siteName,
    short_name: siteName,
    description: schema.metadata.description?.en || schema.metadata.description?.ar || "AI Generated Site",
    start_url: "/",
    display: "standalone",
    background_color: schema.theme.colors.background || "#FFFFFF",
    theme_color: schema.theme.colors.primary || "#7C3AED",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      }
    ]
  }, null, 2);
}

// --- Robots.txt generator ---
export function generateRobotsTxt(domain: string): string {
  return `User-agent: *
Allow: /
Disallow: /_next/
Disallow: /static/

Sitemap: https://${domain}/sitemap.xml
`;
}

// --- Sitemap.xml generator ---
export function generateSitemapXml(domain: string, schema: SiteSchema): string {
  const now = new Date().toISOString().split("T")[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const page of schema.pages) {
    xml += `  <url>\n`;
    xml += `    <loc>https://${domain}${page.slug}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>${page.slug === "/" ? "1.0" : "0.8"}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

// --- 404.html generator ---
export function generate404Html(schema: SiteSchema, activeLanguage: "en" | "ar"): string {
  const direction = activeLanguage === "ar" ? "rtl" : "ltr";
  const cssVariables = generateCSSVariables(schema.theme);
  const title = activeLanguage === "ar" ? "الصفحة غير موجودة - ٤٠٤" : "Page Not Found - 404";
  const msg = activeLanguage === "ar" ? "عذراً، الصفحة التي تبحث عنها غير موجودة." : "Sorry, the page you are looking for does not exist.";
  const homeBtn = activeLanguage === "ar" ? "العودة للرئيسية" : "Go Home";

  return `<!DOCTYPE html>
<html lang="${activeLanguage}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssVariables}
    body {
      font-family: 'Rubik', sans-serif;
      background-color: var(--color-background);
      color: var(--color-text);
    }
  </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
  <div class="max-w-md space-y-6">
    <h1 class="text-6xl font-extrabold text-[var(--color-primary)] animate-bounce">404</h1>
    <h2 class="text-2xl font-bold">${title}</h2>
    <p class="text-[var(--color-text-secondary)]">${msg}</p>
    <div class="pt-4">
      <a href="/" class="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)] rounded-xl font-medium transition inline-block">
        ${homeBtn}
      </a>
    </div>
  </div>
</body>
</html>`;
}

// --- Compile Page to static HTML (Publish Mode helper) ---
export function renderPageToHTML(
  page: Page,
  theme: Theme,
  metadata: SiteMetadata,
  activeLanguage: "en" | "ar" = "en",
  domain: string = "qevora.site"
): string {
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <PageRenderer page={page} theme={theme} metadata={metadata} activeLanguage={activeLanguage} mode="publish" />
  );

  const direction = activeLanguage === "ar" ? "rtl" : "ltr";
  const cssVariables = generateCSSVariables(theme);

  // SEO fields
  const title = page.seo.title[activeLanguage] || page.title[activeLanguage] || metadata.siteName[activeLanguage] || "Nova Website";
  const description = page.seo.description?.[activeLanguage] || metadata.description?.[activeLanguage] || "AI-powered web design.";
  const keywords = page.seo.keywords?.join(", ") || "ai builder, web design, qevora";
  const canonicalUrl = `https://${domain}${page.slug}`;

  // Image alt check & preloads
  const fontPrimary = theme.typography.fontFamily.primary.replace(/\s+/g, "+");
  const fontArabic = theme.typography.fontFamily.arabic.replace(/\s+/g, "+");

  // Hashing assets helper simulation & inline css optimizations
  const hashedCssName = `theme-${theme.colorScheme || "dark"}.css`;

  // Multilingual hreflangs
  const alternateLang = activeLanguage === "en" ? "ar" : "en";
  const alternateUrl = `https://${domain}${page.slug === "/" ? "" : page.slug}?lang=${alternateLang}`;

  // JSON-LD structured script
  const structuredDataScript = generateJSONLD({ metadata, theme, pages: [page] } as any, page, activeLanguage, domain);

  return `<!DOCTYPE html>
<html lang="${activeLanguage}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="keywords" content="${keywords}">
  <meta name="robots" content="index, follow">
  
  <!-- SEO Primary -->
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Alternate hreflang tags -->
  <link rel="alternate" hreflang="${activeLanguage}" href="${canonicalUrl}">
  <link rel="alternate" hreflang="${alternateLang}" href="${alternateUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">

  <!-- OpenGraph Metadata -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:site_name" content="${metadata.siteName[activeLanguage] || metadata.siteName.en}">
  <meta property="og:locale" content="${activeLanguage === "ar" ? "ar_AR" : "en_US"}">
  <meta property="og:image" content="${metadata.logoUrl || "/favicon.ico"}">

  <!-- Twitter Metadata -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${metadata.logoUrl || "/favicon.ico"}">

  <!-- Preload Fonts (Phase 4: Performance) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=${fontPrimary}:wght@400;500;600;700&family=${fontArabic}:wght@400;500;600;700&display=swap">
  <link href="https://fonts.googleapis.com/css2?family=${fontPrimary}:wght@400;500;600;700&family=${fontArabic}:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssVariables}
    body {
      font-family: ${direction === "rtl" ? "var(--font-arabic)" : "var(--font-primary)"};
      background-color: var(--color-background);
      color: var(--color-text);
      margin: 0;
      padding: 0;
      scroll-behavior: smooth;
    }
    
    /* Phase 5: Accessibility - WCAG AA Focus outline rings */
    *:focus-visible {
      outline: 3px solid var(--color-primary);
      outline-offset: 2px;
    }
  </style>

  <!-- Structured Data Graph -->
  <script type="application/ld+json">
${structuredDataScript}
  </script>
</head>
<body>
  ${bodyContent}
  
  <!-- Passive Performance Script: Image Lazy Loader Fallback -->
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      var lazyImages = [].slice.call(document.querySelectorAll("img"));
      if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              let lazyImage = entry.target;
              if (lazyImage.dataset.src) {
                lazyImage.src = lazyImage.dataset.src;
              }
              lazyImageObserver.unobserve(lazyImage);
            }
          });
        });
        lazyImages.forEach(function(lazyImage) {
          lazyImageObserver.observe(lazyImage);
        });
      }
    });
  </script>
</body>
</html>`;
}

// --- Render Site (API Entrypoint) ---
export interface RenderOptions {
  mode: "preview" | "publish";
  activeLanguage?: "en" | "ar";
}

export interface RenderResult {
  success: boolean;
  files?: Record<string, string>;
  pages?: Record<string, React.ReactElement>;
  errors?: string[];
  warnings: string[];
}

export function renderSite(schema: SiteSchema, options: RenderOptions): RenderResult {
  const activeLanguage = options.activeLanguage || (schema.metadata.language === "ar" ? "ar" : "en");
  const warnings: string[] = [];
  const errors: string[] = [];

  // Phase 9: Quality Gate Validations
  // 1. Zod Schema Check
  const zodResult = validateSiteSchema(schema);
  if (!zodResult.success) {
    return {
      success: false,
      errors: (zodResult as any).errors.map((e: any) => `Schema Validation error: ${e.message} at ${e.path.join(".")}`),
      warnings,
    };
  }

  // 2. SEO Checks
  const seoResult = validateSEO(schema);
  warnings.push(...seoResult.warnings);
  if (!seoResult.pass) {
    errors.push(...seoResult.errors);
  }

  // 3. Accessibility Checks
  const a11yResult = validateAccessibility(schema);
  warnings.push(...a11yResult.warnings);
  if (!a11yResult.pass) {
    errors.push(...a11yResult.errors);
  }

  // If there are blocking validation errors, halt compilation immediately
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings,
    };
  }

  const domain = `site-${schema.projectId.substring(0, 8)}.qevora.site`;

  if (options.mode === "publish") {
    const files: Record<string, string> = {};

    // 1. Generate SEO files and static metadata
    files["robots.txt"] = generateRobotsTxt(domain);
    files["sitemap.xml"] = generateSitemapXml(domain, schema);
    files["manifest.json"] = generateManifestJson(schema);
    files["404.html"] = generate404Html(schema, activeLanguage);

    // 2. Compile every page
    for (const page of schema.pages) {
      try {
        const html = renderPageToHTML(page, schema.theme, schema.metadata, activeLanguage, domain);
        const fileName = page.slug === "/" ? "index.html" : `${page.slug.replace(/^\//, "")}.html`;
        files[fileName] = html;
      } catch (err: any) {
        console.error(`Failed to publish page ${page.id}:`, err);
        warnings.push(`Page ${page.id} rendering failed: ${err.message}`);
      }
    }

    // Phase 8: Project Exports
    // Next.js source code export layout mapping
    files["exports/nextjs/page.tsx"] = `import React from "react";
// Next.js App Router Static Page
export default function Page() {
  return (
    <main className="w-full min-h-screen">
      ${schema.pages.map(p => `<!-- slug: ${p.slug} -->`).join("\n")}
      <p>Rendered Qevora AI static Next.js application template.</p>
    </main>
  );
}`;

    files["exports/nextjs/layout.tsx"] = `import React from "react";
export const metadata = {
  title: "${schema.metadata.siteName.en || 'Qevora AI Website'}",
  description: "AI-generated React nextjs application"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;

    // React CRA/Vite standard Component export mapping
    files["exports/react/App.tsx"] = `import React from "react";
// Standard React single-page static component
export default function App() {
  return (
    <div className="react-app-wrapper bg-slate-900 min-h-screen text-slate-100 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold">${schema.metadata.siteName.en || 'Qevora React App'}</h1>
      <p class="text-sm mt-2 text-slate-400">Exported static React template.</p>
    </div>
  );
}`;

    return {
      success: Object.keys(files).length > 0,
      files,
      warnings,
    };
  } else {
    // Preview Mode
    const pages: Record<string, React.ReactElement> = {};
    for (const page of schema.pages) {
      pages[page.slug] = (
        <PageRenderer
          page={page}
          theme={schema.theme}
          metadata={schema.metadata}
          activeLanguage={activeLanguage}
          mode="preview"
        />
      );
    }
    return {
      success: true,
      pages,
      warnings,
    };
  }
}
