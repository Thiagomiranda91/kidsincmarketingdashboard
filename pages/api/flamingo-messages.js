import { fetchFlamingoMessages } from "../../lib/flamingoClient";
import { getRangeFromQuery } from "../../lib/dateRange";

export default async function handler(req, res) {
  try {
    const { startDate, endDate } = getRangeFromQuery(req.query);
    const messages = await fetchFlamingoMessages({ startDate, endDate });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
