import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import TimeRangeFilter from "../components/TimeRangeFilter";
import { resolveRange, rangeLabel } from "../lib/dateRange";
import { SAMPLE_FLAMINGO_MESSAGES } from "../components/sampleData";

const INK = "#20211D";
const PAPER = "#F7F4EC";
const ACCENT = "#C4552C";
const TEAL = "#12524B";
const LINE = "#DCD5C3";

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
      style={{ position: "fixed", inset: 0, background: "rgba(32,33,29,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#FFFFFF", borderRadius: 6, padding: "28px 30px", width: "100%", maxWidth: 520, maxHeight: "80vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
              Submission
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20, fontWeight: 700 }}>
              {message.subject || "No subject"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, color: "#8A8371", cursor: "pointer", lineHeight: 1, padding: 4 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: 13, color: "#5C5748", marginBottom: 4 }}>
          <strong style={{ color: INK }}>{message.fromName || "Unknown"}</strong>
          {message.fromEmail ? ` · ${message.fromEmail}` : ""}
        </div>
        <div style={{ fontSize: 12, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", marginBottom: 18 }}>
          {fmtDate(message.date)}
        </div>

        <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, fontSize: 14, color: INK, lineHeight: 1.6 }}>
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
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: PAPER, color: INK, minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "32px 28px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, borderBottom: `2px solid ${INK}`, paddingBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
              Website
            </div>
            <h1 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, fontWeight: 700 }}>
              Contact Form Submissions
            </h1>
          </div>
          <TimeRangeFilter range={range} onChange={setRange} />
        </div>

        {error && (
          <div style={{ background: "#FBEAE4", color: "#B4402A", fontSize: 13, padding: "10px 14px", borderRadius: 4, marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
            Live data unavailable: {error}
          </div>
        )}

        <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700 }}>
              All Submissions
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8A8371" }}>
              {rangeLabel(range)} · SOURCE: FLAMINGO · {messages.length} total
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${LINE}`, gap: 12 }}>
            <div style={{ width: 150 }}>Date</div>
            <div style={{ width: 170 }}>Name</div>
            <div style={{ flex: 1 }}>Email</div>
            <div style={{ width: 200 }}>Subject</div>
            <div style={{ width: 110 }}></div>
          </div>

          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: "#8A8371", padding: "16px 0" }}>No submissions in this window.</div>
          )}

          {messages.map((m, i) => (
            <div key={m.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < messages.length - 1 ? `1px solid ${LINE}` : "none", fontSize: 13 }}>
              <div style={{ width: 150, color: "#5C5748", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmtDate(m.date)}</div>
              <div style={{ width: 170, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fromName || "—"}</div>
              <div style={{ flex: 1, color: "#5C5748", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fromEmail || "—"}</div>
              <div style={{ width: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject || "—"}</div>
              <div style={{ width: 110, textAlign: "right" }}>
                <button
                  onClick={() => setSelected(m)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    borderRadius: 4,
                    border: `1px solid ${TEAL}`,
                    background: "#FFFFFF",
                    color: TEAL,
                    cursor: "pointer",
                  }}
                >
                  View message
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
          {isLive ? "Live data from Flamingo (via WordPress)" : "Sample data shown · connect the Flamingo bridge to go live"}
        </div>
      </div>

      <MessageModal message={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
