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
    <header className="h-14 border-b border-white/[0.06] bg-[#0c0c14]/95 backdrop-blur-xl flex items-center justify-between px-5 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3.5">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight text-white/95 leading-none">
              London Flat Finder
            </h1>
            <span className="text-[10px] text-white/35 leading-none mt-0.5">
              Paddington W2 &middot; 1 Bed Rentals
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh progress */}
        {refreshing && progress && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] text-blue-300/90 font-medium">{progress}</span>
          </div>
        )}

        {/* Last updated */}
        {!refreshing && lastRefresh?.completedAt && (
          <span className="text-[11px] text-white/30 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
            Updated {timeAgo(lastRefresh.completedAt)}
          </span>
        )}

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={triggerRefresh}
          disabled={refreshing}
          className="h-8 px-3 text-xs font-medium border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white/90 rounded-lg transition-all duration-300 hover:border-white/[0.15] hover:shadow-lg hover:shadow-white/[0.02] disabled:opacity-40"
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
    </header>
  );
}
