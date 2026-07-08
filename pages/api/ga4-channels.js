import { getGa4Client, getPropertyId } from "../../lib/ga4Client";

// Returns: [{ name, sessions, pct }]
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    const rows = (response.rows || []).map((r) => ({
      name: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
    }));

    const total = rows.reduce((sum, r) => sum + r.sessions, 0);
    const withPct = rows.map((r) => ({ ...r, pct: total ? (r.sessions / total) * 100 : 0 }));

    res.status(200).json(withPct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
