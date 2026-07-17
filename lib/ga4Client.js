import { BetaAnalyticsDataClient } from "@google-analytics/data";

let client;

export function getGa4Client() {
  if (client) return client;

  if (!process.env.GA4_SERVICE_ACCOUNT_KEY) {
    throw new Error("GA4_SERVICE_ACCOUNT_KEY is not set");
  }

  const credentials = JSON.parse(
    Buffer.from(process.env.GA4_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
  );

  client = new BetaAnalyticsDataClient({ credentials });
  return client;
}

export function getPropertyId() {
  if (!process.env.GA4_PROPERTY_ID) {
    throw new Error("GA4_PROPERTY_ID is not set");
  }
  return process.env.GA4_PROPERTY_ID;
}
