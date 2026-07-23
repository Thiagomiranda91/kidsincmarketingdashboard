import { useEffect, useState } from "react";
import SocialMetrics from "../components/SocialMetrics";
import { resolveRange } from "../lib/dateRange";
import { SAMPLE_SOCIAL_METRICS } from "../components/sampleData";

export default function Instagram() {
  const [range, setRange] = useState({ type: "preset", days: 30 });
  const [metrics, setMetrics] = useState(SAMPLE_SOCIAL_METRICS);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { startDate, endDate } = resolveRange(range);
        const res = await fetch(`/api/instagram-metrics?startDate=${startDate}&endDate=${endDate}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || `Request failed (${res.status})`);
          return; // keep sample data
        }
        setMetrics(data);
        setIsLive(true);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong fetching Instagram data.");
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
      error={error}
      range={range}
      onRangeChange={setRange}
    />
  );
}
