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
//
// Search Console data typically lags 2-3 days behind real-time, so the
// requested endDate is capped to (today - 3 days) even if a more recent
// endDate was requested — Google simply wouldn't have that data yet.
export async function fetchTopSearchQueries({ startDate, endDate, rowLimit = 10 } = {}) {
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
  if (!siteUrl) {
    throw new Error("SEARCH_CONSOLE_SITE_URL is not set");
  }

  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const latestAvailable = new Date();
  latestAvailable.setDate(latestAvailable.getDate() - 3);
  const latestAvailableStr = latestAvailable.toISOString().slice(0, 10);

  const cappedEndDate = endDate && endDate < latestAvailableStr ? endDate : latestAvailableStr;

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate || latestAvailableStr,
      endDate: cappedEndDate,
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
