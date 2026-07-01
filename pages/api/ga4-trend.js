import { getGa4Client, getPropertyId } from "../../lib/ga4Client";

// Returns: [{ month, sessions, conversions, revenue, spend }]
// Note: `spend` (advertiserAdCost) is only available if a Google Ads
// account is linked to this GA4 property. If it's not linked, or the
// request errors, we retry without it and return spend as null.
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;

    const baseRequest = {
      property,
      dateRanges: [{ startDate: "180daysAgo", endDate: "today" }],
      dimensions: [{ name: "yearMonth" }],
      orderBys: [{ dimension: { dimensionName: "yearMonth" } }],
    };

    let rows;
    try {
      const [response] = await client.runReport({
        ...baseRequest,
        metrics: [
          { name: "sessions" },
          { name: "conversions" },
          { name: "totalRevenue" },
          { name: "advertiserAdCost" },
        ],
      });
      rows = (response.rows || []).map((r) => ({
        month: r.dimensionValues[0].value,
        sessions: Number(r.metricValues[0].value),
        conversions: Number(r.metricValues[1].value),
        revenue: Number(r.metricValues[2].value),
        spend: Number(r.metricValues[3].value),
      }));
    } catch {
      // advertiserAdCost unavailable (Google Ads not linked) — retry without it
      const [response] = await client.runReport({
        ...baseRequest,
        metrics: [
          { name: "sessions" },
          { name: "conversions" },
          { name: "totalRevenue" },
        ],
      });
      rows = (response.rows || []).map((r) => ({
        month: r.dimensionValues[0].value,
        sessions: Number(r.metricValues[0].value),
        conversions: Number(r.metricValues[1].value),
        revenue: Number(r.metricValues[2].value),
        spend: null,
      }));
    }

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
