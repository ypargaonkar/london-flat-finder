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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0a0a12]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a12]/80">
      <div className="h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-bold tracking-tight">
            <span className="text-white">London Flat</span>
            <span className="text-blue-400"> Finder</span>
          </span>
          <span className="text-[10px] text-white/25 font-medium border-l border-white/10 pl-3 hidden sm:inline">
            Paddington W2 &middot; 1 Bed Rentals
          </span>
        </div>

        <div className="flex items-center gap-3">
          {refreshing && progress && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] text-blue-300/90 font-medium">{progress}</span>
            </div>
          )}

          {!refreshing && lastRefresh?.completedAt && (
            <span className="text-[11px] text-white/30 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
              Updated {timeAgo(lastRefresh.completedAt)}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={triggerRefresh}
            disabled={refreshing}
            className="h-8 px-3 text-xs font-medium border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white/90 rounded-lg transition-all duration-300 hover:border-white/[0.15] disabled:opacity-40"
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
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23,4 23,10 17,10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
                Refresh
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
