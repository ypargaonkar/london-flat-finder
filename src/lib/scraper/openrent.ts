import * as cheerio from "cheerio";
import type { RawListing } from "./rightmove";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Scrape OpenRent for a single postcode.
 * OpenRent embeds property data as JavaScript arrays in the page:
 *   PROPERTYIDS, prices, bedrooms, bathrooms, furnished,
 *   PROPERTYLISTLATITUDES, PROPERTYLISTLONGITUDES, etc.
 */
async function scrapePostcode(postcode: string): Promise<RawListing[]> {
  const listings: RawListing[] = [];

  try {
    // OpenRent uses .co.uk (redirects from .com)
    const url = `https://www.openrent.co.uk/properties-to-rent/london-${postcode.toLowerCase()}?term=${encodeURIComponent(postcode)}&bedrooms_min=1&bedrooms_max=1&prices_max=2200&isLive=true`;

    console.log(`    Fetching: ${url}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      redirect: "follow",
    });

    console.log(`    Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.warn(`    OpenRent returned ${res.status} for ${postcode}`);
      return [];
    }

    const html = await res.text();
    console.log(`    HTML length: ${html.length} chars`);

    // Parse JavaScript arrays embedded in the page
    const propertyIds = extractJsArray(html, "PROPERTYIDS");
    const prices = extractJsArray(html, "prices");
    const bedrooms = extractJsArray(html, "bedrooms");
    const lats = extractJsArray(html, "PROPERTYLISTLATITUDES");
    const lons = extractJsArray(html, "PROPERTYLISTLONGITUDES");
    const furnished = extractJsArray(html, "furnished");

    console.log(`    Parsed arrays: ${propertyIds.length} IDs, ${prices.length} prices`);

    if (propertyIds.length === 0) {
      // Fallback: try HTML parsing
      const $ = cheerio.load(html);
      console.log(`    Page title: ${$("title").text()}`);
      console.log(`    Fallback: trying HTML selectors...`);

      // Try various selectors
      $("a[href*='/property-to-rent/']").each((_, el) => {
        const href = $(el).attr("href") || "";
        const idMatch = href.match(/\/property-to-rent\/(\d+)/);
        if (!idMatch) return;
        const id = idMatch[1];
        if (listings.some((l) => l.sourceId === id)) return;

        // Try to find price near this element
        const card = $(el).closest("div");
        const priceText = card.find("[class*='price'], [class*='Price']").text()
          || card.text().match(/£[\d,]+/)?.[0]
          || "";
        const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");

        const title = card.find("h2, h3, [class*='title'], [class*='Title']").first().text().trim()
          || $(el).text().trim();
        const imgSrc = card.find("img").first().attr("src")
          || card.find("img").first().attr("data-src")
          || "";

        if (price > 0 && price <= 5000) {
          listings.push({
            sourceId: id,
            url: `https://www.openrent.co.uk/property-to-rent/${id}`,
            title: title || `${postcode} flat`,
            address: title,
            postcode,
            pricePerMonth: price > 10000 ? Math.round(price / 12) : price,
            bedrooms: 1,
            description: "",
            imageUrls: imgSrc ? [imgSrc.startsWith("//") ? `https:${imgSrc}` : imgSrc] : [],
          });
        }
      });

      console.log(`    Fallback found ${listings.length} listings`);
      return listings;
    }

    // Build listings from parallel arrays
    for (let i = 0; i < propertyIds.length; i++) {
      const id = String(propertyIds[i]);
      const price = Number(prices[i]) || 0;
      const beds = Number(bedrooms[i]) || 1;
      const lat = Number(lats[i]) || 0;
      const lon = Number(lons[i]) || 0;

      // Only include 1-bed flats within budget
      if (beds !== 1 || price <= 0 || price > 2200) continue;

      listings.push({
        sourceId: id,
        url: `https://www.openrent.co.uk/property-to-rent/${id}`,
        title: `${postcode} - 1 Bed Flat`,
        address: "",
        postcode,
        pricePerMonth: price,
        bedrooms: 1,
        description: "",
        imageUrls: [`https://imagescdn.openrent.co.uk/listings/${id}/listing_image_primary.jpg`],
        lat: lat || undefined,
        lon: lon || undefined,
      });

      // Limit to 30 listings per postcode to avoid timeout
      if (listings.length >= 30) break;
    }

    // Try to get titles from page HTML
    if (listings.length > 0) {
      const $ = cheerio.load(html);

      // Try to find listing titles in the page
      for (const listing of listings) {
        const link = $(`a[href*="/property-to-rent/${listing.sourceId}"]`);
        if (link.length > 0) {
          const card = link.closest("div");
          const title = card.find("h2, h3, [class*='title']").first().text().trim();
          if (title) listing.title = title;

          const addr = card.find("[class*='address'], [class*='location']").first().text().trim();
          if (addr) {
            listing.address = addr;
            listing.title = addr;
          }
        }
      }
    }

    console.log(`    Found ${listings.length} valid listings from JS arrays`);
    return listings;
  } catch (err) {
    console.error(`Error scraping OpenRent for ${postcode}:`, err);
    return [];
  }
}

/**
 * Extract a JavaScript array from HTML source.
 * Looks for patterns like: var PROPERTYIDS = [1,2,3];
 * or: PROPERTYIDS = [1,2,3];
 */
function extractJsArray(html: string, varName: string): (string | number)[] {
  // Try various patterns
  const patterns = [
    new RegExp(`(?:var\\s+)?${varName}\\s*=\\s*\\[([^\\]]*?)\\]`, "s"),
    new RegExp(`"${varName}"\\s*:\\s*\\[([^\\]]*?)\\]`, "s"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      try {
        return JSON.parse(`[${match[1]}]`);
      } catch {
        // Try splitting by comma
        return match[1]
          .split(",")
          .map((s) => s.trim().replace(/['"]/g, ""))
          .filter(Boolean);
      }
    }
  }

  return [];
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

    // Random delay 1-3 seconds (OpenRent is less aggressive with blocking)
    await sleep(1000 + Math.random() * 2000);
  }

  return allListings;
}
