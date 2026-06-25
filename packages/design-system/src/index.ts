import { Theme } from "@qevora/schemas";
import { checkContrastAA } from "@qevora/shared";

// --- Default Light Theme ---
export const DEFAULT_LIGHT_THEME: Theme = {
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
    overlay: "rgba(0,0,0,0.5)",
  },
  typography: {
    fontFamily: {
      primary: "Inter",
      arabic: "Cairo",
      mono: "JetBrains Mono",
    },
    fontWeights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
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
      "6xl": "3.75rem",
    },
    lineHeights: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "5rem",
    "3xl": "8rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.07)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.1)",
  },
  layout: {
    containerMaxWidth: "1280px",
    navbarHeight: "72px",
    sectionPaddingY: "5rem",
    gridColumns: 12,
    gutter: "1.5rem",
  },
};

// --- CSS Variables Generator ---
export function generateCSSVariables(theme: Theme): string {
  // Validate contrast of text against background
  let textColor = theme.colors.text;
  if (!checkContrastAA(textColor, theme.colors.background)) {
    textColor = theme.colorScheme === "light" ? "#111827" : "#F9FAFB";
  }

  return `
    :root {
      /* Colors */
      --color-primary: ${theme.colors.primary};
      --color-primary-dark: ${theme.colors.primaryDark};
      --color-primary-light: ${theme.colors.primaryLight};
      --color-secondary: ${theme.colors.secondary};
      --color-secondary-dark: ${theme.colors.secondaryDark};
      --color-secondary-light: ${theme.colors.secondaryLight};
      --color-background: ${theme.colors.background};
      --color-background-alt: ${theme.colors.backgroundAlt};
      --color-surface: ${theme.colors.surface};
      --color-surface-elevated: ${theme.colors.surfaceElevated};
      --color-text: ${textColor};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-text-muted: ${theme.colors.textMuted};
      --color-text-inverse: ${theme.colors.textInverse};
      --color-border: ${theme.colors.border};
      --color-border-strong: ${theme.colors.borderStrong};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
      --color-overlay: ${theme.colors.overlay};

      /* Fonts */
      --font-primary: '${theme.typography.fontFamily.primary}', sans-serif;
      --font-arabic: '${theme.typography.fontFamily.arabic}', sans-serif;
      --font-mono: '${theme.typography.fontFamily.mono}', monospace;

      /* Font Weights */
      --font-weight-regular: ${theme.typography.fontWeights.regular};
      --font-weight-medium: ${theme.typography.fontWeights.medium};
      --font-weight-semibold: ${theme.typography.fontWeights.semibold};
      --font-weight-bold: ${theme.typography.fontWeights.bold};
      --font-weight-extrabold: ${theme.typography.fontWeights.extrabold};

      /* Text Scale */
      --text-xs: ${theme.typography.scale.xs};
      --text-sm: ${theme.typography.scale.sm};
      --text-base: ${theme.typography.scale.base};
      --text-lg: ${theme.typography.scale.lg};
      --text-xl: ${theme.typography.scale.xl};
      --text-2xl: ${theme.typography.scale["2xl"]};
      --text-3xl: ${theme.typography.scale["3xl"]};
      --text-4xl: ${theme.typography.scale["4xl"]};
      --text-5xl: ${theme.typography.scale["5xl"]};
      --text-6xl: ${theme.typography.scale["6xl"]};

      /* Line Heights */
      --lh-tight: ${theme.typography.lineHeights.tight};
      --lh-snug: ${theme.typography.lineHeights.snug};
      --lh-normal: ${theme.typography.lineHeights.normal};
      --lh-relaxed: ${theme.typography.lineHeights.relaxed};
      --lh-loose: ${theme.typography.lineHeights.loose};

      /* Spacing */
      --space-xs: ${theme.spacing.xs};
      --space-sm: ${theme.spacing.sm};
      --space-md: ${theme.spacing.md};
      --space-lg: ${theme.spacing.lg};
      --space-xl: ${theme.spacing.xl};
      --space-2xl: ${theme.spacing["2xl"]};
      --space-3xl: ${theme.spacing["3xl"]};

      /* Border Radius */
      --radius-none: ${theme.borderRadius.none};
      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      --radius-xl: ${theme.borderRadius.xl};
      --radius-2xl: ${theme.borderRadius["2xl"]};
      --radius-full: ${theme.borderRadius.full};

      /* Shadows */
      --shadow-none: ${theme.shadows.none};
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-xl: ${theme.shadows.xl};

      /* Layout */
      --container-max-width: ${theme.layout.containerMaxWidth};
      --navbar-height: ${theme.layout.navbarHeight};
      --section-padding-y: ${theme.layout.sectionPaddingY};
      --grid-columns: ${theme.layout.gridColumns};
      --grid-gutter: ${theme.layout.gutter};
    }
  `;
}

// --- Dynamic Styling Injector ---
export function injectThemeCSS(theme: Theme, documentObject?: Document): void {
  const css = generateCSSVariables(theme);
  const doc = documentObject || (typeof document !== "undefined" ? document : null);
  if (!doc) return;

  let styleEl = doc.getElementById("qevora-theme-vars");
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.setAttribute("id", "qevora-theme-vars");
    doc.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}
