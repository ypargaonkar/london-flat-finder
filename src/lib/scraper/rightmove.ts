import * as cheerio from "cheerio";
import type { NewListing } from "../db/schema";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Build a Rightmove search URL for a given location identifier
 */
function buildSearchUrl(locationId: string, page = 0): string {
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
  if (page > 0) params.set("index", String(page * 24));
  return `https://www.rightmove.co.uk/property-to-rent/find.html?${params}`;
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
 * Scrape Rightmove for a single postcode area
 */
async function scrapePostcode(postcode: string): Promise<RawListing[]> {
  const locationId = LOCATION_IDS[postcode];
  if (!locationId) return [];

  const listings: RawListing[] = [];

  try {
    const url = buildSearchUrl(locationId);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      console.warn(`Rightmove returned ${res.status} for ${postcode}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Rightmove embeds listing data in a JSON script tag
    const scriptTags = $("script").toArray();
    for (const tag of scriptTags) {
      const content = $(tag).html() || "";
      if (content.includes("window.__PRELOADED_STATE__")) {
        try {
          const jsonStr = content
            .replace("window.__PRELOADED_STATE__ = ", "")
            .replace(/;$/, "");
          const data = JSON.parse(jsonStr);
          const properties = data?.searchResult?.properties || data?.results?.properties || [];

          for (const prop of properties) {
            if (!prop.id) continue;

            const listing: RawListing = {
              sourceId: String(prop.id),
              url: `https://www.rightmove.co.uk/properties/${prop.id}`,
              title: prop.displayAddress || prop.propertyTitle || "",
              address: prop.displayAddress || "",
              postcode: extractPostcode(prop.displayAddress || "") || postcode,
              pricePerMonth: prop.price?.amount || prop.price?.displayPrices?.[0]?.displayPrice
                ? parseInt(String(prop.price?.amount || "0").replace(/[^0-9]/g, ""))
                : 0,
              bedrooms: prop.bedrooms || 1,
              description: prop.summary || prop.description || "",
              imageUrls: (prop.propertyImages?.images || [])
                .slice(0, 5)
                .map((img: { srcUrl?: string; url?: string }) => img.srcUrl || img.url || ""),
            };

            if (listing.pricePerMonth > 0) {
              listings.push(listing);
            }
          }
        } catch {
          // Try fallback HTML parsing
        }
      }
    }

    // Fallback: parse HTML property cards if JSON approach failed
    if (listings.length === 0) {
      $(".l-searchResult").each((_, el) => {
        const $el = $(el);
        const id = $el.attr("id")?.replace("property-", "") || "";
        if (!id) return;

        const title = $el.find(".propertyCard-address").text().trim();
        const priceText = $el.find(".propertyCard-priceValue").text().trim();
        const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");
        const desc = $el.find(".propertyCard-description").text().trim();
        const imgSrc = $el.find(".propertyCard-img img").attr("src") || "";

        if (price > 0) {
          listings.push({
            sourceId: id,
            url: `https://www.rightmove.co.uk/properties/${id}`,
            title,
            address: title,
            postcode: extractPostcode(title) || postcode,
            pricePerMonth: price > 10000 ? Math.round(price / 12) : price, // Handle annual prices
            bedrooms: 1,
            description: desc,
            imageUrls: imgSrc ? [imgSrc] : [],
          });
        }
      });
    }
  } catch (err) {
    console.error(`Error scraping Rightmove for ${postcode}:`, err);
  }

  return listings;
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
