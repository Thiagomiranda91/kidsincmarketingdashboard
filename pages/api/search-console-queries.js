import { fetchTopSearchQueries } from "../../lib/searchConsoleClient";

export default async function handler(req, res) {
  try {
    const rows = await fetchTopSearchQueries({ rowLimit: 10 });
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
