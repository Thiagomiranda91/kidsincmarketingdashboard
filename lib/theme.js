// Shared design tokens for the dark theme. Import these instead of
// hardcoding colors, so every page stays visually consistent.

export const COLOR = {
  bg: "#17181A",            // page background — dark charcoal gray
  surface: "#212325",       // card background
  surfaceRaised: "#282A2D", // hover / nested surface
  border: "rgba(255,255,255,0.14)",
  borderStrong: "rgba(255,255,255,0.28)",
  text: "#F5F6F7",           // primary text — white
  textMuted: "#9AA0A6",      // secondary text / labels
  green: "#22C55E",          // primary actions, positive values, live status
  greenStrong: "#16A34A",    // hover
  blue: "#3B82F6",           // interactive controls, active nav/filters, links
  blueStrong: "#2563EB",     // hover
  danger: "#F87171",         // negative deltas / errors only
  dangerBg: "rgba(248,113,113,0.12)",
};

export const FONT = {
  body: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SFMono-Regular', monospace",
};

export const RADIUS = {
  card: 14,
  control: 8,
  pill: 999,
};
