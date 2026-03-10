"use client";

import { useState, useEffect, useCallback } from "react";

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
    try {
      const res = await fetch("/api/cron/refresh", { method: "POST" });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchStatus]);

  return { ...status, refreshing, triggerRefresh, refetchStatus: fetchStatus };
}
