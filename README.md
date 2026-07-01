# Marketing Dashboard

An executive-facing marketing dashboard pulling live data from GA4, deployable on Vercel.
Shows sample data until GA4 credentials are configured, then switches to live data automatically.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
GA4_SERVICE_ACCOUNT_KEY=<base64-encoded service account JSON>
GA4_PROPERTY_ID=<your GA4 property ID>
```

Then run:

```bash
npm run dev
```

Visit http://localhost:3000 — you'll see sample data until the env vars above are valid.

## 2. Getting GA4 credentials

1. In [Google Cloud Console](https://console.cloud.google.com), create/select a project and enable the **Google Analytics Data API**.
2. Create a **Service Account** (IAM & Admin → Service Accounts), then create a JSON key for it and download it.
3. In GA4 (Admin → Property Access Management), add the service account's email address as a **Viewer** on the property you want to report on.
4. Find your **Property ID** in GA4 Admin → Property Settings (a numeric ID, not the "G-XXXX" measurement ID).
5. Base64-encode the JSON key file:
   ```bash
   base64 -i service-account-key.json | tr -d '\n'
   ```
   Paste the result as `GA4_SERVICE_ACCOUNT_KEY`. Never commit the raw JSON file — `.gitignore` is already set up to keep `.env.local` out of git.

## 3. Deploying to Vercel via GitHub

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import that repo.
3. Before the first deploy (or right after, then redeploy), go to **Project Settings → Environment Variables** and add:
   - `GA4_SERVICE_ACCOUNT_KEY`
   - `GA4_PROPERTY_ID`
4. Deploy. The dashboard will call `/api/ga4-trend` and `/api/ga4-channels`, both serverless functions that keep your credentials server-side — they're never exposed to the browser.

## 4. Notes on spend / ROAS

GA4 only reports ad spend (`advertiserAdCost`) if a Google Ads account is linked to the property
(GA4 Admin → Google Ads Links). If it isn't linked, the API routes automatically drop spend/ROAS
and the dashboard shows "—" for those instead of erroring. To pull spend from a different platform
(Meta, LinkedIn, etc.), add a similar API route under `/pages/api/` calling that platform's API and
merge the results in `pages/index.js`.

## 5. Project structure

```
pages/
  index.js              — dashboard page, fetches live data with sample-data fallback
  api/
    ga4-trend.js         — monthly sessions/conversions/revenue/spend
    ga4-channels.js      — last-30-day channel breakdown
components/
  Dashboard.jsx          — all dashboard UI
  sampleData.js          — fallback data shown before GA4 is connected
lib/
  ga4Client.js           — shared GA4 API client setup
```
