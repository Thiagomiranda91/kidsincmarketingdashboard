# Marketing Dashboard

An executive-facing site performance dashboard pulling live data from GA4 and
Google Search Console, deployable on Vercel. Shows sample data until
credentials are configured, then switches to live data automatically.

## Metrics tracked

- Total unique visitors — 6-month trend
- New vs. returning users — last 28 days
- Top pages by views, with engagement rate — last 28 days
- Average time on page — last 28 days
- Top Google search queries (Search Console) — last 28 days
- % of sessions by channel — last 28 days
- Key events count, total + by event type — last 28 days

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
GA4_SERVICE_ACCOUNT_KEY=<base64-encoded service account JSON>
GA4_PROPERTY_ID=<your GA4 property ID>
SEARCH_CONSOLE_SITE_URL=<your Search Console property URL>
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
   Paste the result as `GA4_SERVICE_ACCOUNT_KEY`. Never commit the raw JSON file — `.gitignore` already excludes `.env.local`.

## 3. Getting Search Console access (same service account)

1. In [Google Cloud Console](https://console.cloud.google.com), enable the **Search Console API** on the same project.
2. In [Search Console](https://search.google.com/search-console), open your property → **Settings → Users and permissions → Add user**.
3. Add the *same* service account email you used for GA4, with **Restricted** (read-only) permission.
4. Set `SEARCH_CONSOLE_SITE_URL` to exactly how the property is listed in Search Console:
   - Domain property → `sc-domain:example.com`
   - URL-prefix property → `https://www.example.com/`

No second key file needed — it reuses `GA4_SERVICE_ACCOUNT_KEY`.

## 4. Login protection

The whole site sits behind a simple login (middleware-based), so only people
with the right credentials can view the dashboard.

Set three env vars (locally in `.env.local`, and on Vercel under Environment Variables):

```
ADMIN_USERNAME=<your chosen username>
ADMIN_PASSWORD=<your chosen password>
SESSION_SECRET=<a long random string>
```

Generate `SESSION_SECRET` with:
```bash
openssl rand -hex 32
```

There are no hardcoded credentials anywhere in the code — if these env vars
aren't set, login is disabled entirely (fails closed) rather than falling
back to a default. This is a lightweight gate suited to an internal
reporting tool, not a full auth system — there's no rate limiting, password
hashing is unnecessary since there's only one account, and sessions don't
expire until the cookie's 7-day max-age runs out or you sign out.

## 5. Deploying to Vercel via GitHub

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import that repo.
3. Go to **Project Settings → Environment Variables** and add:
   - `GA4_SERVICE_ACCOUNT_KEY`
   - `GA4_PROPERTY_ID`
   - `SEARCH_CONSOLE_SITE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
4. Deploy (or redeploy if you added the vars after the first deploy — new env vars require a fresh deployment). All API calls run in serverless functions, so credentials never reach the browser.

## 6. Project structure

```
pages/
  index.js                     — dashboard page, fetches live data with sample-data fallback
  login.js                     — login page (logo + username/password form)
  api/
    login.js                   — checks credentials, sets session cookie
    logout.js                  — clears session cookie
    ga4-visitors.js            — monthly unique visitor trend
    ga4-new-returning.js       — new vs. returning users, last 28 days
    ga4-top-pages.js           — top pages: views, engagement rate, avg time on page
    ga4-channels.js            — % of sessions by channel, last 28 days
    ga4-key-events.js          — key events total + breakdown by type, last 28 days
    search-console-queries.js  — top Google search queries, last 28 days
middleware.js                  — gates every route except /login and /api/login behind the session cookie
components/
  Dashboard.jsx                — all dashboard UI
  sampleData.js                — fallback data shown before credentials are connected
lib/
  ga4Client.js                 — shared GA4 API client setup
  searchConsoleClient.js       — Search Console API client + query fetch
  format.js                    — date/label formatting helpers
public/
  logo.png                     — shown on the login page
  favicon.png
```

## Notes

- "Average time on page" isn't a metric GA4 exposes directly via the API — it's
  derived as `userEngagementDuration / screenPageViews` per page, which is the
  standard approximation.
- Search Console data typically lags 2-3 days behind real time, so the query
  route pulls a 28-day window ending 3 days ago rather than today.
- "Key events" is GA4's current UI name for what the Data API still calls
  `conversions` (renamed in 2024). No property config needed beyond marking
  events as key events in GA4 Admin → Events — the query just reads what's
  already marked.
