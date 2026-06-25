import React from "react";
import ReactDOMServer from "react-dom/server";
import { SiteSchema, Page, Theme, SiteMetadata } from "@qevora/schemas";
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
      // In production/publish mode, fail silently but log trace comment
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

  return (
    <ErrorBoundary sectionId={section.id} type={section.type} mode={mode}>
      <Comp
        id={section.id}
        content={section.content}
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
  const direction = metadata.direction;
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

// --- Compile Page to static HTML (Publish Mode helper) ---
export function renderPageToHTML(
  page: Page,
  theme: Theme,
  metadata: SiteMetadata,
  activeLanguage: "en" | "ar" = "en"
): string {
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <PageRenderer page={page} theme={theme} metadata={metadata} activeLanguage={activeLanguage} mode="publish" />
  );

  const cssVariables = generateCSSVariables(theme);
  const title = page.seo.title[activeLanguage] || metadata.siteName[activeLanguage] || "";
  const description = page.seo.description?.[activeLanguage] || metadata.description?.[activeLanguage] || "";

  return `<!DOCTYPE html>
<html lang="${activeLanguage}" dir="${metadata.direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${theme.typography.fontFamily.primary.replace(/\s+/g, "+")}:wght@400;500;600;700&family=${theme.typography.fontFamily.arabic.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssVariables}
    body {
      font-family: ${metadata.direction === "rtl" ? "var(--font-arabic)" : "var(--font-primary)"};
      background-color: var(--color-background);
      color: var(--color-text);
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  ${bodyContent}
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
  warnings: string[];
}

export function renderSite(schema: SiteSchema, options: RenderOptions): RenderResult {
  const activeLanguage = options.activeLanguage || (schema.metadata.language === "ar" ? "ar" : "en");
  const warnings: string[] = [];

  if (options.mode === "publish") {
    const files: Record<string, string> = {};
    for (const page of schema.pages) {
      try {
        const html = renderPageToHTML(page, schema.theme, schema.metadata, activeLanguage);
        const fileName = page.slug === "/" ? "index.html" : `${page.slug.replace(/^\//, "")}.html`;
        files[fileName] = html;
      } catch (err: any) {
        console.error(`Failed to publish page ${page.id}:`, err);
        warnings.push(`Page ${page.id} rendering failed: ${err.message}`);
      }
    }
    return {
      success: Object.keys(files).length > 0,
      files,
      warnings,
    };
  } else {
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
