import * as cheerio from "cheerio";
import type { NewListing } from "../db/schema";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Rightmove location identifiers for target postcodes
const LOCATION_IDS: Record<string, string> = {
  W2: "OUTCODE^2362",
  W9: "OUTCODE^2369",
  W10: "OUTCODE^2350",
  W11: "OUTCODE^2351",
  W1: "OUTCODE^2361",
  NW1: "OUTCODE^1819",
  NW6: "OUTCODE^1824",
  NW8: "OUTCODE^1826",
  SW1: "OUTCODE^2171",
  SW7: "OUTCODE^2177",
  EC1: "OUTCODE^433",
  WC1: "OUTCODE^2439",
  WC2: "OUTCODE^2440",
  E1: "OUTCODE^399",
  E14: "OUTCODE^412",
  SE1: "OUTCODE^1945",
  N1: "OUTCODE^1613",
};

export interface RawListing {
  sourceId: string;
  url: string;
  title: string;
  address: string;
  postcode: string;
  pricePerMonth: number;
  bedrooms: number;
  description: string;
  imageUrls: string[];
}

/**
 * Build Rightmove search URL
 */
function buildSearchUrl(locationId: string): string {
  const params = new URLSearchParams({
    locationIdentifier: locationId,
    maxBedrooms: "1",
    minBedrooms: "1",
    maxPrice: "2200",
    propertyTypes: "flat",
    primaryDisplayPropertyType: "flats",
    includeLetAgreed: "false",
    mustHave: "",
    dontShow: "",
    furnishTypes: "",
    keywords: "",
  });
  return `https://www.rightmove.co.uk/property-to-rent/find.html?${params}`;
}

/**
 * Try to parse listings from the JSON embedded in the page
 */
function parseFromJson(html: string, postcode: string): RawListing[] {
  const listings: RawListing[] = [];

  // Try multiple JSON patterns
  const patterns = [
    /window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});\s*<\/script/,
    /window\.jsonModel\s*=\s*({[\s\S]*?});\s*<\/script/,
    /"properties"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;

    try {
      const data = JSON.parse(match[1]);

      // Navigate different possible structures
      const properties =
        data?.searchResult?.properties ||
        data?.results?.properties ||
        data?.properties ||
        (Array.isArray(data) ? data : []);

      for (const prop of properties) {
        if (!prop.id) continue;

        const price = prop.price?.amount
          || prop.price?.displayPrices?.[0]?.displayPrice
          || prop.monthlyRent
          || 0;
        const numericPrice = typeof price === "number"
          ? price
          : parseInt(String(price).replace(/[^0-9]/g, "") || "0");

        if (numericPrice <= 0) continue;

        listings.push({
          sourceId: String(prop.id),
          url: `https://www.rightmove.co.uk/properties/${prop.id}`,
          title: prop.displayAddress || prop.propertyTitle || prop.address?.displayAddress || "",
          address: prop.displayAddress || prop.address?.displayAddress || "",
          postcode: extractPostcode(prop.displayAddress || "") || postcode,
          pricePerMonth: numericPrice > 10000 ? Math.round(numericPrice / 12) : numericPrice,
          bedrooms: prop.bedrooms || 1,
          description: prop.summary || prop.description || prop.propertyTypeFullDescription || "",
          imageUrls: (prop.propertyImages?.images || prop.images || [])
            .slice(0, 5)
            .map((img: any) => img.srcUrl || img.url || img.src || "")
            .filter(Boolean),
        });
      }

      if (listings.length > 0) {
        console.log(`    [JSON] Found ${listings.length} listings from JSON data`);
        return listings;
      }
    } catch {
      // Try next pattern
    }
  }

  return listings;
}

/**
 * Parse listings from HTML property cards (fallback)
 */
