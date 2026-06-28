import subprocess
import json

schema = {
    "schemaVersion": "1.0",
    "siteId": "9d4f8c2c-cd8a-4282-8fdb-50d0393b46e2",
    "projectId": "dd59f416-5131-4d86-8429-b46bb11df62e",
    "generatedAt": "2026-06-28T00:00:00Z",
    "metadata": {
        "siteName": {"en": "Qevora Live", "ar": "كيڤورا مباشر"},
        "language": "bilingual",
        "direction": "ltr",
        "industry": "technology",
        "seo": {"defaultTitle": {"en": "Qevora Live", "ar": "كيڤورا مباشر"}}
    },
    "theme": {
        "colorScheme": "dark",
        "colors": {
            "primary": "#7C3AED", "primaryDark": "#5B21B6", "primaryLight": "#EDE9FE",
            "secondary": "#10B981", "secondaryDark": "#059669", "secondaryLight": "#D1FAE5",
            "background": "#0B0F19", "backgroundAlt": "#111827", "surface": "#1F2937", "surfaceElevated": "#374151",
            "text": "#F9FAFB", "textSecondary": "#D1D5DB", "textMuted": "#9CA3AF", "textInverse": "#111827",
            "border": "#374151", "borderStrong": "#4B5563", "success": "#10B981", "warning": "#F59E0B",
            "error": "#EF4444", "info": "#3B82F6", "overlay": "rgba(0,0,0,0.6)"
        },
        "typography": {
            "fontFamily": {"primary": "Rubik", "arabic": "Cairo", "mono": "Fira Code"},
            "fontWeights": {"regular": 400, "medium": 500, "semibold": 600, "bold": 700, "extrabold": 800},
            "scale": {
                "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem",
                "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem"
            },
            "lineHeights": {"tight": 1.2, "snug": 1.375, "normal": 1.5, "relaxed": 1.625, "loose": 2}
        },
        "spacing": {"xs": "0.5rem", "sm": "1rem", "md": "1.5rem", "lg": "2rem", "xl": "3rem", "2xl": "5rem", "3xl": "8rem"},
        "borderRadius": {"none": "0", "sm": "0.25rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem", "2xl": "1.5rem", "full": "9999px"},
        "shadows": {"none": "none", "sm": "0 1px 2px rgba(0,0,0,0.05)", "md": "0 4px 6px rgba(0,0,0,0.07)", "lg": "0 10px 15px rgba(0,0,0,0.1)", "xl": "0 20px 25px rgba(0,0,0,0.1)"},
        "layout": {"containerMaxWidth": "1280px", "navbarHeight": "72px", "sectionPaddingY": "5rem", "gridColumns": 12, "gutter": "1.5rem"}
    },
    "pages": [
        {
            "id": "page-home",
            "slug": "/",
            "title": {"en": "Home", "ar": "الرئيسية"},
            "pageType": "home",
            "isInNavigation": True,
            "navigationOrder": 1,
            "seo": {"title": {"en": "Home", "ar": "الرئيسية"}, "noIndex": False, "noFollow": False},
            "sections": [
                {
                    "id": "sec-nav",
                    "type": "navbar",
                    "order": 1,
                    "isVisible": True,
                    "content": {
                        "logoText": {"en": "Qevora", "ar": "كيڤورا"},
                        "links": [{"id": "link-1", "label": {"en": "Home", "ar": "الرئيسية"}, "href": "/"}]
                    }
                },
                {
                    "id": "sec-hero",
                    "type": "hero",
                    "order": 2,
                    "isVisible": True,
                    "content": {
                        "headline": {"en": "Elevate Your Space", "ar": "ارفع مستوى مساحتك"},
                        "subheadline": {"en": "Beautiful design, generated in seconds.", "ar": "تصميم جميل، يتم إنشاؤه في ثوانٍ."},
                        "primaryCta": {"label": {"en": "Get Started", "ar": "البدء الآن"}, "href": "#"}
                    }
                }
            ]
        }
    ],
    "ecommerce": None,
    "assets": {"images": [], "fonts": []}
}

proc = subprocess.Popen(
    ["node", "packages/renderer/dist/renderer.cjs"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)
stdout, stderr = proc.communicate(input=json.dumps(schema), timeout=15)
print("STDOUT length:", len(stdout))
print("STDOUT sample:", stdout[:200])
print("STDERR sample:", stderr)
try:
    res = json.loads(stdout)
    print("Parsed JSON successfully! Keys:", res.keys())
except Exception as e:
    print("JSON Parse Error:", e)
