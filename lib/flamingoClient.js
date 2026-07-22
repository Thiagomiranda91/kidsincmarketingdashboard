// Talks to the small companion plugin in /wordpress/flamingo-api-bridge.php,
// installed on the WordPress site. Flamingo itself has no REST API or public
// data feed — this bridge is what makes the data reachable at all.
export async function fetchFlamingoMessages({ limit = 20 } = {}) {
  const baseUrl = process.env.FLAMINGO_API_URL; // e.g. https://yoursite.com/wp-json/flamingo-bridge/v1/messages
  const apiKey = process.env.FLAMINGO_API_KEY;

  if (!baseUrl) throw new Error("FLAMINGO_API_URL is not set");
  if (!apiKey) throw new Error("FLAMINGO_API_KEY is not set");

  const url = new URL(baseUrl);
  url.searchParams.set("limit", limit);

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": apiKey },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
