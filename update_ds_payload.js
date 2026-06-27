const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\A Al Malah\\.gemini\\antigravity\\brain\\572648b8-d4b3-4219-bc8a-cccc3a476509\\scratch\\formatted_ds.json', 'utf8');
const ds = JSON.parse(raw).designSystem;

// 1. Update Display Name and Guidelines
ds.displayName = "Qevora Enterprise Design System";
ds.styleGuidelines = `## Brand & Style
The brand personality is Futuristic, Visionary, and Hyper-Intelligent. It targets freelancers, startups, agencies, and small businesses seeking an AI-powered website builder with premium aesthetics.

The visual style is a Glassmorphic-Neon hybrid on a Dark Mode Default canvas (Obsidian Black). It uses high-transparency surfaces, backdrop blurs, and neon accents (Electric Violet and Mint) to convey intelligence and active AI generation.

## Typography
Exclusive use of the Rubik font family to bridge approachable and technical styling. Supports LTR and RTL.`;

// 2. Update Theme fields
ds.theme.namedColors.background = "#09090b";
ds.theme.namedColors.primary = "#c8bfff";
ds.theme.namedColors.secondary = "#44f1bc";
ds.theme.namedColors.surface = "#111217";
ds.theme.namedColors['surface-elevated'] = "#171A21";
ds.theme.namedColors['border-subtle'] = "rgba(255, 255, 255, 0.08)";
ds.theme.namedColors['glow-primary'] = "rgba(108, 77, 255, 0.15)";
ds.theme.namedColors.on_background = "#F9FAFB";
ds.theme.namedColors.on_surface = "#F9FAFB";

// Ensure other override colors are updated
ds.theme.overridePrimaryColor = "#c8bfff";
ds.theme.overrideSecondaryColor = "#44f1bc";
ds.theme.overrideNeutralColor = "#09090b";

fs.writeFileSync('C:\\Users\\A Al Malah\\.gemini\\antigravity\\brain\\572648b8-d4b3-4219-bc8a-cccc3a476509\\scratch\\updated_ds.json', JSON.stringify(ds, null, 2), 'utf8');
console.log('Successfully wrote updated design system to updated_ds.json');
