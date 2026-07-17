import { useEffect, useState } from "react";
import SocialMetrics from "../components/SocialMetrics";
import { resolveRange } from "../lib/dateRange";
import { SAMPLE_SOCIAL_METRICS } from "../components/sampleData";

export default function Instagram() {
  const [range, setRange] = useState({ type: "preset", days: 30 });
  const [metrics, setMetrics] = useState(SAMPLE_SOCIAL_METRICS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { startDate, endDate } = resolveRange(range);
        const res = await fetch(`/api/instagram-metrics?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) return; // keep sample data
        const data = await res.json();
        setMetrics(data);
        setIsLive(true);
      } catch {
        // Meta credentials likely not configured yet — sample data stays on screen
      }
    }
    load();
  }, [range]);

  return (
    <SocialMetrics
      platformName="Instagram"
      brandColor="#C13584"
      metrics={metrics}
      isLive={isLive}
      range={range}
      onRangeChange={setRange}
    />
  );
}
