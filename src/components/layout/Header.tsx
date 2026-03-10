"use client";

import { Button } from "@/components/ui/button";
import { useRefreshStatus } from "@/hooks/useRefreshStatus";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Header() {
  const { lastRefresh, refreshing, triggerRefresh } = useRefreshStatus();

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">London Flat Finder</h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Paddington / W2
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {lastRefresh && (
          <span className="text-muted-foreground">
            Last refresh:{" "}
            <span className="font-medium">
              {lastRefresh.completedAt
                ? timeAgo(lastRefresh.completedAt)
                : lastRefresh.status === "running"
                ? "running..."
                : "unknown"}
            </span>
            {lastRefresh.newListings != null && lastRefresh.newListings > 0 && (
              <span className="ml-1 text-green-600">
                (+{lastRefresh.newListings} new)
              </span>
            )}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={triggerRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </header>
  );
}
