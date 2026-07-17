import { Users, FileText, ThumbsUp, Flame, Eye, DollarSign, MousePointerClick } from "lucide-react";
import { rangeLabel } from "../lib/dateRange";
import TimeRangeFilter from "./TimeRangeFilter";
import Nav from "./Nav";

const INK = "#20211D";
const PAPER = "#F7F4EC";
const LINE = "#DCD5C3";

const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

function KPICard({ icon: Icon, eyebrow, value, sub, accent }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "20px 22px", flex: 1, minWidth: 180 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8371", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
        <Icon size={13} />
        {eyebrow}
      </div>
      <div style={{ marginTop: 10, fontSize: 26, fontWeight: 700, color: accent || INK, fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: "#8A8371" }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8371", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", margin: "24px 0 10px" }}>
      {children}
    </div>
  );
}

export default function SocialMetrics({ platformName, brandColor, metrics, isLive, error, range, onRangeChange }) {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: PAPER, color: INK, minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "32px 28px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `2px solid ${INK}`, paddingBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: brandColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
              Social Performance
            </div>
            <h1 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, fontWeight: 700 }}>
              {platformName}
            </h1>
          </div>
          <TimeRangeFilter range={range} onChange={onRangeChange} />
        </div>

        {error && (
          <div style={{ background: "#FBEAE4", color: "#B4402A", fontSize: 13, padding: "10px 14px", borderRadius: 4, marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
            Live data unavailable: {error}
          </div>
        )}

        <SectionLabel>Organic — {rangeLabel(range)}</SectionLabel>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <KPICard icon={Users} eyebrow="Total Followers" value={fmtNum(metrics.totalFollowers)} sub="current" />
          <KPICard icon={FileText} eyebrow="Posts" value={fmtNum(metrics.posts)} sub="published" />
          <KPICard icon={ThumbsUp} eyebrow="Likes" value={fmtNum(metrics.likes)} sub="across posts" />
          <KPICard icon={Flame} eyebrow="Engagements" value={fmtNum(metrics.engagements)} sub="likes + comments + shares" />
        </div>

        <SectionLabel>Ads — {rangeLabel(range)}</SectionLabel>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <KPICard icon={Eye} eyebrow="Ad Views" value={fmtNum(metrics.adViews)} sub="impressions" />
          <KPICard icon={Users} eyebrow="Ad Reach" value={fmtNum(metrics.adReach)} sub="unique people" />
          <KPICard icon={DollarSign} eyebrow="Ad Spend" value={fmtMoney(metrics.adSpend)} sub="total spend" />
          <KPICard icon={MousePointerClick} eyebrow="Ad CPC" value={fmtMoney(metrics.adCPC)} sub="cost per click" />
        </div>

        <div style={{ marginTop: 28, fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
          {isLive ? `Live data from Meta (${platformName})` : "Sample data shown · connect Meta credentials to go live"}
        </div>
      </div>
    </div>
  );
}
