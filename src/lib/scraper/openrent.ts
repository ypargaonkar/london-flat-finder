import * as cheerio from "cheerio";
import type { RawListing } from "./rightmove";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Scrape OpenRent for a single postcode.
 * Uses JS arrays for data + HTML card titles/URL slugs to detect studios.
 * OpenRent lists studios as bedrooms=1 in JS arrays, but the HTML card
 * titles and URL slugs reliably say "Studio Flat".
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

    // Always parse HTML to get card titles and URL slugs for studio detection
    const $ = cheerio.load(html);

    // Build maps from HTML property cards: sourceId -> { href, title }
    const cardInfo = new Map<string, { href: string; title: string }>();
    $("a[href*='/property-to-rent/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const idMatch = href.match(/\/(\d+)$/);
      if (!idMatch) return;
      const id = idMatch[1];
      if (cardInfo.has(id)) return;

      // Get the card title from nearby elements
      const card = $(el).closest("div");
      const title = card.find("h2, h3, [class*='title'], [class*='Title']").first().text().trim()
        || $(el).text().trim();

      cardInfo.set(id, { href, title });
    });

    console.log(`    HTML cards found: ${cardInfo.size}`);

    // Parse JavaScript arrays embedded in the page
    const propertyIds = extractJsArray(html, "PROPERTYIDS");
    const prices = extractJsArray(html, "prices");
    const bedrooms = extractJsArray(html, "bedrooms");
    const lats = extractJsArray(html, "PROPERTYLISTLATITUDES");
    const lons = extractJsArray(html, "PROPERTYLISTLONGITUDES");
    const propertyTypes = extractJsArray(html, "propertyTypes"); // 1=House, 2=Flat, 3=Room

    console.log(`    Parsed arrays: ${propertyIds.length} IDs, ${prices.length} prices`);

    if (propertyIds.length === 0) {
      // Fallback: build listings from HTML cards only
      console.log(`    Fallback: using HTML cards...`);
      for (const [id, info] of cardInfo) {
        const card = $(`a[href$='/${id}']`).closest("div");
        const priceText = card.find("[class*='price'], [class*='Price']").text()
          || card.text().match(/£[\d,]+/)?.[0]
          || "";
        const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");
        const imgSrc = card.find("img").first().attr("src")
          || card.find("img").first().attr("data-src")
          || "";

        if (price > 0 && price <= 5000) {
          const titleLower = info.title.toLowerCase();
          const slugLower = info.href.toLowerCase();
          let listingType: "flat" | "studio" | "flatshare" = "flat";
          if (titleLower.includes("studio") || slugLower.includes("studio")) {
            listingType = "studio";
          } else if (titleLower.includes("room") || titleLower.includes("share") || slugLower.includes("shared") || slugLower.includes("room-in")) {
            listingType = "flatshare";
          }

          listings.push({
            sourceId: id,
            url: `https://www.openrent.co.uk${info.href}`,
            title: info.title || `${postcode} flat`,
            address: info.title,
            postcode,
            pricePerMonth: price > 10000 ? Math.round(price / 12) : price,
            bedrooms: listingType === "studio" ? 0 : 1,
            description: "",
            imageUrls: imgSrc ? [imgSrc.startsWith("//") ? `https:${imgSrc}` : imgSrc] : [],
            listingType,
          });
        }
      }
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

      // Primary classification from JS data
      let listingType: "flat" | "studio" | "flatshare" = "flat";
      if (propType === 3) {
        listingType = "flatshare";
      } else if (beds === 0) {
        listingType = "studio";
      }

      // Override with HTML card title / URL slug (more reliable for studios)
      const card = cardInfo.get(id);
      if (card) {
        const titleLower = card.title.toLowerCase();
        const slugLower = card.href.toLowerCase();
        if (titleLower.includes("studio") || slugLower.includes("studio-flat") || slugLower.includes("studio/")) {
          listingType = "studio";
        } else if (
          (titleLower.includes("room") && (titleLower.includes("share") || titleLower.includes("shared")))
          || slugLower.includes("room-in-a-shared") || slugLower.includes("shared-flat") || slugLower.includes("house-share")
        ) {
          listingType = "flatshare";
        }
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
        url: card ? `https://www.openrent.co.uk${card.href}` : `https://www.openrent.co.uk/property-to-rent/london/flat/${id}`,
        title,
        address: "",
        postcode,
        pricePerMonth: price,
        bedrooms: listingType === "studio" ? 0 : beds,
        description: "",
        imageUrls: [`https://imagescdn.openrent.co.uk/listings/${id}/listing_image_primary.jpg`],
        lat: lat || undefined,
        lon: lon || undefined,
        listingType,
      });

      // Limit to 30 listings per search to avoid timeout
      if (listings.length >= 30) break;
    }

    console.log(`    Found ${listings.length} listings (studios detected from HTML: ${listings.filter(l => l.listingType === "studio").length})`);
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
