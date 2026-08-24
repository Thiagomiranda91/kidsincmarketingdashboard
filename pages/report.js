import { useEffect, useState } from "react";
import Link from "next/link";
import { resolveRange, rangeLabel, PRESETS } from "../lib/dateRange";
import {
  SAMPLE_VISITORS,
  SAMPLE_NEW_RETURNING,
  SAMPLE_TOP_PAGES,
  SAMPLE_SEARCH_QUERIES,
  SAMPLE_KEY_EVENTS,
  SAMPLE_CHANNELS,
  SAMPLE_SOCIAL_METRICS,
  SAMPLE_FLAMINGO_MESSAGES,
} from "../components/sampleData";

// Print reports use a light, ink-friendly palette rather than the app's
// dark theme — deliberately not reusing lib/theme.js here.
const INK = "#1A1B1D";
const MUTED = "#6B7075";
const LINE = "#D8DBDE";
const ACCENT = "#1D4ED8"; // blue
const GREEN = "#15803D";

const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));
const fmtPct = (n) => `${(n || 0).toFixed(1)}%`;
const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n || 0);
const fmtTime = (seconds) => {
  const s = Math.round(seconds || 0);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

async function safeJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function Section({ title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 32, breakInside: "avoid" }}>
      <div style={{ borderBottom: `2px solid ${INK}`, paddingBottom: 8, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>{title}</h2>
        {subtitle && <span style={{ fontSize: 11, color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function StatGrid({ stats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, fontWeight: 600 }}>{s.label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginTop: 4 }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ columns, rows, emptyLabel }) {
  if (!rows.length) {
    return <div style={{ fontSize: 12, color: MUTED, padding: "8px 0" }}>{emptyLabel}</div>;
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={{ textAlign: c.align || "left", borderBottom: `1px solid ${INK}`, padding: "5px 6px", fontSize: 10, textTransform: "uppercase", color: MUTED, letterSpacing: "0.04em" }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key} style={{ textAlign: c.align || "left", borderBottom: `1px solid ${LINE}`, padding: "5px 6px", color: INK }}>
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Report() {
  const [range, setRange] = useState({ type: "preset", days: 30 });
  const [loading, setLoading] = useState(true);

  const [visitors, setVisitors] = useState(SAMPLE_VISITORS);
  const [newReturning, setNewReturning] = useState(SAMPLE_NEW_RETURNING);
  const [topPages, setTopPages] = useState(SAMPLE_TOP_PAGES);
  const [searchQueries, setSearchQueries] = useState(SAMPLE_SEARCH_QUERIES);
  const [keyEvents, setKeyEvents] = useState(SAMPLE_KEY_EVENTS);
  const [channels, setChannels] = useState(SAMPLE_CHANNELS);
  const [facebook, setFacebook] = useState(SAMPLE_SOCIAL_METRICS);
  const [instagram, setInstagram] = useState(SAMPLE_SOCIAL_METRICS);
  const [messages, setMessages] = useState(SAMPLE_FLAMINGO_MESSAGES);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { startDate, endDate } = resolveRange(range);
      const qs = `startDate=${startDate}&endDate=${endDate}`;

      const [v, nr, tp, sq, ke, ch, fb, ig, msgs] = await Promise.all([
        safeJson("/api/ga4-visitors"),
        safeJson(`/api/ga4-new-returning?${qs}`),
        safeJson(`/api/ga4-top-pages?${qs}`),
        safeJson(`/api/search-console-queries?${qs}`),
        safeJson(`/api/ga4-key-events?${qs}`),
        safeJson(`/api/ga4-channels?${qs}`),
        safeJson(`/api/facebook-metrics?${qs}`),
        safeJson(`/api/instagram-metrics?${qs}`),
        safeJson(`/api/flamingo-messages?${qs}`),
      ]);

      if (Array.isArray(v) && v.length) setVisitors(v);
      if (Array.isArray(nr) && nr.length) setNewReturning(nr);
      if (Array.isArray(tp)) setTopPages(tp);
      if (Array.isArray(sq)) setSearchQueries(sq);
      if (ke && typeof ke.total === "number") setKeyEvents(ke);
      if (Array.isArray(ch)) setChannels(ch);
      if (fb && typeof fb.totalFollowers === "number") setFacebook(fb);
      if (ig && typeof ig.totalFollowers === "number") setInstagram(ig);
      if (Array.isArray(msgs)) setMessages(msgs);

      setLoading(false);
    }
    load();
  }, [range]);

  const currentMonth = visitors[visitors.length - 1] || { visitors: 0, month: "—" };
  const totalNewReturning = newReturning.reduce((s, r) => s + r.users, 0);
  const totalPageViews = topPages.reduce((s, p) => s + p.views, 0);
  const overallAvgTime = totalPageViews
    ? topPages.reduce((s, p) => s + p.avgTimeOnPage * p.views, 0) / totalPageViews
    : 0;

  return (
    <div style={{ background: "#FFFFFF", color: INK, fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4; margin: 16mm; }
          body { background: #fff; }
        }
      `}</style>

      {/* Controls — hidden when printing */}
      <div className="no-print" style={{ position: "sticky", top: 0, background: "#F4F5F6", borderBottom: `1px solid ${LINE}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <Link href="/" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>← Back to dashboard</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => setRange({ type: "preset", days: d })}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: `1px solid ${range.type === "preset" && range.days === d ? ACCENT : LINE}`,
                background: range.type === "preset" && range.days === d ? ACCENT : "#fff",
                color: range.type === "preset" && range.days === d ? "#fff" : MUTED,
                cursor: "pointer",
              }}
            >
              {d}D
            </button>
          ))}
          <button
            onClick={() => window.print()}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700, borderRadius: 6, border: "none", background: GREEN, color: "#fff", cursor: "pointer" }}
          >
            {loading ? "Loading…" : "Print / Save as PDF"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 28px 60px" }}>
        {/* Report header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `3px solid ${INK}`, paddingBottom: 16, marginBottom: 32 }}>
          <div>
            <img src="/logo.png" alt="Kids Inc | Lyons Den" style={{ height: 32, width: "auto", marginBottom: 12 }} />
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Marketing Report</h1>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{rangeLabel(range)}</div>
          </div>
          <div style={{ fontSize: 11, color: MUTED, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
            Generated {fmtDate(new Date().toISOString())}
          </div>
        </div>

        {/* Overview */}
        <Section title="Website Overview" subtitle="Source: GA4 & Search Console">
          <StatGrid
            stats={[
              { label: "Total Users", value: fmtNum(totalNewReturning) },
              { label: "Unique Visitors", value: `${fmtNum(currentMonth.visitors)} (${currentMonth.month})` },
              { label: "Avg. Time on Page", value: fmtTime(overallAvgTime) },
              { label: "Key Events", value: fmtNum(keyEvents.total) },
            ]}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Unique Visitors, 6-Month Trend</div>
              <DataTable
                columns={[
                  { key: "month", label: "Month" },
                  { key: "visitors", label: "Visitors", align: "right", render: (r) => fmtNum(r.visitors) },
                ]}
                rows={visitors}
                emptyLabel="No data."
              />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Sessions by Channel</div>
              <DataTable
                columns={[
                  { key: "name", label: "Channel" },
                  { key: "pct", label: "%", align: "right", render: (r) => fmtPct(r.pct) },
                ]}
                rows={channels}
                emptyLabel="No data."
              />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Top Pages</div>
          <DataTable
            columns={[
              { key: "path", label: "Page" },
              { key: "views", label: "Views", align: "right", render: (r) => fmtNum(r.views) },
              { key: "engagementRate", label: "Engagement", align: "right", render: (r) => fmtPct(r.engagementRate) },
            ]}
            rows={topPages.slice(0, 8)}
            emptyLabel="No data."
          />

          <div style={{ fontSize: 12, fontWeight: 700, margin: "16px 0 6px" }}>Top Search Queries</div>
          <DataTable
            columns={[
              { key: "query", label: "Query" },
              { key: "clicks", label: "Clicks", align: "right", render: (r) => fmtNum(r.clicks) },
              { key: "position", label: "Avg. Pos", align: "right", render: (r) => r.position.toFixed(1) },
            ]}
            rows={searchQueries.slice(0, 8)}
            emptyLabel="No data."
          />
        </Section>

        {/* Facebook */}
        <Section title="Facebook" subtitle="Source: Meta">
          <StatGrid
            stats={[
              { label: "Total Followers", value: fmtNum(facebook.totalFollowers) },
              { label: "Posts", value: fmtNum(facebook.posts) },
              { label: "Ad Spend", value: fmtMoney(facebook.adSpend) },
              { label: "Ad CPC", value: fmtMoney(facebook.adCPC) },
            ]}
          />
          <StatGrid
            stats={[
              { label: "Ad Views", value: fmtNum(facebook.adViews) },
              { label: "Ad Reach", value: fmtNum(facebook.adReach) },
              { label: "Likes", value: fmtNum(facebook.likes) },
              { label: "Engagements", value: fmtNum(facebook.engagements) },
            ]}
          />
        </Section>

        {/* Instagram */}
        <Section title="Instagram" subtitle="Source: Meta">
          <StatGrid
            stats={[
              { label: "Total Followers", value: fmtNum(instagram.totalFollowers) },
              { label: "Posts", value: fmtNum(instagram.posts) },
              { label: "Likes", value: fmtNum(instagram.likes) },
              { label: "Engagements", value: fmtNum(instagram.engagements) },
            ]}
          />
          <StatGrid
            stats={[
              { label: "Ad Views", value: fmtNum(instagram.adViews) },
              { label: "Ad Reach", value: fmtNum(instagram.adReach) },
              { label: "Ad Spend", value: fmtMoney(instagram.adSpend) },
              { label: "Ad CPC", value: fmtMoney(instagram.adCPC) },
            ]}
          />
        </Section>

        {/* Contact Form */}
        <Section title="Contact Form Submissions" subtitle={`Source: Flamingo · ${messages.length} total`}>
          <DataTable
            columns={[
              { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
              { key: "fromName", label: "Name" },
              { key: "fromEmail", label: "Email" },
              { key: "subject", label: "Subject" },
            ]}
            rows={messages}
            emptyLabel="No submissions in this window."
          />
        </Section>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: `1px solid ${LINE}`, fontSize: 10, color: MUTED, textAlign: "center" }}>
          Kids Inc / Lyons Den — Marketing Dashboard Report
        </div>
      </div>
    </div>
  );
}
