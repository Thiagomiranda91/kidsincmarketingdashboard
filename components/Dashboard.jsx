import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Users, UserPlus, Clock, Target } from "lucide-react";
import { keyToFullLabel } from "../lib/format";
import { rangeLabel } from "../lib/dateRange";
import TimeRangeFilter from "./TimeRangeFilter";

const ACCENT = "#C4552C";
const INK = "#20211D";
const PAPER = "#F7F4EC";
const TEAL = "#12524B";
const GOLD = "#B08B2E";
const LINE = "#DCD5C3";

const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtPct = (n) => `${n.toFixed(1)}%`;
const fmtTime = (seconds) => {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
};

function Card({ title, sourceLabel, children, style }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "22px", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700 }}>{title}</div>
        {sourceLabel && (
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8A8371" }}>{sourceLabel}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function KPICard({ icon: Icon, eyebrow, value, sub }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "20px 22px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8371", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
        <Icon size={13} />
        {eyebrow}
      </div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, color: INK, fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: "#8A8371" }}>{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: INK, color: PAPER, padding: "10px 14px", borderRadius: 3, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ textTransform: "capitalize", opacity: 0.75 }}>{p.dataKey}</span>
          <span>{fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: INK, color: PAPER, padding: "8px 12px", borderRadius: 3, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{p.name}</div>
      <div>{fmtNum(p.value)} users</div>
    </div>
  );
}

