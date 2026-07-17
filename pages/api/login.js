const SESSION_COOKIE = "dashboard_session";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!validUser || !validPass || !sessionSecret) {
    return res.status(500).json({
      error: "Login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and SESSION_SECRET.",
    });
  }

  if (username === validUser && password === validPass) {
    const isProd = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    res.setHeader(
      "Set-Cookie",
      `${SESSION_COOKIE}=${sessionSecret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isProd ? "; Secure" : ""}`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: "Invalid username or password" });
}
