import { getRangeFromQuery } from "../../lib/dateRange";

import {
  fetchFacebookFollowers,
  fetchFacebookPosts,
  fetchAdStats,
} from "../../lib/metaClient";

export default async function handler(req, res) {
  try {
    const pageId = process.env.META_PAGE_ID;

    if (!pageId) {
      throw new Error("META_PAGE_ID is not set");
    }

    const { startDate, endDate } = getRangeFromQuery(req.query);

    const [
  totalFollowers,
  postStats,
  adStats,
] = await Promise.all([
      fetchFacebookFollowers({ pageId }),
      fetchFacebookPosts({
        pageId,
        since: startDate,
        until: endDate,
      }),
      fetchAdStats({
        platform: "facebook",
        since: startDate,
        until: endDate,
      }),
    ]);

    res.status(200).json({
  totalFollowers,
  posts: postStats.postCount,
  likes: postStats.likes,
  engagements: postStats.engagements,
  adViews: adStats.views,
  adReach: adStats.reach,
  adSpend: adStats.spend,
  adCPC: adStats.cpc,
});

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}
