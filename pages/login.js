import { useState } from "react";
import { useRouter } from "next/router";

const ACCENT = "#C4552C";
const INK = "#20211D";
const PAPER = "#F7F4EC";
const LINE = "#DCD5C3";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid username or password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: PAPER,
        color: INK,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#FFFFFF",
          border: `1px solid ${LINE}`,
          borderRadius: 6,
          padding: "36px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <img src="/logo.png" alt="Kids Inc | Lyons Den" style={{ height: "auto", width: "100%", maxWidth: 260 }} />
        </div>

        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", marginBottom: 4 }}>
          Marketing Dashboard
        </div>
        <h1 style={{ margin: "0 0 24px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, textAlign: "center" }}>
          Sign in
        </h1>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#5C5748" }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 16,
              border: `1px solid ${LINE}`,
              borderRadius: 4,
              fontSize: 14,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#5C5748" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 20,
              border: `1px solid ${LINE}`,
              borderRadius: 4,
              fontSize: 14,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div style={{ fontSize: 13, color: "#B4402A", marginBottom: 16 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 0",
              background: ACCENT,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
