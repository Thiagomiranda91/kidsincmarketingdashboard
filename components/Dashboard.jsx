import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Users, UserPlus, Clock, Target } from "lucide-react";
import { keyToFullLabel } from "../lib/format";
import { rangeLabel } from "../lib/dateRange";
import { COLOR, FONT, RADIUS } from "../lib/theme";
import TimeRangeFilter from "./TimeRangeFilter";
import Nav from "./Nav";

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
    <div style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.card, padding: "22px", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 17, fontWeight: 700, color: COLOR.text }}>{title}</div>
        {sourceLabel && (
          <div style={{ fontSize: 11, fontFamily: FONT.mono, color: COLOR.textMuted }}>{sourceLabel}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function KPICard({ icon: Icon, eyebrow, value, sub }) {
  return (
    <div style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.card, padding: "20px 22px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: COLOR.textMuted, fontWeight: 600, fontFamily: FONT.mono }}>
        <Icon size={13} color={COLOR.green} />
        {eyebrow}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700, color: COLOR.text, fontFamily: FONT.body, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: COLOR.textMuted }}>{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: COLOR.surfaceRaised, border: `1px solid ${COLOR.border}`, color: COLOR.text, padding: "10px 14px", borderRadius: 8, fontSize: 12, fontFamily: FONT.mono }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ textTransform: "capitalize", color: COLOR.textMuted }}>{p.dataKey}</span>
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
    <div style={{ background: COLOR.surfaceRaised, border: `1px solid ${COLOR.border}`, color: COLOR.text, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontFamily: FONT.mono }}>
      <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{p.name}</div>
      <div style={{ color: COLOR.textMuted }}>{fmtNum(p.value)} users</div>
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
    <div style={{ fontFamily: FONT.body, background: COLOR.bg, color: COLOR.text, minHeight: "100%" }}>
      <Nav />
      <div style={{ padding: "32px 28px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `1px solid ${COLOR.border}`, paddingBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLOR.blue, fontWeight: 700, fontFamily: FONT.mono, marginBottom: 6 }}>
            Site Performance — Monthly Report
          </div>
          <h1 style={{ margin: 0, fontFamily: FONT.body, fontSize: 30, fontWeight: 800, color: COLOR.text }}>
            {currentMonth.key ? keyToFullLabel(currentMonth.key) : currentMonth.month} Overview
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
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
                <stop offset="0%" stopColor={COLOR.blue} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLOR.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={COLOR.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: COLOR.textMuted }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: COLOR.textMuted }} axisLine={false} tickLine={false} tickFormatter={fmtNum} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="visitors" stroke={COLOR.blue} strokeWidth={2.5} fill="url(#visitorsFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Three-column: New vs Returning + Channel share + Key Events */}
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
                  <Cell fill={COLOR.green} />
                  <Cell fill={COLOR.blue} />
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4, color: COLOR.text }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: COLOR.green, borderRadius: 3, marginRight: 6 }} />New — {fmtPct(newPct)} ({fmtNum(newUsers)})</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: COLOR.blue, borderRadius: 3, marginRight: 6 }} />Returning — {fmtPct(returningPct)} ({fmtNum(returningUsers)})</span>
          </div>
        </Card>

        <Card title="% of Sessions by Channel" sourceLabel={rangeLabel(range)} style={{ flex: 1, minWidth: 280 }}>
          {channels.length === 0 && (
            <div style={{ fontSize: 13, color: COLOR.textMuted }}>No data yet.</div>
          )}
          {channels.map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
              <div style={{ width: 110, fontSize: 12.5, fontWeight: 600, color: COLOR.text }}>{c.name}</div>
              <div style={{ flex: 1, background: COLOR.surfaceRaised, borderRadius: 4, height: 14, position: "relative" }}>
                <div style={{ width: `${(c.sessions / maxChannelSessions) * 100}%`, background: i === 0 ? COLOR.green : COLOR.blue, height: "100%", borderRadius: 4, opacity: i === 0 ? 1 : 0.75 }} />
              </div>
              <div style={{ width: 50, textAlign: "right", fontSize: 12.5, fontFamily: FONT.mono, color: COLOR.text }}>{fmtPct(c.pct)}</div>
            </div>
          ))}
        </Card>

        <Card title="Key Events by Type" sourceLabel={rangeLabel(range)} style={{ flex: 1, minWidth: 280 }}>
          {keyEvents.byEvent.length === 0 && (
            <div style={{ fontSize: 13, color: COLOR.textMuted }}>No key events marked on this property yet.</div>
          )}
          {keyEvents.byEvent.map((e, i) => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
              <div style={{ width: 130, fontSize: 12.5, fontWeight: 600, fontFamily: FONT.mono, color: COLOR.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
              <div style={{ flex: 1, background: COLOR.surfaceRaised, borderRadius: 4, height: 14, position: "relative" }}>
                <div style={{ width: `${(e.count / (keyEvents.byEvent[0]?.count || 1)) * 100}%`, background: i === 0 ? COLOR.green : COLOR.blue, height: "100%", borderRadius: 4, opacity: i === 0 ? 1 : 0.75 }} />
              </div>
              <div style={{ width: 50, textAlign: "right", fontSize: 12.5, fontFamily: FONT.mono, color: COLOR.text }}>{fmtNum(e.count)}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Top pages */}
      <Card title="Top Pages — Views &amp; Engagement" sourceLabel={`${rangeLabel(range)} · SOURCE: GA4`} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", fontSize: 11, color: COLOR.textMuted, fontFamily: FONT.mono, textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${COLOR.border}` }}>
          <div style={{ flex: 1 }}>Page</div>
          <div style={{ width: 90, textAlign: "right" }}>Views</div>
          <div style={{ width: 130, textAlign: "right" }}>Engagement Rate</div>
          <div style={{ width: 110, textAlign: "right" }}>Avg. Time</div>
        </div>
        {topPages.length === 0 && (
          <div style={{ fontSize: 13, color: COLOR.textMuted, padding: "12px 0" }}>No data yet.</div>
        )}
        {topPages.map((p, i) => (
          <div key={p.path} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < topPages.length - 1 ? `1px solid ${COLOR.border}` : "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT.mono, color: COLOR.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</div>
              <div style={{ marginTop: 4, background: COLOR.surfaceRaised, borderRadius: 3, height: 4, width: "70%" }}>
                <div style={{ width: `${(p.views / maxPageViews) * 100}%`, background: COLOR.blue, height: "100%", borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ width: 90, textAlign: "right", fontSize: 13, fontFamily: FONT.mono, color: COLOR.text }}>{fmtNum(p.views)}</div>
            <div style={{ width: 130, textAlign: "right", fontSize: 13, color: COLOR.textMuted }}>{fmtPct(p.engagementRate)}</div>
            <div style={{ width: 110, textAlign: "right", fontSize: 13, color: COLOR.textMuted }}>{fmtTime(p.avgTimeOnPage)}</div>
          </div>
        ))}
      </Card>

      {/* Search queries */}
      <Card title="Top Search Queries (Google)" sourceLabel={`${rangeLabel(range)} · SOURCE: Search Console`}>
        <div style={{ display: "flex", fontSize: 11, color: COLOR.textMuted, fontFamily: FONT.mono, textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${COLOR.border}` }}>
          <div style={{ flex: 1 }}>Query</div>
          <div style={{ width: 80, textAlign: "right" }}>Clicks</div>
          <div style={{ width: 100, textAlign: "right" }}>Impr.</div>
          <div style={{ width: 70, textAlign: "right" }}>CTR</div>
          <div style={{ width: 80, textAlign: "right" }}>Avg. Pos</div>
        </div>
        {searchQueries.length === 0 && (
          <div style={{ fontSize: 13, color: COLOR.textMuted, padding: "12px 0" }}>No data yet.</div>
        )}
        {searchQueries.map((q, i) => (
          <div key={q.query} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderBottom: i < searchQueries.length - 1 ? `1px solid ${COLOR.border}` : "none" }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: COLOR.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.query}</div>
            <div style={{ width: 80, textAlign: "right", fontSize: 13, fontFamily: FONT.mono, color: COLOR.text }}>{fmtNum(q.clicks)}</div>
            <div style={{ width: 100, textAlign: "right", fontSize: 13, color: COLOR.textMuted }}>{fmtNum(q.impressions)}</div>
            <div style={{ width: 70, textAlign: "right", fontSize: 13, color: COLOR.textMuted }}>{fmtPct(q.ctr)}</div>
            <div style={{ width: 80, textAlign: "right", fontSize: 13, color: COLOR.textMuted }}>{q.position.toFixed(1)}</div>
          </div>
        ))}
      </Card>

      <div style={{ marginTop: 20, fontSize: 11, color: COLOR.textMuted, fontFamily: FONT.mono, textAlign: "center" }}>
        {isLive ? "Live data from GA4 & Search Console" : "Sample data shown · connect GA4 and Search Console to go live"}
      </div>
      {/* keyEvents note: uses GA4's `conversions` metric, shown as "Key Events" to match current GA4 UI naming */}
      </div>
    </div>
  );
}
