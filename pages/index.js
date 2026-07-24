import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import { resolveRange } from "../lib/dateRange";
import {
  SAMPLE_VISITORS,
  SAMPLE_NEW_RETURNING,
  SAMPLE_TOP_PAGES,
  SAMPLE_SEARCH_QUERIES,
  SAMPLE_CHANNELS,
  SAMPLE_KEY_EVENTS,
} from "../components/sampleData";

// Only null on a failed/error response — an empty array is a valid,
// successful "no data in this window" result and should NOT fall back
// to sample data.
async function safeJson(res) {
  if (!res.ok) return null;
  return res.json();
}

export default function Home() {
  const [range, setRange] = useState({ type: "preset", days: 30 });
  const [visitors, setVisitors] = useState(SAMPLE_VISITORS);
  const [newReturning, setNewReturning] = useState(SAMPLE_NEW_RETURNING);
  const [topPages, setTopPages] = useState(SAMPLE_TOP_PAGES);
  const [searchQueries, setSearchQueries] = useState(SAMPLE_SEARCH_QUERIES);
  const [channels, setChannels] = useState(SAMPLE_CHANNELS);
  const [keyEvents, setKeyEvents] = useState(SAMPLE_KEY_EVENTS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { startDate, endDate } = resolveRange(range);
        const qs = `?startDate=${startDate}&endDate=${endDate}`;

        const [v, nr, tp, sq, ch, keRes] = await Promise.all([
          fetch("/api/ga4-visitors").then(safeJson).catch(() => null),
          fetch(`/api/ga4-new-returning${qs}`).then(safeJson).catch(() => null),
          fetch(`/api/ga4-top-pages${qs}`).then(safeJson).catch(() => null),
          fetch(`/api/search-console-queries${qs}`).then(safeJson).catch(() => null),
          fetch(`/api/ga4-channels${qs}`).then(safeJson).catch(() => null),
          fetch(`/api/ga4-key-events${qs}`).then(safeJson).catch(() => null),
        ]);

        // GA4-backed metrics: go live together once GA4 is configured
        if (v && nr && tp && ch) {
          setVisitors(v);
          setNewReturning(nr);
          setTopPages(tp);
          setChannels(ch);
          setIsLive(true);
        }

        if (keRes && typeof keRes.total === "number") {
          setKeyEvents(keRes);
        }

        // Search Console is a separate credential — swap in independently
        if (sq) {
          setSearchQueries(sq);
        }
      } catch {
        // env vars likely not configured yet — sample data stays on screen
      }
    }
    load();
  }, [range]);

  return (
    <Dashboard
      visitors={visitors}
      newReturning={newReturning}
      topPages={topPages}
      searchQueries={searchQueries}
      channels={channels}
      keyEvents={keyEvents}
      isLive={isLive}
      range={range}
      onRangeChange={setRange}
    />
  );
}
