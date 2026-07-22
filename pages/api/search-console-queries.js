import { fetchTopSearchQueries } from "../../lib/searchConsoleClient";
import { getRangeFromQuery } from "../../lib/dateRange";

export default async function handler(req, res) {
  try {
    const { startDate, endDate } = getRangeFromQuery(req.query);
    const rows = await fetchTopSearchQueries({ startDate, endDate, rowLimit: 10 });
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
