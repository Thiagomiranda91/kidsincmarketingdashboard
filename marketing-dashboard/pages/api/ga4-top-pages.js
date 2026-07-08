import { getGa4Client, getPropertyId } from "../../lib/ga4Client";

// Returns: [{ path, views, engagementRate, avgTimeOnPage }]
// avgTimeOnPage is in seconds, approximated as userEngagementDuration / views
// (GA4 doesn't expose a direct "avg time on page" metric; this is the
// standard way to derive it from the API).
export default async function handler(req, res) {
  try {
    const client = getGa4Client();
    const property = `properties/${getPropertyId()}`;

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "userEngagementDuration" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const rows = (response.rows || []).map((r) => {
      const views = Number(r.metricValues[0].value);
      const engagementRate = Number(r.metricValues[1].value) * 100; // GA4 returns a 0-1 fraction
      const engagementDuration = Number(r.metricValues[2].value);
      return {
        path: r.dimensionValues[0].value,
        views,
        engagementRate,
        avgTimeOnPage: views ? engagementDuration / views : 0,
      };
    });

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
