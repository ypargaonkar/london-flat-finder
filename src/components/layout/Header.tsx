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
  const { lastRefresh, refreshing, progress, triggerRefresh } = useRefreshStatus();

  return (
    <header className="h-14 border-b border-white/[0.06] bg-gradient-to-r from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] flex items-center justify-between px-5 shrink-0 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-base font-semibold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            London Flat Finder
          </h1>
        </div>
        <span className="text-[11px] text-white/40 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full">
          Paddington W2
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {refreshing && progress && (
          <span className="text-xs text-white/50 font-mono">{progress}</span>
        )}
        {!refreshing && lastRefresh?.completedAt && (
          <span className="text-xs text-white/40">
            Updated {timeAgo(lastRefresh.completedAt)}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={triggerRefresh}
          disabled={refreshing}
          className="h-7 text-xs border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all"
        >
          {refreshing ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scraping...
            </span>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>
    </header>
  );
}
