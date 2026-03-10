import * as cheerio from "cheerio";
import type { RawListing } from "./rightmove";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Build OpenRent search URL
 */
function buildSearchUrl(postcode: string): string {
  return `https://www.openrent.com/properties-to-rent/${postcode.toLowerCase()}?term=${encodeURIComponent(postcode)}&bedrooms_min=1&bedrooms_max=1&prices_max=2200&isLive=true`;
}

/**
 * Scrape OpenRent for a single postcode
 */
async function scrapePostcode(postcode: string): Promise<RawListing[]> {
  const listings: RawListing[] = [];

  try {
    const url = buildSearchUrl(postcode);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      console.warn(`OpenRent returned ${res.status} for ${postcode}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // OpenRent uses property cards with data attributes
    $(".pli, .property-listing").each((_, el) => {
      const $el = $(el);
      const id =
        $el.attr("data-id") ||
        $el.find("a").attr("href")?.match(/\/(\d+)/)?.[1] ||
        "";
      if (!id) return;

      const title =
        $el.find(".pli__title, .listing-title, h2").first().text().trim() ||
        $el.find("a").first().text().trim();
      const priceText =
        $el.find(".pli__price, .listing-price, .price").first().text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");
      const desc = $el.find(".pli__description, .listing-desc").text().trim();
      const imgSrc =
        $el.find("img").attr("src") || $el.find("img").attr("data-src") || "";

      if (price > 0 && price <= 5000) {
        listings.push({
          sourceId: String(id),
          url: `https://www.openrent.com/property-to-rent/${id}`,
          title: title || `${postcode} flat`,
          address: title,
          postcode,
          pricePerMonth: price > 10000 ? Math.round(price / 12) : price,
          bedrooms: 1,
          description: desc,
          imageUrls: imgSrc ? [imgSrc] : [],
        });
      }
    });
  } catch (err) {
    console.error(`Error scraping OpenRent for ${postcode}:`, err);
  }

  return listings;
}

/**
 * Scrape all target postcodes from OpenRent
 */
export async function scrapeOpenRent(postcodes: string[]): Promise<RawListing[]> {
  const allListings: RawListing[] = [];

  for (const pc of postcodes) {
    console.log(`  Scraping OpenRent: ${pc}...`);
    const listings = await scrapePostcode(pc);
    allListings.push(...listings);
    console.log(`    Found ${listings.length} listings`);

    // Random delay 2-5 seconds
    await sleep(2000 + Math.random() * 3000);
  }

  return allListings;
}
