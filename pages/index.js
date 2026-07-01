import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import { SAMPLE_TREND, SAMPLE_CHANNELS } from "../components/sampleData";

export default function Home() {
  const [trend, setTrend] = useState(SAMPLE_TREND);
  const [channels, setChannels] = useState(SAMPLE_CHANNELS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [trendRes, channelsRes] = await Promise.all([
          fetch("/api/ga4-trend"),
          fetch("/api/ga4-channels"),
        ]);

        if (!trendRes.ok || !channelsRes.ok) return; // keep sample data

        const trendData = await trendRes.json();
        const channelsData = await channelsRes.json();

        if (trendData.length && channelsData.length) {
          setTrend(trendData);
          setChannels(channelsData);
          setIsLive(true);
        }
      } catch {
        // env vars likely not configured yet — sample data stays on screen
      }
    }
    load();
  }, []);

  return <Dashboard trend={trend} channels={channels} isLive={isLive} />;
}
