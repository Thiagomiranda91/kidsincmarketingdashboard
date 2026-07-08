import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import {
  SAMPLE_VISITORS,
  SAMPLE_NEW_RETURNING,
  SAMPLE_TOP_PAGES,
  SAMPLE_SEARCH_QUERIES,
  SAMPLE_CHANNELS,
} from "../components/sampleData";

async function safeJson(res) {
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) && data.length ? data : null;
}

export default function Home() {
  const [visitors, setVisitors] = useState(SAMPLE_VISITORS);
  const [newReturning, setNewReturning] = useState(SAMPLE_NEW_RETURNING);
  const [topPages, setTopPages] = useState(SAMPLE_TOP_PAGES);
  const [searchQueries, setSearchQueries] = useState(SAMPLE_SEARCH_QUERIES);
  const [channels, setChannels] = useState(SAMPLE_CHANNELS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [v, nr, tp, sq, ch] = await Promise.all([
          fetch("/api/ga4-visitors").then(safeJson).catch(() => null),
          fetch("/api/ga4-new-returning").then(safeJson).catch(() => null),
          fetch("/api/ga4-top-pages").then(safeJson).catch(() => null),
          fetch("/api/search-console-queries").then(safeJson).catch(() => null),
          fetch("/api/ga4-channels").then(safeJson).catch(() => null),
        ]);

        // GA4-backed metrics: go live together once GA4 is configured
        if (v && nr && tp && ch) {
          setVisitors(v);
          setNewReturning(nr);
          setTopPages(tp);
          setChannels(ch);
          setIsLive(true);
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
  }, []);

  return (
    <Dashboard
      visitors={visitors}
      newReturning={newReturning}
      topPages={topPages}
      searchQueries={searchQueries}
      channels={channels}
      isLive={isLive}
    />
  );
}
