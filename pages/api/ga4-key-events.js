import { getGa4Client, getPropertyId } from "../../lib/ga4Client";
import { getRangeFromQuery } from "../../lib/dateRange";

// Returns: { total, byEvent: [{ name, count }] }
// Note: GA4 renamed "Conversions" to "Key events" in the UI (2024), but the
// Data API metric name is still `conversions` — same underlying data.
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;
    const { startDate, endDate } = getRangeFromQuery(req.query);

    const [totalResponse] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "conversions" }],
    });
    const total = Number(totalResponse.rows?.[0]?.metricValues[0]?.value || 0);

    const [breakdownResponse] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "conversions" }],
      orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
      limit: 10,
    });

    const byEvent = (breakdownResponse.rows || [])
      .map((r) => ({ name: r.dimensionValues[0].value, count: Number(r.metricValues[0].value) }))
      .filter((r) => r.count > 0);

    res.status(200).json({ total, byEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
