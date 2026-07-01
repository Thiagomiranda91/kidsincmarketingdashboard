import { getGa4Client, getPropertyId } from "../../lib/ga4Client";

// Returns: [{ name, sessions, conversions, spend }]
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;

    const baseRequest = {
      property,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    };

    let rows;
    try {
      const [response] = await client.runReport({
        ...baseRequest,
        metrics: [
          { name: "sessions" },
          { name: "conversions" },
          { name: "advertiserAdCost" },
        ],
      });
      rows = (response.rows || []).map((r) => ({
        name: r.dimensionValues[0].value,
        sessions: Number(r.metricValues[0].value),
        conversions: Number(r.metricValues[1].value),
        spend: Number(r.metricValues[2].value),
      }));
    } catch {
      const [response] = await client.runReport({
        ...baseRequest,
        metrics: [{ name: "sessions" }, { name: "conversions" }],
      });
      rows = (response.rows || []).map((r) => ({
        name: r.dimensionValues[0].value,
        sessions: Number(r.metricValues[0].value),
        conversions: Number(r.metricValues[1].value),
        spend: null,
      }));
    }

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
