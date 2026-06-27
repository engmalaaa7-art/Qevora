import { Theme } from "@qevora/schemas";
import { checkContrastAA } from "@qevora/shared";

// --- Default Light Theme ---
export const DEFAULT_LIGHT_THEME: Theme = {
  colorScheme: "light",
  colors: {
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
    containerMaxWidth: "1440px",
    navbarHeight: "72px",
    sectionPaddingY: "5rem",
    gridColumns: 12,
    gutter: "1.5rem",
  },
};

// --- Default Dark Theme ---
export const DEFAULT_DARK_THEME: Theme = {
  colorScheme: "dark",
  colors: {
    primary: "#C8BFFF",          // Electric Violet
    primaryDark: "#6D28D9",      // Vibrant Purple
    primaryLight: "#F5F3FF",     // Glow tint
    secondary: "#44F1BC",        // Neon Mint
    secondaryDark: "#047857",    // Deep Emerald
    secondaryLight: "#ECFDF5",   // Mint tint
    background: "#09090B",       // Obsidian Black
    backgroundAlt: "#111217",    // Dark Slate
    surface: "#111217",          // Container Slate
    surfaceElevated: "#171A21",  // Popover/Interactive Card
    text: "#F9FAFB",             // High-contrast gray-white
    textSecondary: "#9CA3AF",    // Muted gray
    textMuted: "#4B5563",        // Dark gray
    textInverse: "#09090B",      // Text on light backgrounds
    border: "rgba(255, 255, 255, 0.08)", // Premium glassmorphic border
    borderStrong: "rgba(255, 255, 255, 0.2)",
    success: "#44F1BC",
    warning: "#FFB955",
    error: "#FFB4AB",
    info: "#2FD9F4",
    overlay: "rgba(0,0,0,0.7)",
  },
  typography: {
    fontFamily: {
      primary: "Rubik",
      arabic: "Rubik",
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
    sm: "0 1px 2px rgba(0,0,0,0.5)",
    md: "0 4px 6px rgba(0,0,0,0.6)",
    lg: "0 10px 15px rgba(0,0,0,0.7)",
    xl: "0 0 20px rgba(109, 40, 217, 0.15)", // Ambient purple glow shadow
  },
  layout: {
    containerMaxWidth: "1440px",
    navbarHeight: "72px",
    sectionPaddingY: "5rem",
    gridColumns: 12,
    gutter: "1.5rem",
  },
};

// --- CSS Variables Generator ---
export function generateCSSVariables(theme: Theme, darkTheme?: Theme): string {
  // Resolve the opposite theme if not explicitly provided
  const resolvedDarkTheme = darkTheme || (theme.colorScheme === "dark" ? theme : DEFAULT_DARK_THEME);
  const resolvedLightTheme = theme.colorScheme === "light" ? theme : DEFAULT_LIGHT_THEME;

  const getThemeVariables = (t: Theme) => {
    let textColor = t.colors.text;
    if (!checkContrastAA(textColor, t.colors.background)) {
      textColor = t.colorScheme === "light" ? "#111827" : "#F9FAFB";
    }

    return `
      --color-primary: ${t.colors.primary};
      --color-primary-dark: ${t.colors.primaryDark};
      --color-primary-light: ${t.colors.primaryLight};
      --color-secondary: ${t.colors.secondary};
      --color-secondary-dark: ${t.colors.secondaryDark};
      --color-secondary-light: ${t.colors.secondaryLight};
      --color-background: ${t.colors.background};
      --color-background-alt: ${t.colors.backgroundAlt};
      --color-surface: ${t.colors.surface};
      --color-surface-elevated: ${t.colors.surfaceElevated};
      --color-text: ${textColor};
      --color-text-secondary: ${t.colors.textSecondary};
      --color-text-muted: ${t.colors.textMuted};
      --color-text-inverse: ${t.colors.textInverse};
      --color-border: ${t.colors.border};
      --color-border-strong: ${t.colors.borderStrong};
      --color-success: ${t.colors.success};
      --color-warning: ${t.colors.warning};
      --color-error: ${t.colors.error};
      --color-info: ${t.colors.info};
      --color-overlay: ${t.colors.overlay};

      /* Fonts */
      --font-primary: var(--font-rubik), '${t.typography.fontFamily.primary}', sans-serif;
      --font-arabic: var(--font-rubik), '${t.typography.fontFamily.arabic}', sans-serif;
      --font-mono: '${t.typography.fontFamily.mono}', monospace;

      /* Font Weights */
      --font-weight-regular: ${t.typography.fontWeights.regular};
      --font-weight-medium: ${t.typography.fontWeights.medium};
      --font-weight-semibold: ${t.typography.fontWeights.semibold};
      --font-weight-bold: ${t.typography.fontWeights.bold};
      --font-weight-extrabold: ${t.typography.fontWeights.extrabold};

      /* Text Scale */
      --text-xs: ${t.typography.scale.xs};
      --text-sm: ${t.typography.scale.sm};
      --text-base: ${t.typography.scale.base};
      --text-lg: ${t.typography.scale.lg};
      --text-xl: ${t.typography.scale.xl};
      --text-2xl: ${t.typography.scale["2xl"]};
      --text-3xl: ${t.typography.scale["3xl"]};
      --text-4xl: ${t.typography.scale["4xl"]};
      --text-5xl: ${t.typography.scale["5xl"]};
      --text-6xl: ${t.typography.scale["6xl"]};

      /* Line Heights */
      --lh-tight: ${t.typography.lineHeights.tight};
      --lh-snug: ${t.typography.lineHeights.snug};
      --lh-normal: ${t.typography.lineHeights.normal};
      --lh-relaxed: ${t.typography.lineHeights.relaxed};
      --lh-loose: ${t.typography.lineHeights.loose};

      /* Spacing */
      --space-xs: ${t.spacing.xs};
      --space-sm: ${t.spacing.sm};
      --space-md: ${t.spacing.md};
      --space-lg: ${t.spacing.lg};
      --space-xl: ${t.spacing.xl};
      --space-2xl: ${t.spacing["2xl"]};
      --space-3xl: ${t.spacing["3xl"]};

      /* Border Radius */
      --radius-none: ${t.borderRadius.none};
      --radius-sm: ${t.borderRadius.sm};
      --radius-md: ${t.borderRadius.md};
      --radius-lg: ${t.borderRadius.lg};
      --radius-xl: ${t.borderRadius.xl};
      --radius-2xl: ${t.borderRadius["2xl"]};
      --radius-full: ${t.borderRadius.full};

      /* Shadows */
      --shadow-none: ${t.shadows.none};
      --shadow-sm: ${t.shadows.sm};
      --shadow-md: ${t.shadows.md};
      --shadow-lg: ${t.shadows.lg};
      --shadow-xl: ${t.shadows.xl};

      /* Layout */
      --container-max-width: ${t.layout.containerMaxWidth};
      --navbar-height: ${t.layout.navbarHeight};
      --section-padding-y: ${t.layout.sectionPaddingY};
      --grid-columns: ${t.layout.gridColumns};
      --grid-gutter: ${t.layout.gutter};
    `;
  };

  // Generate :root based on primary theme, and toggle class based on the other theme
  let css = `
    :root {
      ${getThemeVariables(theme)}
    }
  `;

  if (theme.colorScheme === "light") {
    css += `
      @media (prefers-color-scheme: dark) {
        :root {
          ${getThemeVariables(resolvedDarkTheme)}
        }
      }
      .dark {
        ${getThemeVariables(resolvedDarkTheme)}
      }
    `;
  } else {
    css += `
      @media (prefers-color-scheme: light) {
        :root {
          ${getThemeVariables(resolvedLightTheme)}
        }
      }
      .light {
        ${getThemeVariables(resolvedLightTheme)}
      }
    `;
  }

  // Inject premium animations and helper keyframes
  css += `
    @keyframes qevora-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes qevora-pulse-glow {
      0%, 100% { opacity: 0.15; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.05); }
    }
    .animate-float {
      animation: qevora-float 5s ease-in-out infinite;
    }
    .animate-pulse-glow {
      animation: qevora-pulse-glow 6s ease-in-out infinite;
    }
    .text-glow-primary {
      text-shadow: 0 0 12px color-mix(in srgb, var(--color-primary) 50%, transparent);
    }
    .bg-gradient-premium {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    }
    .bg-glow-radial {
      background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%);
    }
    .glass-effect {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
      border-color: color-mix(in srgb, var(--color-border) 50%, transparent);
    }
  `;

  return css;
}

// --- Dynamic Styling Injector ---
export function injectThemeCSS(theme: Theme, darkTheme?: Theme, documentObject?: Document): void {
  const css = generateCSSVariables(theme, darkTheme);
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

