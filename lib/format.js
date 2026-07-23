const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LABELS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// GA4's `yearMonth` dimension returns values like "202602" (YYYYMM).
// This converts that into a sortable/mergeable key: "2026-02".
export function yyyymmToKey(yyyymm) {
  return `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`;
}

// "2026-02" -> "Feb"
export function keyToLabel(key) {
  const [, month] = key.split("-");
  return MONTH_LABELS[Number(month) - 1];
}

// "2026-02" -> "February"
export function keyToFullLabel(key) {
  const [, month] = key.split("-");
  return MONTH_LABELS_FULL[Number(month) - 1];
}

export function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
