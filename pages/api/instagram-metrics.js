import { getRangeFromQuery } from "../../lib/dateRange";
import {
  fetchInstagramFollowers,
  fetchInstagramMediaStats,
  fetchAdStats,
} from "../../lib/metaClient";

export default async function handler(req, res) {
  try {
    const igUserId = process.env.META_IG_USER_ID;
    if (!igUserId) throw new Error("META_IG_USER_ID is not set");

    const { startDate, endDate } = getRangeFromQuery(req.query);

    const [totalFollowers, mediaStats, adStats] = await Promise.all([
      fetchInstagramFollowers({ igUserId }),
      fetchInstagramMediaStats({ igUserId, since: startDate, until: endDate }),
      fetchAdStats({ platform: "instagram", since: startDate, until: endDate }),
    ]);

    res.status(200).json({
      totalFollowers,
      posts: mediaStats.postCount,
      likes: mediaStats.likes,
      engagements: mediaStats.engagements,
      adViews: adStats.views,
      adReach: adStats.reach,
      adSpend: adStats.spend,
      adCPC: adStats.cpc,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
