import { getRangeFromQuery } from "../../lib/dateRange";
import { fetchTotalFollowers, fetchFacebookPostStats, fetchAdStats } from "../../lib/metaClient";

export default async function handler(req, res) {
  try {
    const pageId = process.env.META_PAGE_ID;
    if (!pageId) throw new Error("META_PAGE_ID is not set");

    const { startDate, endDate } = getRangeFromQuery(req.query);

    console.log("Fetching total followers...");
const totalFollowers = await fetchTotalFollowers({ objectId: pageId });
console.log("✓ Total followers OK");

console.log("Fetching Facebook post stats...");
const postStats = await fetchFacebookPostStats({
  pageId,
  since: startDate,
  until: endDate,
});
console.log("✓ Facebook posts OK");

console.log("Fetching Facebook ad stats...");
const adStats = await fetchAdStats({
  platform: "facebook",
  since: startDate,
  until: endDate,
});
console.log("✓ Facebook ads OK");

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
    res.status(500).json({ error: err.message });
  }
}
