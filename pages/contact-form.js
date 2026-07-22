import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { SAMPLE_FLAMINGO_MESSAGES } from "../components/sampleData";

const INK = "#20211D";
const PAPER = "#F7F4EC";
const ACCENT = "#C4552C";
const LINE = "#DCD5C3";

const LIMITS = [20, 50, 100];

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

function truncate(text, max = 140) {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function ContactForm() {
  const [limit, setLimit] = useState(20);
  const [messages, setMessages] = useState(SAMPLE_FLAMINGO_MESSAGES);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/flamingo-messages?limit=${limit}`);
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
  }, [limit]);

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
          <div style={{ display: "flex", gap: 8 }}>
            {LIMITS.map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                style={{
                  padding: "7px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  borderRadius: 4,
                  border: `1px solid ${limit === n ? INK : LINE}`,
                  background: limit === n ? INK : "#FFFFFF",
                  color: limit === n ? "#FFFFFF" : "#5C5748",
                  cursor: "pointer",
                }}
              >
                Last {n}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#FBEAE4", color: "#B4402A", fontSize: 13, padding: "10px 14px", borderRadius: 4, marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
            Live data unavailable: {error}
          </div>
        )}

        <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700 }}>
              Recent Submissions
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8A8371" }}>SOURCE: FLAMINGO</div>
          </div>

          <div style={{ display: "flex", fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", padding: "0 0 8px", borderBottom: `1px solid ${LINE}`, gap: 12 }}>
            <div style={{ width: 130 }}>Date</div>
            <div style={{ width: 150 }}>Name</div>
            <div style={{ width: 200 }}>Email</div>
            <div style={{ width: 160 }}>Subject</div>
            <div style={{ flex: 1 }}>Message</div>
          </div>

          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: "#8A8371", padding: "16px 0" }}>No submissions yet.</div>
          )}

          {messages.map((m, i) => (
            <div key={m.id || i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < messages.length - 1 ? `1px solid ${LINE}` : "none", fontSize: 13 }}>
              <div style={{ width: 130, color: "#5C5748", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmtDate(m.date)}</div>
              <div style={{ width: 150, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fromName || "—"}</div>
              <div style={{ width: 200, color: "#5C5748", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fromEmail || "—"}</div>
              <div style={{ width: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject || "—"}</div>
              <div style={{ flex: 1, color: "#5C5748" }}>{truncate(m.message)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: "#8A8371", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
          {isLive ? "Live data from Flamingo (via WordPress)" : "Sample data shown · connect the Flamingo bridge to go live"}
        </div>
      </div>
    </div>
  );
}
