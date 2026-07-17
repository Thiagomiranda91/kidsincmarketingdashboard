import { getGa4Client, getPropertyId } from "../../lib/ga4Client";
import { getRangeFromQuery } from "../../lib/dateRange";

// Returns: [{ segment: "new" | "returning", users }]
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;
    const { startDate, endDate } = getRangeFromQuery(req.query);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "totalUsers" }],
    });

    const rows = (response.rows || [])
      .filter((r) => r.dimensionValues[0].value !== "(not set)")
      .map((r) => ({
        segment: r.dimensionValues[0].value,
        users: Number(r.metricValues[0].value),
      }));

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
