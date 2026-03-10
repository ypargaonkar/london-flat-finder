"use client";

import { useState, useEffect, useCallback } from "react";

const TARGET_POSTCODES = [
  "W2", "W9", "W10", "W11", "W1",
  "NW1", "NW6", "NW8",
  "SW1", "SW7",
  "EC1", "WC1", "WC2",
  "E1", "E14",
  "SE1", "N1",
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

    try {
      const sources = ["openrent"]; // rightmove location IDs are broken
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