function parseFromHtml($: cheerio.CheerioAPI, postcode: string): RawListing[] {
  const listings: RawListing[] = [];

  // Try multiple possible selectors
  const selectors = [
    ".l-searchResult",
    ".propertyCard",
    "[data-testid='propertyCard']",
    ".property-card",
    ".search-result",
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const $el = $(el);
      const id = $el.attr("id")?.replace("property-", "")
        || $el.attr("data-propertyid")
        || $el.find("a[href*='/properties/']").attr("href")?.match(/\/properties\/(\d+)/)?.[1]
        || "";
      if (!id) return;

      const title = $el.find(".propertyCard-address, .property-address, .address, h2 a").first().text().trim();
      const priceText = $el.find(".propertyCard-priceValue, .property-price, .price, [data-testid='price']").first().text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");
      const desc = $el.find(".propertyCard-description, .property-description, .description").first().text().trim();
      const imgSrc = $el.find("img").first().attr("src")
        || $el.find("img").first().attr("data-src")
        || "";

      if (price > 0) {
        listings.push({
          sourceId: id,
          url: `https://www.rightmove.co.uk/properties/${id}`,
          title,
          address: title,
          postcode: extractPostcode(title) || postcode,
          pricePerMonth: price > 10000 ? Math.round(price / 12) : price,
          bedrooms: 1,
          description: desc,
          imageUrls: imgSrc ? [imgSrc] : [],
        });
      }
    });

    if (listings.length > 0) {
      console.log(`    [HTML] Found ${listings.length} listings with selector "${selector}"`);
      return listings;
    }
  }

  return listings;
}

/**
 * Scrape Rightmove for a single postcode area
 */
async function scrapePostcode(postcode: string): Promise<RawListing[]> {
  const locationId = LOCATION_IDS[postcode];
  if (!locationId) return [];

  try {
    const url = buildSearchUrl(locationId);
    console.log(`    Fetching: ${url}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });

    console.log(`    Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.warn(`    Rightmove returned ${res.status} for ${postcode}`);
      return [];
    }

    const html = await res.text();
    console.log(`    HTML length: ${html.length} chars`);

    // Check for bot detection
    if (html.includes("captcha") || html.includes("blocked") || html.includes("Access Denied")) {
      console.warn(`    Rightmove bot detection triggered for ${postcode}`);
      // Log first 500 chars for debugging
      console.log(`    HTML preview: ${html.substring(0, 500)}`);
      return [];
    }

    // Try JSON first
    const jsonListings = parseFromJson(html, postcode);
    if (jsonListings.length > 0) return jsonListings;

    // Try HTML parsing
    const $ = cheerio.load(html);
    const htmlListings = parseFromHtml($, postcode);
    if (htmlListings.length > 0) return htmlListings;

    // Debug: log what elements we can find
    console.log(`    No listings found. Page title: ${$("title").text()}`);
    console.log(`    Body class: ${$("body").attr("class") || "none"}`);
    console.log(`    Script tags: ${$("script").length}`);
    console.log(`    Links with /properties/: ${$('a[href*="/properties/"]').length}`);

    // Last resort: try to find any links to property pages
    const propertyLinks: RawListing[] = [];
    $('a[href*="/properties/"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const idMatch = href.match(/\/properties\/(\d+)/);
      if (!idMatch) return;

      const id = idMatch[1];
      // Avoid duplicates
      if (propertyLinks.some((l) => l.sourceId === id)) return;

      const parent = $(el).closest("[class*='card'], [class*='result'], [class*='property'], div").first();
      const title = parent.find("address, h2, h3, [class*='address']").first().text().trim()
        || $(el).text().trim();

      propertyLinks.push({
        sourceId: id,
        url: `https://www.rightmove.co.uk/properties/${id}`,
        title: title || `Property ${id}`,
        address: title,
        postcode,
        pricePerMonth: 0, // Will try to parse from detail page
        bedrooms: 1,
        description: "",
        imageUrls: [],
      });
    });

    if (propertyLinks.length > 0) {
      console.log(`    [LINKS] Found ${propertyLinks.length} property links`);
      // Filter out those without prices for now
      return propertyLinks.filter((l) => l.pricePerMonth > 0 || true); // Keep all for now
    }

    return [];
  } catch (err) {
    console.error(`Error scraping Rightmove for ${postcode}:`, err);
    return [];
  }
}

/**
 * Scrape all target postcodes from Rightmove
 */
export async function scrapeRightmove(postcodes: string[]): Promise<RawListing[]> {
  const allListings: RawListing[] = [];

  for (const pc of postcodes) {
    console.log(`  Scraping Rightmove: ${pc}...`);
    const listings = await scrapePostcode(pc);
    allListings.push(...listings);
    console.log(`    Found ${listings.length} listings`);

    // Random delay 2-5 seconds between postcodes
    await sleep(2000 + Math.random() * 3000);
  }

  return allListings;
}

/**
 * Extract postcode from an address string
 */
function extractPostcode(address: string): string {
  const match = address.match(/([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})/i);
  if (match) return match[1].toUpperCase();

  // Try outcode only
  const outcodeMatch = address.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?)\b/i);
  return outcodeMatch ? outcodeMatch[1].toUpperCase() : "";
}

export { extractPostcode };
