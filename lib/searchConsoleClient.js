import { google } from "googleapis";

let authClient;

function getAuth() {
  if (authClient) return authClient;

  if (!process.env.GA4_SERVICE_ACCOUNT_KEY) {
    throw new Error("GA4_SERVICE_ACCOUNT_KEY is not set");
  }

  const credentials = JSON.parse(
    Buffer.from(process.env.GA4_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
  );

  authClient = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return authClient;
}

// Returns: [{ query, clicks, impressions, ctr, position }]
// Uses the same service account as GA4 — just needs to also be added as a
// user under the Search Console property (see README).
export async function fetchTopSearchQueries({ rowLimit = 10 } = {}) {
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
  if (!siteUrl) {
    throw new Error("SEARCH_CONSOLE_SITE_URL is not set");
  }

  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  // Search Console data typically lags 2-3 days behind real-time.
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 28);

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      dimensions: ["query"],
      rowLimit,
    },
  });

  return (response.data.rows || []).map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr * 100,
    position: r.position,
  }));
}
