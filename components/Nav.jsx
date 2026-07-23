import Link from "next/link";
import { useRouter } from "next/router";

const INK = "#20211D";
const LINE = "#DCD5C3";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/facebook", label: "Facebook" },
  { href: "/instagram", label: "Instagram" },
  { href: "/contact-form", label: "Contact Form" },
];

export default function Nav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 28px",
        background: "#FFFFFF",
        borderBottom: `1px solid ${LINE}`,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 26, width: "auto" }} />
        <div style={{ display: "flex", gap: 4 }}>
          {LINKS.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: active ? "#FFFFFF" : "#5C5748",
                  background: active ? INK : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: `1px solid ${LINE}`,
          borderRadius: 4,
          padding: "7px 14px",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: "#5C5748",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
