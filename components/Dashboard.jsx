import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

const ACCENT = "#C4552C";
const INK = "#20211D";
const PAPER = "#F7F4EC";
const TEAL = "#12524B";
const LINE = "#DCD5C3";

const pctChange = (curr, prev) => (prev ? ((curr - prev) / prev) * 100 : 0);
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtMoney = (n) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function Delta({ value }) {
  const up = value >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: up ? "#12704F" : "#B4402A" }}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function KPICard({ eyebrow, value, delta, sub }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "20px 22px", flex: 1, minWidth: 200 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8371", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
        {eyebrow}
      </div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, color: INK, fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <Delta value={delta} />
        <span style={{ fontSize: 12, color: "#8A8371" }}>{sub}</span>
      </div>
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
          <span>{p.dataKey === "spend" || p.dataKey === "revenue" ? fmtMoney(p.value) : fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ trend, channels, isLive }) {
  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2] || current;

  const maxChannelSessions = Math.max(...channels.map((c) => c.sessions), 1);
  const roas = current.spend ? current.revenue / current.spend : null;
  const prevRoas = previous.spend ? previous.revenue / previous.spend : null;
  const convRate = (current.conversions / current.sessions) * 100;
  const prevConvRate = (previous.conversions / previous.sessions) * 100;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: PAPER, color: INK, minHeight: "100%", padding: "32px 28px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `2px solid ${INK}`, paddingBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
            Marketing Performance — Monthly Report
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, fontWeight: 700 }}>
            {current.month} Overview
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5C5748", fontFamily: "'JetBrains Mono', monospace" }}>
          <Calendar size={14} />
          Last 6 months · vs. prior month
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 30 }}>
        <KPICard eyebrow="Sessions" value={fmtNum(current.sessions)} delta={pctChange(current.sessions, previous.sessions)} sub="vs. prior month" />
        <KPICard eyebrow="Conversions" value={fmtNum(current.conversions)} delta={pctChange(current.conversions, previous.conversions)} sub="vs. prior month" />
        <KPICard eyebrow="Conversion Rate" value={`${convRate.toFixed(2)}%`} delta={pctChange(convRate, prevConvRate)} sub="vs. prior month" />
        <KPICard
          eyebrow="ROAS"
          value={roas != null ? `${roas.toFixed(2)}x` : "—"}
          delta={roas != null && prevRoas != null ? pctChange(roas, prevRoas) : 0}
          sub={current.spend != null ? `${fmtMoney(current.spend)} spend` : "link Google Ads for spend"}
        />
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "22px 22px 10px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700 }}>
            Sessions &amp; Conversions, 6-Month Trend
          </div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8A8371" }}>SOURCE: GA4</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL} stopOpacity={0.28} />
                <stop offset="100%" stopColor={TEAL} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={LINE} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8A8371" }} axisLine={{ stroke: LINE }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#8A8371" }} axisLine={false} tickLine={false} tickFormatter={fmtNum} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sessions" stroke={TEAL} strokeWidth={2.5} fill="url(#sessionsFill)" />
            <Area type="monotone" dataKey="conversions" stroke={ACCENT} strokeWidth={2} fill="none" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 18, fontSize: 12, color: "#5C5748", paddingBottom: 14, paddingLeft: 4 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: TEAL, borderRadius: 2, marginRight: 6 }} />Sessions</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: ACCENT, borderRadius: 2, marginRight: 6 }} />Conversions</span>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700 }}>
            Channel Performance — Ranked by Sessions
          </div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8A8371" }}>LAST 30 DAYS</div>
        </div>
        {channels.map((c, i) => {
          const cr = c.sessions ? ((c.conversions / c.sessions) * 100).toFixed(1) : "0.0";
          const widthPct = (c.sessions / maxChannelSessions) * 100;
          return (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < channels.length - 1 ? `1px solid ${LINE}` : "none" }}>
              <div style={{ width: 22, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8A8371" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ width: 130, fontSize: 13, fontWeight: 600 }}>{c.name}</div>
              <div style={{ flex: 1, background: "#F0EBDD", borderRadius: 2, height: 18, position: "relative" }}>
                <div style={{ width: `${widthPct}%`, background: i === 0 ? TEAL : ACCENT, height: "100%", borderRadius: 2, opacity: i === 0 ? 1 : 0.75 }} />
              </div>
              <div style={{ width: 78, textAlign: "right", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{fmtNum(c.sessions)}</div>
              <div style={{ width: 68, textAlign: "right", fontSize: 12, color: "#5C5748" }}>{cr}% CVR</div>
              <div style={{ width: 90, textAlign: "right", fontSize: 12, color: "#5C5748" }}>{fmtMoney(c.spend)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
        {isLive ? "Live data from GA4" : "Sample data shown · set GA4_SERVICE_ACCOUNT_KEY and GA4_PROPERTY_ID to go live"}
      </div>
    </div>
  );
}
