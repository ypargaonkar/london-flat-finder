"use client";

import { useState, useEffect, useCallback } from "react";

const TARGET_POSTCODES = [
  // Central & West
  "W2", "W9", "W10", "W11", "W1",
  "W3", "W5", "W13",
  "NW1", "NW6", "NW8", "NW10",
  "SW1", "SW7",
  "EC1", "WC1", "WC2",
  // East London
  "E1", "E3", "E8", "E9", "E14", "E15", "E20",
  // South & North
  "SE1", "N1",
  // Outer West
  "HA0", "HA9",
];

interface RefreshStatus {
  lastRefresh: {
    id: number;
    startedAt: string;
    completedAt: string | null;
    status: string;
    listingsFound: number | null;
    newListings: number | null;
  } | null;
}

export function useRefreshStatus() {
  const [status, setStatus] = useState<RefreshStatus>({ lastRefresh: null });
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/cron/refresh");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const triggerRefresh = useCallback(async () => {
    setRefreshing(true);
    let totalFound = 0;
    let totalNew = 0;
    let logId: number | null = null;

    try {
      // Create refresh log entry before starting
      const logRes = await fetch("/api/cron/refresh-log", { method: "POST" });
      if (logRes.ok) {
        const logData = await logRes.json();
        logId = logData.logId;
      }

      const sources = ["openrent"];
      const total = TARGET_POSTCODES.length * sources.length;
      let done = 0;

      for (const source of sources) {
        for (const pc of TARGET_POSTCODES) {
          done++;
          setProgress(`${source} ${pc} (${done}/${total})`);

          try {
            const res = await fetch(
              `/api/cron/refresh?postcode=${pc}&source=${source}`,
              { method: "POST" }
            );
            if (res.ok) {
              const data = await res.json();
              totalFound += data.found || 0;
              totalNew += data.new || 0;
            }
          } catch {
            // Continue with next
          }
        }
      }

      // Complete refresh log + run stale deactivation
      if (logId) {
        await fetch("/api/cron/refresh-log", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logId,
            listingsFound: totalFound,
            newListings: totalNew,
          }),
        });
      }

      setProgress(`Done! ${totalFound} found, ${totalNew} new`);
      await fetchStatus();
    } catch (err) {
      console.error("Refresh failed:", err);
      setProgress("Failed");
    } finally {
      setRefreshing(false);
      setTimeout(() => setProgress(""), 5000);
    }
  }, [fetchStatus]);

  return { ...status, refreshing, progress, triggerRefresh, refetchStatus: fetchStatus };
}
