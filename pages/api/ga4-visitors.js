import { getGa4Client, getPropertyId } from "../../lib/ga4Client";
import { yyyymmToKey, keyToLabel } from "../../lib/format";

// Returns: [{ key: "2026-02", month: "Feb", visitors }]
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate: "180daysAgo", endDate: "today" }],
      dimensions: [{ name: "yearMonth" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ dimension: { dimensionName: "yearMonth" } }],
    });

    const rows = (response.rows || []).map((r) => {
      const key = yyyymmToKey(r.dimensionValues[0].value);
      return { key, month: keyToLabel(key), visitors: Number(r.metricValues[0].value) };
    });

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
