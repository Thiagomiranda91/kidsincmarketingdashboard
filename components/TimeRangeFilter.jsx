import { useState } from "react";
import { PRESETS, todayISO } from "../lib/dateRange";

const INK = "#20211D";
const ACCENT = "#C4552C";
const LINE = "#DCD5C3";

export default function TimeRangeFilter({ range, onChange }) {
  const [showCustom, setShowCustom] = useState(range.type === "custom");
  const [start, setStart] = useState(range.type === "custom" ? range.start : "");
  const [end, setEnd] = useState(range.type === "custom" ? range.end : todayISO());

  const isActivePreset = (days) => range.type === "preset" && range.days === days;

  function selectPreset(days) {
    setShowCustom(false);
    onChange({ type: "preset", days });
  }

  function applyCustom() {
    if (!start || !end) return;
    onChange({ type: "custom", start, end });
  }

  const btnStyle = (active) => ({
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 4,
    border: `1px solid ${active ? INK : LINE}`,
    background: active ? INK : "#FFFFFF",
    color: active ? "#FFFFFF" : "#5C5748",
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PRESETS.map((days) => (
          <button key={days} onClick={() => selectPreset(days)} style={btnStyle(isActivePreset(days))}>
            {days}D
          </button>
        ))}
        <button
          onClick={() => setShowCustom((v) => !v)}
          style={btnStyle(range.type === "custom")}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 4, padding: "8px 10px" }}>
          <input
            type="date"
            value={start}
            max={end || todayISO()}
            onChange={(e) => setStart(e.target.value)}
            style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${LINE}`, borderRadius: 3, padding: "5px 8px" }}
          />
          <span style={{ fontSize: 12, color: "#8A8371" }}>to</span>
          <input
            type="date"
            value={end}
            min={start}
            max={todayISO()}
            onChange={(e) => setEnd(e.target.value)}
            style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${LINE}`, borderRadius: 3, padding: "5px 8px" }}
          />
          <button
            onClick={applyCustom}
            disabled={!start || !end}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              borderRadius: 3,
              background: ACCENT,
              color: "#fff",
              cursor: start && end ? "pointer" : "default",
              opacity: start && end ? 1 : 0.5,
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
