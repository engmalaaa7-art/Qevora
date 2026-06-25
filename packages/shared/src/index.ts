// --- Bilingual Text Helper ---
export function getBilingualText(
  field: { en?: string | null; ar?: string | null } | undefined | null,
  lang: "en" | "ar"
): string {
  if (!field) return "";
  if (lang === "ar") {
    return field.ar || field.en || "";
  }
  return field.en || field.ar || "";
}

// --- WCAG 2.1 Contrast Checker ---
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkContrastAA(fg: string, bg: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(fg, bg);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

// --- Layout & Direction Helpers ---
export function isRTL(direction: "ltr" | "rtl" | string): boolean {
  return direction === "rtl";
}

export function mirrorValue(direction: "ltr" | "rtl", ltrVal: string, rtlVal: string): string {
  return direction === "rtl" ? rtlVal : ltrVal;
}

// --- Slugify Utility ---
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
