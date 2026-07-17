# Marketing Dashboard

An executive-facing site performance dashboard pulling live data from GA4 and
Google Search Console, deployable on Vercel. Shows sample data until
credentials are configured, then switches to live data automatically.

## Metrics tracked

- Total unique visitors — 6-month trend (always monthly, not affected by the time filter below)
- New vs. returning users — selectable window
- Top pages by views, with engagement rate — selectable window
- Average time on page — selectable window
- Top Google search queries (Search Console) — selectable window
- % of sessions by channel — selectable window
- Key events count, total + by event type — selectable window

## Facebook & Instagram pages

Two additional pages, `/facebook` and `/instagram` (linked from the nav bar),
track the same 8 metrics for each platform via the Meta Graph & Marketing APIs:

- Total followers
- Number of posts
- Likes
- Engagements (likes + comments + shares)
- Ad views (impressions)
- Ad reach
- Ad spend
- Ad CPC

Both respect their own independent time-window filter (same 7/14/30/custom picker).


## Time-window filter

Every metric except the visitor trend chart respects a shared time-window
filter at the top of the dashboard: **7 / 14 / 30 days**, or a **custom**
date range. Changing it refetches all affected API routes with `?startDate=`
and `?endDate=` query params (ISO `YYYY-MM-DD`). The visitor trend chart is
intentionally left as a fixed 6-month monthly view, since a 7-day window
doesn't make sense as a month-by-month trend.

Search Console has a built-in 2-3 day reporting lag — if the selected window
runs up to today, the Search Console route automatically caps the end date
to the latest available day rather than returning empty/partial data for
days Google hasn't processed yet.

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

## 4. Getting Meta (Facebook & Instagram) credentials

1. In [Meta for Developers](https://developers.facebook.com), create an app and add the **Facebook Login for Business** and **Marketing API** products.
2. Generate a long-lived access token for a system user (or admin user) with these permissions: `pages_read_engagement`, `pages_show_list`, `instagram_basic`, `instagram_manage_insights`, `ads_read`. Assign that system user as an admin on your Facebook Page and ad account.
3. Set `META_ACCESS_TOKEN` to that token.
4. Set `META_PAGE_ID` to your Facebook Page ID (Page Settings → About).
5. Find your linked Instagram professional account ID by calling
   `GET /{page-id}?fields=instagram_business_account` in the [Graph API Explorer](https://developers.facebook.com/tools/explorer/), and set `META_IG_USER_ID`.
6. Set `META_AD_ACCOUNT_ID` to your ad account's numeric ID (no `act_` prefix).

**Note on API changes:** Meta deprecated the `page_fans` and `impressions` Page
Insights metrics on November 15, 2025. This project already uses their
replacements (`page_follows` for follower counts) — if you're referencing
older Meta documentation elsewhere, be aware the old metric names will error.

## 5. Login protection

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

## 6. Deploying to Vercel via GitHub

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import that repo.
3. Go to **Project Settings → Environment Variables** and add:
   - `GA4_SERVICE_ACCOUNT_KEY`
   - `GA4_PROPERTY_ID`
   - `SEARCH_CONSOLE_SITE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `META_ACCESS_TOKEN`
   - `META_PAGE_ID`
   - `META_IG_USER_ID`
   - `META_AD_ACCOUNT_ID`
4. Deploy (or redeploy if you added the vars after the first deploy — new env vars require a fresh deployment). All API calls run in serverless functions, so credentials never reach the browser.

## 7. Project structure

```
pages/
  index.js                     — dashboard page, fetches live data with sample-data fallback
  facebook.js                  — Facebook metrics page
  instagram.js                 — Instagram metrics page
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
    facebook-metrics.js        — Facebook organic + ad metrics
    instagram-metrics.js       — Instagram organic + ad metrics
middleware.js                  — gates every route except /login and /api/login behind the session cookie
components/
  Dashboard.jsx                — main site-performance dashboard UI
  SocialMetrics.jsx            — shared UI for the Facebook/Instagram pages
  Nav.jsx                      — top nav bar (Overview / Facebook / Instagram + sign out)
  TimeRangeFilter.jsx          — 7/14/30-day + custom range picker
  sampleData.js                — fallback data shown before credentials are connected
lib/
  ga4Client.js                 — shared GA4 API client setup
  searchConsoleClient.js       — Search Console API client + query fetch
  metaClient.js                — Meta Graph & Marketing API client (Facebook + Instagram)
  format.js                    — date/label formatting helpers
  dateRange.js                 — time-window filter state, resolving to startDate/endDate
public/
  logo.png                     — shown on the login page
  favicon.png
```

## Notes

- "Total Followers" on the Facebook/Instagram pages is a current snapshot
  (the `followers_count` field on the Page/IG user), not affected by the
  selected time window — only Posts/Likes/Engagements/Ads are windowed.
- "Engagements" for both platforms is computed from post-level fields
  (likes + comments + shares for Facebook, likes + comments for Instagram)
  rather than a single page-level metric, since Meta deprecated the old
  `post_engaged_users` aggregate metric.
- The Instagram media list is paginated and filtered client-side to the
  selected date window, since the `/media` edge doesn't support server-side
  date filtering — for accounts with very high posting volume over a long
  custom range, this does more API calls than a single query would.

- "Average time on page" isn't a metric GA4 exposes directly via the API — it's
  derived as `userEngagementDuration / screenPageViews` per page, which is the
  standard approximation.
- Search Console data typically lags 2-3 days behind real time, so the query
  route pulls a 28-day window ending 3 days ago rather than today.
- "Key events" is GA4's current UI name for what the Data API still calls
  `conversions` (renamed in 2024). No property config needed beyond marking
  events as key events in GA4 Admin → Events — the query just reads what's
  already marked.
