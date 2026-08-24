import { useState } from "react";
import { PRESETS, todayISO } from "../lib/dateRange";
import { COLOR, FONT, RADIUS } from "../lib/theme";

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
    fontFamily: FONT.mono,
    borderRadius: RADIUS.pill,
    border: `1px solid ${active ? COLOR.blue : COLOR.border}`,
    background: active ? COLOR.blue : "transparent",
    color: active ? "#FFFFFF" : COLOR.textMuted,
    cursor: "pointer",
  });

  const inputStyle = {
    fontSize: 12.5,
    fontFamily: FONT.mono,
    border: `1px solid ${COLOR.border}`,
    borderRadius: RADIUS.control - 2,
    padding: "5px 8px",
    background: COLOR.bg,
    color: COLOR.text,
    colorScheme: "dark",
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.control, padding: "8px 10px" }}>
          <input
            type="date"
            value={start}
            max={end || todayISO()}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: 12, color: COLOR.textMuted }}>to</span>
          <input
            type="date"
            value={end}
            min={start}
            max={todayISO()}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={applyCustom}
            disabled={!start || !end}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: FONT.body,
              border: "none",
              borderRadius: RADIUS.control - 2,
              background: COLOR.green,
              color: "#0B1210",
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
