/**
 * Run the listing scraping pipeline
 *
 * Usage: npx tsx scripts/scrape-listings.ts
 */
import "dotenv/config";
import { runScrapingPipeline } from "../src/lib/scraper/pipeline";

async function main() {
  console.log("=== London Flat Finder — Scraping Pipeline ===\n");
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const result = await runScrapingPipeline();

  console.log("\n=== Results ===");
  console.log(`Listings found: ${result.listingsFound}`);
  console.log(`New listings: ${result.newListings}`);
  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

  console.log(`\nCompleted at: ${new Date().toISOString()}`);
}

main().catch(console.error);
