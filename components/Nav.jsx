import Link from "next/link";
import { useRouter } from "next/router";
import { COLOR, FONT, RADIUS } from "../lib/theme";

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
        padding: "14px 28px",
        background: COLOR.surface,
        borderBottom: `1px solid ${COLOR.border}`,
        fontFamily: FONT.body,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 26, width: "auto" }} />
        <div style={{ display: "flex", gap: 4 }}>
          {LINKS.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "7px 16px",
                  borderRadius: RADIUS.pill,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: active ? "#FFFFFF" : COLOR.textMuted,
                  background: active ? COLOR.blue : "transparent",
                  transition: "background 0.15s, color 0.15s",
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
          background: "transparent",
          border: `1px solid ${COLOR.border}`,
          borderRadius: RADIUS.control,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 600,
          fontFamily: FONT.mono,
          color: COLOR.textMuted,
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