export default function Dashboard({ visitors, newReturning, topPages, searchQueries, channels, keyEvents, isLive, range, onRangeChange }) {
  const currentMonth = visitors[visitors.length - 1] || { visitors: 0, month: "—" };

  const totalNewReturning = newReturning.reduce((sum, r) => sum + r.users, 0);
  const newUsers = newReturning.find((r) => r.segment === "new")?.users || 0;
  const returningUsers = newReturning.find((r) => r.segment === "returning")?.users || 0;
  const newPct = totalNewReturning ? (newUsers / totalNewReturning) * 100 : 0;
  const returningPct = totalNewReturning ? (returningUsers / totalNewReturning) * 100 : 0;

  const totalPageViews = topPages.reduce((sum, p) => sum + p.views, 0);
  const overallAvgTime = totalPageViews
    ? topPages.reduce((sum, p) => sum + p.avgTimeOnPage * p.views, 0) / totalPageViews
    : 0;

  const maxChannelSessions = Math.max(...channels.map((c) => c.sessions), 1);
  const maxPageViews = Math.max(...topPages.map((p) => p.views), 1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: PAPER, color: INK, minHeight: "100%", padding: "32px 28px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `2px solid ${INK}`, paddingBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
            Site Performance — Monthly Report
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, fontWeight: 700 }}>
            {currentMonth.key ? keyToFullLabel(currentMonth.key) : currentMonth.month} Overview
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            style={{
              background: "none",
              border: `1px solid ${LINE}`,
              borderRadius: 4,
              padding: "8px 14px",
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#5C5748",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
          <TimeRangeFilter range={range} onChange={onRangeChange} />
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, flexWrap: "nowrap", marginBottom: 24, overflowX: "auto" }}>
        <KPICard icon={Users} eyebrow="Total Users" value={fmtNum(totalNewReturning)} sub={rangeLabel(range).toLowerCase()} />
        <KPICard icon={UserPlus} eyebrow="Unique Visitors" value={fmtNum(currentMonth.visitors)} sub={`${currentMonth.month} · monthly`} />
        <KPICard icon={Clock} eyebrow="Avg. Time on Page" value={fmtTime(overallAvgTime)} sub={`weighted across top pages · ${rangeLabel(range).toLowerCase()}`} />
        <KPICard icon={Target} eyebrow="Key Events" value={fmtNum(keyEvents.total)} sub={`${rangeLabel(range).toLowerCase()} · was 'Conversions'`} />
      </div>

      {/* Visitor trend */}
      <Card title="Total Unique Visitors, 6-Month Trend" sourceLabel="SOURCE: GA4" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={visitors} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL} stopOpacity={0.28} />
                <stop offset="100%" stopColor={TEAL} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={LINE} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8A8371" }} axisLine={{ stroke: LINE }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#8A8371" }} axisLine={false} tickLine={false} tickFormatter={fmtNum} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="visitors" stroke={TEAL} strokeWidth={2.5} fill="url(#visitorsFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Two-column: New vs Returning + Channel share */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <Card title="New vs. Returning Users" sourceLabel={rangeLabel(range)} style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[{ name: "New", value: newUsers }, { name: "Returning", value: returningUsers }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Cell fill={TEAL} />
                  <Cell fill={ACCENT} />
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: TEAL, borderRadius: 2, marginRight: 6 }} />New — {fmtPct(newPct)} ({fmtNum(newUsers)})</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: ACCENT, borderRadius: 2, marginRight: 6 }} />Returning — {fmtPct(returningPct)} ({fmtNum(returningUsers)})</span>
          </div>
        </Card>

        <Card title="% of Sessions by Channel" sourceLabel={rangeLabel(range)} style={{ flex: 1, minWidth: 280 }}>
          {channels.length === 0 && (
            <div style={{ fontSize: 13, color: "#8A8371" }}>No data yet.</div>
          )}
          {channels.map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
              <div style={{ width: 110, fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
              <div style={{ flex: 1, background: "#F0EBDD", borderRadius: 2, height: 14, position: "relative" }}>
                <div style={{ width: `${(c.sessions / maxChannelSessions) * 100}%`, background: i === 0 ? TEAL : GOLD, height: "100%", borderRadius: 2, opacity: i === 0 ? 1 : 0.8 }} />
              </div>
              <div style={{ width: 50, textAlign: "right", fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace" }}>{fmtPct(c.pct)}</div>
            </div>
          ))}
        </Card>

        <Card title="Key Events by Type" sourceLabel={rangeLabel(range)} style={{ flex: 1, minWidth: 280 }}>
          {keyEvents.byEvent.length === 0 && (
            <div style={{ fontSize: 13, color: "#8A8371" }}>No key events marked on this property yet.</div>
          )}
          {keyEvents.byEvent.map((e, i) => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
              <div style={{ width: 130, fontSize: 12.5, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
              <div style={{ flex: 1, background: "#F0EBDD", borderRadius: 2, height: 14, position: "relative" }}>
                <div style={{ width: `${(e.count / (keyEvents.byEvent[0]?.count || 1)) * 100}%`, background: i === 0 ? ACCENT : GOLD, height: "100%", borderRadius: 2, opacity: i === 0 ? 1 : 0.8 }} />
              </div>
              <div style={{ width: 50, textAlign: "right", fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace" }}>{fmtNum(e.count)}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Top pages */}
      <Card title="Top Pages — Views &amp; Engagement" sourceLabel={`${rangeLabel(range)} · SOURCE: GA4`} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ flex: 1 }}>Page</div>
          <div style={{ width: 90, textAlign: "right" }}>Views</div>
          <div style={{ width: 130, textAlign: "right" }}>Engagement Rate</div>
          <div style={{ width: 110, textAlign: "right" }}>Avg. Time</div>
        </div>
        {topPages.length === 0 && (
          <div style={{ fontSize: 13, color: "#8A8371", padding: "12px 0" }}>No data yet.</div>
        )}
        {topPages.map((p, i) => (
          <div key={p.path} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < topPages.length - 1 ? `1px solid ${LINE}` : "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</div>
              <div style={{ marginTop: 4, background: "#F0EBDD", borderRadius: 2, height: 4, width: "70%" }}>
                <div style={{ width: `${(p.views / maxPageViews) * 100}%`, background: TEAL, height: "100%", borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ width: 90, textAlign: "right", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{fmtNum(p.views)}</div>
            <div style={{ width: 130, textAlign: "right", fontSize: 13, color: "#5C5748" }}>{fmtPct(p.engagementRate)}</div>
            <div style={{ width: 110, textAlign: "right", fontSize: 13, color: "#5C5748" }}>{fmtTime(p.avgTimeOnPage)}</div>
          </div>
        ))}
      </Card>

      {/* Search queries */}
      <Card title="Top Search Queries (Google)" sourceLabel={`${rangeLabel(range)} · SOURCE: Search Console`}>
        <div style={{ display: "flex", fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ flex: 1 }}>Query</div>
          <div style={{ width: 80, textAlign: "right" }}>Clicks</div>
          <div style={{ width: 100, textAlign: "right" }}>Impr.</div>
          <div style={{ width: 70, textAlign: "right" }}>CTR</div>
          <div style={{ width: 80, textAlign: "right" }}>Avg. Pos</div>
        </div>
        {searchQueries.length === 0 && (
          <div style={{ fontSize: 13, color: "#8A8371", padding: "12px 0" }}>No data yet.</div>
        )}
        {searchQueries.map((q, i) => (
          <div key={q.query} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderBottom: i < searchQueries.length - 1 ? `1px solid ${LINE}` : "none" }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.query}</div>
            <div style={{ width: 80, textAlign: "right", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{fmtNum(q.clicks)}</div>
            <div style={{ width: 100, textAlign: "right", fontSize: 13, color: "#5C5748" }}>{fmtNum(q.impressions)}</div>
            <div style={{ width: 70, textAlign: "right", fontSize: 13, color: "#5C5748" }}>{fmtPct(q.ctr)}</div>
            <div style={{ width: 80, textAlign: "right", fontSize: 13, color: "#5C5748" }}>{q.position.toFixed(1)}</div>
          </div>
        ))}
      </Card>

      <div style={{ marginTop: 20, fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
        {isLive ? "Live data from GA4 & Search Console" : "Sample data shown · connect GA4 and Search Console to go live"}
      </div>
      {/* keyEvents note: uses GA4's `conversions` metric, shown as "Key Events" to match current GA4 UI naming */}
    </div>
  );
}
