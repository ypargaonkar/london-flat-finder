export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");

    cron.default.schedule("0 */6 * * *", async () => {
      console.log("[CRON] Starting scheduled scraping pipeline...");
      try {
        const { runScrapingPipeline } = await import("@/lib/scraper/pipeline");
        const { createRefreshLog, completeRefreshLog } = await import("@/lib/db/queries");

        const log = await createRefreshLog();
        const result = await runScrapingPipeline();

        await completeRefreshLog(log.id, {
          status: "completed",
          listingsFound: result.listingsFound,
          newListings: result.newListings,
          errors: result.errors.length > 0 ? result.errors.join("\n") : undefined,
        });

        console.log(
          `[CRON] Pipeline complete: ${result.listingsFound} found, ${result.newListings} new`
        );
      } catch (err) {
        console.error("[CRON] Pipeline failed:", err);
      }
    });

    console.log("[CRON] Scheduled scraping pipeline (every 6 hours)");
  }
}
