// Shared client for Meta's Graph API (organic Page/Instagram data) and
// Marketing API (ad insights), used by both the Facebook and Instagram pages.
//
// Current as of early 2026: Meta deprecated `page_fans` and `impressions`
// Page Insights metrics on November 15, 2025. Follower counts now come from
// `page_follows` (Facebook) — this file uses that, not the old metric names.

const GRAPH_VERSION = "v25.0";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function graphGet(path, params = {}, tokenType = "system") {
  const accessToken =
    tokenType === "page"
      ? requireEnv("META_PAGE_ACCESS_TOKEN")
      : requireEnv("META_ACCESS_TOKEN");

  console.log({
    path,
    tokenType,
    tokenPrefix: accessToken.substring(0, 15),
  });

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);

  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );

  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
  console.error({
    path,
    tokenType,
    metaError: data.error,
  });

  throw new Error(data.error.message);
}

  return data;
}

function toUnix(isoDate) {
  return Math.floor(new Date(isoDate).getTime() / 1000);
}

// Total (current) follower count — a direct field on the Page/IG user node,
// not tied to a date range. Facebook Pages: "followers_count".
// Instagram: "followers_count".
export async function fetchFacebookFollowers({ pageId }) {
  const data = await graphGet(
    pageId,
    {
      fields: "followers_count",
    },
    "system"
  );

  return Number(data.followers_count || 0);
}

// Instagram Business Account follower count
export async function fetchInstagramFollowers({ igUserId }) {
  const data = await graphGet(
    igUserId,
    {
      fields: "followers_count",
    },
    "system"
  );

  return Number(data.followers_count || 0);
}

// Facebook Page posts: count + likes + engagements (likes + comments + shares).
// `post_engaged_users` was deprecated in the 2024 Page migration, so
// engagement here is computed from post-level fields directly.
export async function fetchFacebookPosts({ pageId, since, until }) {
  let count = 0;
  let likes = 0;
  let comments = 0;
  let shares = 0;

  let data = await graphGet(
    `${pageId}/posts`,
    {
      fields: "id,likes.summary(true),comments.summary(true),shares",
      since: toUnix(since),
      until: toUnix(until),
      limit: 100,
    },
    "page"
  );

  const processPosts = (posts = []) => {
    posts.forEach((post) => {
      count++;

      likes += post.likes?.summary?.total_count || 0;
      comments += post.comments?.summary?.total_count || 0;
      shares += post.shares?.count || 0;
    });
  };

  processPosts(data.data);

  let next = data.paging?.next;

  while (next) {
    const res = await fetch(next);
    data = await res.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    processPosts(data.data);

    next = data.paging?.next;
  }

  return {
    postCount: count,
    likes,
    engagements: likes + comments + shares,
  };
}

// Instagram media: count + likes + engagements (likes + comments) within a window.
// The /media edge doesn't filter by date server-side, so results are paginated
// (newest first) until we're past the window, then filtered client-side.
export async function fetchInstagramMediaStats({ igUserId, since, until }) {
  const sinceTs = toUnix(since);
  const untilTs = toUnix(until);

  let media = [];
  let data = await graphGet(`${igUserId}/media`, {
    fields: "id,timestamp,like_count,comments_count",
    limit: 100,
  });
  media = media.concat(data.data || []);

  let next = data.paging?.next;
  let pageCount = 0;
  while (next && pageCount < 5) {
    const oldest = media[media.length - 1];
    if (oldest && new Date(oldest.timestamp).getTime() / 1000 < sinceTs) break;
    const res = await fetch(next);
    data = await res.json();
    media = media.concat(data.data || []);
    next = data.paging?.next;
    pageCount += 1;
  }

  const inWindow = media.filter((m) => {
    const t = new Date(m.timestamp).getTime() / 1000;
    return t >= sinceTs && t <= untilTs;
  });

  const likes = inWindow.reduce((sum, m) => sum + (m.like_count || 0), 0);
  const comments = inWindow.reduce((sum, m) => sum + (m.comments_count || 0), 0);

  return { postCount: inWindow.length, likes, engagements: likes + comments };
}

// Ad insights split by placement. platform: "facebook" | "instagram"
export async function fetchAdStats({ platform, since, until }) {
  const adAccountId = requireEnv("META_AD_ACCOUNT_ID");

  const data = await graphGet(`act_${adAccountId}/insights`, {
    fields: "impressions,reach,spend,cpc",
    breakdowns: "publisher_platform",
    time_range: JSON.stringify({ since, until }),
  });

  const row = (data.data || []).find((r) => r.publisher_platform === platform);
  if (!row) return { views: 0, reach: 0, spend: 0, cpc: 0 };

  return {
    views: Number(row.impressions || 0),
    reach: Number(row.reach || 0),
    spend: Number(row.spend || 0),
    cpc: Number(row.cpc || 0),
  };
}
