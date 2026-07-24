import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import TimeRangeFilter from "../components/TimeRangeFilter";
import { resolveRange, rangeLabel } from "../lib/dateRange";
import { COLOR, FONT, RADIUS } from "../lib/theme";
import { SAMPLE_FLAMINGO_MESSAGES } from "../components/sampleData";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessageModal({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.card, padding: "28px 30px", width: "100%", maxWidth: 520, maxHeight: "80vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR.blue, fontWeight: 700, fontFamily: FONT.mono, marginBottom: 6 }}>
              Submission
            </div>
            <h2 style={{ margin: 0, fontFamily: FONT.body, fontSize: 19, fontWeight: 700, color: COLOR.text }}>
              {message.subject || "No subject"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, color: COLOR.textMuted, cursor: "pointer", lineHeight: 1, padding: 4 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: 13, color: COLOR.textMuted, marginBottom: 4 }}>
          <strong style={{ color: COLOR.text }}>{message.fromName || "Unknown"}</strong>
          {message.fromEmail ? ` · ${message.fromEmail}` : ""}
        </div>
        <div style={{ fontSize: 12, color: COLOR.textMuted, fontFamily: FONT.mono, marginBottom: 18 }}>
          {fmtDate(message.date)}
        </div>

        <div style={{ borderTop: `1px solid ${COLOR.border}`, paddingTop: 16, fontSize: 14, color: COLOR.text, lineHeight: 1.6 }}>
          {Array.isArray(message.fields) && message.fields.length > 0 ? (
            message.fields.map((f) => (
              <div key={f.label} style={{ marginBottom: 10, whiteSpace: "pre-wrap" }}>
                <strong>{f.label}:</strong> {f.value || "—"}
              </div>
            ))
          ) : (
            <div>No field data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactForm() {
  const [range, setRange] = useState({ type: "preset", days: 30 });
  const [messages, setMessages] = useState(SAMPLE_FLAMINGO_MESSAGES);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { startDate, endDate } = resolveRange(range);
        const res = await fetch(`/api/flamingo-messages?startDate=${startDate}&endDate=${endDate}`);
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError((data && data.error) || `Request failed (${res.status})`);
          return; // keep sample data
        }
        setMessages(Array.isArray(data) ? data : []);
        setIsLive(true);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong fetching form submissions.");
      }
    }
    load();
  }, [range]);

  return (
    <div style={{ fontFamily: FONT.body, background: COLOR.bg, color: COLOR.text, minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "32px 28px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `1px solid ${COLOR.border}`, paddingBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLOR.blue, fontWeight: 700, fontFamily: FONT.mono, marginBottom: 6 }}>
              Website
            </div>
            <h1 style={{ margin: 0, fontFamily: FONT.body, fontSize: 30, fontWeight: 800, color: COLOR.text }}>
              Contact Form Submissions
            </h1>
          </div>
          <TimeRangeFilter range={range} onChange={setRange} />
        </div>

        {error && (
          <div style={{ background: COLOR.dangerBg, color: COLOR.danger, fontSize: 13, padding: "10px 14px", borderRadius: RADIUS.control, marginBottom: 20, fontFamily: FONT.mono }}>
            Live data unavailable: {error}
          </div>
        )}

        <div style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.card, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: FONT.body, fontSize: 17, fontWeight: 700, color: COLOR.text }}>
              All Submissions
            </div>
            <div style={{ fontSize: 11, fontFamily: FONT.mono, color: COLOR.textMuted }}>
              {rangeLabel(range)} · SOURCE: FLAMINGO · {messages.length} total
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 11, color: COLOR.textMuted, fontFamily: FONT.mono, textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${COLOR.border}`, gap: 12 }}>
            <div style={{ width: 150 }}>Date</div>
            <div style={{ width: 170 }}>Name</div>
            <div style={{ flex: 1 }}>Email</div>
            <div style={{ width: 200 }}>Subject</div>
            <div style={{ width: 110 }}></div>
          </div>

          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: COLOR.textMuted, padding: "16px 0" }}>No submissions in this window.</div>
          )}

          {messages.map((m, i) => (
            <div key={m.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < messages.length - 1 ? `1px solid ${COLOR.border}` : "none", fontSize: 13 }}>
              <div style={{ width: 150, color: COLOR.textMuted, fontFamily: FONT.mono, fontSize: 12 }}>{fmtDate(m.date)}</div>
              <div style={{ width: 170, fontWeight: 600, color: COLOR.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fromName || "—"}</div>
              <div style={{ flex: 1, color: COLOR.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fromEmail || "—"}</div>
              <div style={{ width: 200, color: COLOR.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject || "—"}</div>
              <div style={{ width: 110, textAlign: "right" }}>
                <button
                  onClick={() => setSelected(m)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: FONT.mono,
                    borderRadius: RADIUS.control,
                    border: `1px solid ${COLOR.green}`,
                    background: "transparent",
                    color: COLOR.green,
                    cursor: "pointer",
                  }}
                >
                  View message
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: COLOR.textMuted, fontFamily: FONT.mono, textAlign: "center" }}>
          {isLive ? "Live data from Flamingo (via WordPress)" : "Sample data shown · connect the Flamingo bridge to go live"}
        </div>
      </div>

      <MessageModal message={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
