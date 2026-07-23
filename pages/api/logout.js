export default function handler(req, res) {
  res.setHeader(
    "Set-Cookie",
    "dashboard_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
  res.status(200).json({ ok: true });
}
