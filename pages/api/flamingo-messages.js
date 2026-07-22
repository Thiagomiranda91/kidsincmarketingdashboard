import { fetchFlamingoMessages } from "../../lib/flamingoClient";

export default async function handler(req, res) {
  try {
    const limit = Number(req.query.limit) || 20;
    const messages = await fetchFlamingoMessages({ limit });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
