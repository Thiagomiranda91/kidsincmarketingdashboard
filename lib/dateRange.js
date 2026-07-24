// A "range" is either:
//   { type: "preset", days: 7 | 14 | 30 }
//   { type: "custom", start: "YYYY-MM-DD", end: "YYYY-MM-DD" }

export const PRESETS = [7, 14, 30];

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Resolves a range into concrete { startDate, endDate } ISO strings.
export function resolveRange(range) {
  if (range.type === "custom" && range.start && range.end) {
    return { startDate: range.start, endDate: range.end };
  }
  const days = range.days || 28;
  return { startDate: isoDaysAgo(days), endDate: todayISO() };
}

export function rangeLabel(range) {
  if (range.type === "custom" && range.start && range.end) {
    return `${range.start} \u2013 ${range.end}`;
  }
  return `LAST ${range.days || 28} DAYS`;
}

export function rangeQueryString(range) {
  const { startDate, endDate } = resolveRange(range);
  return `startDate=${startDate}&endDate=${endDate}`;
}

// Server-side: reads ?startDate=&endDate= from an API route's req.query,
// falling back to the last 28 days if not provided.
export function getRangeFromQuery(query) {
  const { startDate, endDate } = query || {};
  if (startDate && endDate) {
    return { startDate, endDate };
  }
  return { startDate: isoDaysAgo(28), endDate: todayISO() };
}
