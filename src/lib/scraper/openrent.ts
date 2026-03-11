import * as cheerio from "cheerio";
import type { RawListing } from "./rightmove";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Scrape OpenRent for a single postcode.
 * Uses `isstudio` and `isshared` JS arrays for reliable classification.
 */
async function scrapeSearchUrl(
  url: string,
  postcode: string,
): Promise<RawListing[]> {
  const listings: RawListing[] = [];

  try {
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

    // Parse all JavaScript arrays embedded in the page
    const propertyIds = extractJsArray(html, "PROPERTYIDS");
    const prices = extractJsArray(html, "prices");
    const bedrooms = extractJsArray(html, "bedrooms");
    const lats = extractJsArray(html, "PROPERTYLISTLATITUDES");
    const lons = extractJsArray(html, "PROPERTYLISTLONGITUDES");
    const propertyTypes = extractJsArray(html, "propertyTypes"); // 1=House, 2=Flat, 3=Room
    const isStudio = extractJsArray(html, "isstudio");           // 0 or 1
    const isShared = extractJsArray(html, "isshared");           // 0 or 1

    console.log(`    Parsed: ${propertyIds.length} IDs, isstudio: ${isStudio.length}, isshared: ${isShared.length}`);

    if (propertyIds.length === 0) {
      // Fallback: try HTML parsing
      const $ = cheerio.load(html);
      console.log(`    Fallback: trying HTML selectors...`);

      $("a[href*='/property-to-rent/']").each((_, el) => {
        const href = $(el).attr("href") || "";
        const idMatch = href.match(/\/property-to-rent\/(\d+)/);
        if (!idMatch) return;
        const id = idMatch[1];
        if (listings.some((l) => l.sourceId === id)) return;

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
          const slugLower = href.toLowerCase();
          const titleLower = title.toLowerCase();
          let listingType: "flat" | "studio" | "flatshare" = "flat";
          if (titleLower.includes("studio") || slugLower.includes("studio")) {
            listingType = "studio";
          } else if (titleLower.includes("room") || titleLower.includes("share") || slugLower.includes("shared")) {
            listingType = "flatshare";
          }

          listings.push({
            sourceId: id,
            url: `https://www.openrent.co.uk${href}`,
            title: title || `${postcode} flat`,
            address: title,
            postcode,
            pricePerMonth: price > 10000 ? Math.round(price / 12) : price,
            bedrooms: listingType === "studio" ? 0 : 1,
            description: "",
            imageUrls: imgSrc ? [imgSrc.startsWith("//") ? `https:${imgSrc}` : imgSrc] : [],
            listingType,
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
      const propType = Number(propertyTypes[i]) || 2;
      const studio = Number(isStudio[i]) === 1;
      const shared = Number(isShared[i]) === 1;

      // Classify using the dedicated boolean flags
      let listingType: "flat" | "studio" | "flatshare" = "flat";
      if (studio) {
        listingType = "studio";
      } else if (shared || propType === 3) {
        listingType = "flatshare";
      }

      // Build descriptive title
      let title: string;
      if (listingType === "flatshare") {
        title = `${postcode} - Room in Shared Flat`;
      } else if (listingType === "studio") {
        title = `${postcode} - Studio`;
      } else {
        title = `${postcode} - ${beds} Bed Flat`;
      }

      // Filter: include studios, 1-beds, and flat shares within budget
      if (listingType === "flat" && beds !== 1) continue;
      if (price <= 0 || price > 2200) continue;

      listings.push({
        sourceId: id,
        url: `https://www.openrent.co.uk/property-to-rent/london/flat/${id}`,
        title,
        address: "",
        postcode,
        pricePerMonth: price,
        bedrooms: studio ? 0 : beds,
        description: "",
        imageUrls: [`https://imagescdn.openrent.co.uk/listings/${id}/listing_image_primary.jpg`],
        lat: lat || undefined,
        lon: lon || undefined,
        listingType,
      });

      // Limit to 30 listings per postcode to avoid timeout
      if (listings.length >= 30) break;
    }

    const studioCount = listings.filter(l => l.listingType === "studio").length;
    const shareCount = listings.filter(l => l.listingType === "flatshare").length;
    console.log(`    Found ${listings.length} listings (${studioCount} studios, ${shareCount} shares)`);
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
 * Scrape a single postcode (0-1 bed search, studios detected from HTML).
 */
async function scrapePostcode(postcode: string): Promise<RawListing[]> {
  const pc = postcode.toLowerCase();
  const url = `https://www.openrent.co.uk/properties-to-rent/london-${pc}?term=${encodeURIComponent(postcode)}&bedrooms_min=0&bedrooms_max=1&prices_max=2200&isLive=true`;
  return scrapeSearchUrl(url, postcode);
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

    // Random delay 1-3 seconds
    await sleep(1000 + Math.random() * 2000);
  }

  return allListings;
}
