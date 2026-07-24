import { Users, FileText, ThumbsUp, Flame, Eye, DollarSign, MousePointerClick } from "lucide-react";
import { rangeLabel } from "../lib/dateRange";
import { COLOR, FONT, RADIUS } from "../lib/theme";
import TimeRangeFilter from "./TimeRangeFilter";
import Nav from "./Nav";

const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

function KPICard({ icon: Icon, eyebrow, value, sub }) {
  return (
    <div style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.card, padding: "20px 22px", flex: 1, minWidth: 180 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: COLOR.textMuted, fontWeight: 600, fontFamily: FONT.mono }}>
        <Icon size={13} color={COLOR.green} />
        {eyebrow}
      </div>
      <div style={{ marginTop: 10, fontSize: 24, fontWeight: 700, color: COLOR.text, fontFamily: FONT.body, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: COLOR.textMuted }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR.textMuted, fontWeight: 700, fontFamily: FONT.mono, margin: "24px 0 10px" }}>
      {children}
    </div>
  );
}

export default function SocialMetrics({ platformName, metrics, isLive, error, range, onRangeChange }) {
  return (
    <div style={{ fontFamily: FONT.body, background: COLOR.bg, color: COLOR.text, minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "32px 28px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `1px solid ${COLOR.border}`, paddingBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLOR.blue, fontWeight: 700, fontFamily: FONT.mono, marginBottom: 6 }}>
              Social Performance
            </div>
            <h1 style={{ margin: 0, fontFamily: FONT.body, fontSize: 30, fontWeight: 800, color: COLOR.text }}>
              {platformName}
            </h1>
          </div>
          <TimeRangeFilter range={range} onChange={onRangeChange} />
        </div>

        {error && (
          <div style={{ background: COLOR.dangerBg, color: COLOR.danger, fontSize: 13, padding: "10px 14px", borderRadius: RADIUS.control, marginBottom: 20, fontFamily: FONT.mono }}>
            Live data unavailable: {error}
          </div>
        )}

        <SectionLabel>Organic — {rangeLabel(range)}</SectionLabel>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <KPICard icon={Users} eyebrow="Total Followers" value={fmtNum(metrics.totalFollowers)} sub="current" />
          <KPICard icon={FileText} eyebrow="Posts" value={fmtNum(metrics.posts)} sub="published" />
          {platformName === "Instagram" && (
            <>
              <KPICard icon={ThumbsUp} eyebrow="Likes" value={fmtNum(metrics.likes)} sub="across posts" />
              <KPICard icon={Flame} eyebrow="Engagements" value={fmtNum(metrics.engagements)} sub="likes + comments + shares" />
            </>
          )}
        </div>

        <SectionLabel>Ads — {rangeLabel(range)}</SectionLabel>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <KPICard icon={Eye} eyebrow="Ad Views" value={fmtNum(metrics.adViews)} sub="impressions" />
          <KPICard icon={Users} eyebrow="Ad Reach" value={fmtNum(metrics.adReach)} sub="unique people" />
          <KPICard icon={DollarSign} eyebrow="Ad Spend" value={fmtMoney(metrics.adSpend)} sub="total spend" />
          <KPICard icon={MousePointerClick} eyebrow="Ad CPC" value={fmtMoney(metrics.adCPC)} sub="cost per click" />
        </div>

        <div style={{ marginTop: 28, fontSize: 11, color: COLOR.textMuted, fontFamily: FONT.mono, textAlign: "center" }}>
          {isLive ? `Live data from Meta (${platformName})` : "Sample data shown · connect Meta credentials to go live"}
        </div>
      </div>
    </div>
  );
}
