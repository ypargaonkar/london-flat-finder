import * as cheerio from "cheerio";
import type { RawListing } from "./rightmove";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Scrape OpenRent for a single postcode
 */
async function scrapePostcode(postcode: string): Promise<RawListing[]> {
  const listings: RawListing[] = [];

  try {
    // OpenRent has a JSON API endpoint
    const apiUrl = `https://www.openrent.com/properties-to-rent?term=${encodeURIComponent(postcode)}&bedrooms_min=1&bedrooms_max=1&prices_max=2200&isLive=true`;

    console.log(`    Fetching: ${apiUrl}`);

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    console.log(`    Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.warn(`    OpenRent returned ${res.status} for ${postcode}`);
      return [];
    }

    const html = await res.text();
    console.log(`    HTML length: ${html.length} chars`);

    // Check for bot detection
    if (html.includes("captcha") || html.includes("Access Denied") || html.includes("blocked")) {
      console.warn(`    OpenRent bot detection triggered for ${postcode}`);
      console.log(`    HTML preview: ${html.substring(0, 500)}`);
      return [];
    }

    const $ = cheerio.load(html);

    // Try multiple selector patterns
    const selectorGroups = [
      { container: ".pli", title: ".pli__title", price: ".pli__price", desc: ".pli__description" },
      { container: ".property-listing", title: ".listing-title", price: ".listing-price", desc: ".listing-desc" },
      { container: "[data-listing]", title: "h2, h3, .title", price: ".price", desc: ".description" },
      { container: ".listing-card, .property-card, .result-card", title: "h2, h3, .title, .address", price: ".price, .rent", desc: ".description, .summary" },
    ];

    for (const { container, title: titleSel, price: priceSel, desc: descSel } of selectorGroups) {
      $(container).each((_, el) => {
        const $el = $(el);
        const id =
          $el.attr("data-id") ||
          $el.attr("data-listing-id") ||
          $el.find("a").attr("href")?.match(/\/(\d+)/)?.[1] ||
          "";
        if (!id) return;

        const title = $el.find(titleSel).first().text().trim()
          || $el.find("a").first().text().trim();
        const priceText = $el.find(priceSel).first().text().trim();
        const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");
        const desc = $el.find(descSel).text().trim();
        const imgSrc = $el.find("img").attr("src")
          || $el.find("img").attr("data-src")
          || "";

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

      if (listings.length > 0) {
        console.log(`    [HTML] Found ${listings.length} with selector "${container}"`);
        return listings;
      }
    }

    // Try JSON embedded in page
    $("script").each((_, el) => {
      const content = $(el).html() || "";
      if (content.includes("properties") || content.includes("listings")) {
        try {
          // Look for JSON arrays of properties
          const arrayMatch = content.match(/\[{"id":\d+.*?\}]/);
          if (arrayMatch) {
            const data = JSON.parse(arrayMatch[0]);
            for (const item of data) {
              if (!item.id) continue;
              listings.push({
                sourceId: String(item.id),
                url: `https://www.openrent.com/property-to-rent/${item.id}`,
                title: item.title || item.address || `${postcode} flat`,
                address: item.address || item.title || "",
                postcode,
                pricePerMonth: item.price || item.rent || 0,
                bedrooms: 1,
                description: item.description || "",
                imageUrls: item.image ? [item.image] : [],
              });
            }
          }
        } catch {
          // Not valid JSON
        }
      }
    });

    if (listings.length > 0) {
      console.log(`    [JSON] Found ${listings.length} from embedded JSON`);
      return listings;
    }

    // Debug info
    console.log(`    No listings found. Page title: ${$("title").text()}`);
    console.log(`    Links: ${$("a").length}, Property links: ${$('a[href*="property"]').length}`);

    // Last resort: find property links
    $('a[href*="/property-to-rent/"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const idMatch = href.match(/\/property-to-rent\/(\d+)/);
      if (!idMatch) return;
      const id = idMatch[1];
      if (listings.some((l) => l.sourceId === id)) return;

      listings.push({
        sourceId: id,
        url: `https://www.openrent.com${href}`,
        title: $(el).text().trim() || `${postcode} flat`,
        address: $(el).text().trim(),
        postcode,
        pricePerMonth: 0,
        bedrooms: 1,
        description: "",
        imageUrls: [],
      });
    });

    if (listings.length > 0) {
      console.log(`    [LINKS] Found ${listings.length} property links`);
    }

    return listings;
  } catch (err) {
    console.error(`Error scraping OpenRent for ${postcode}:`, err);
    return [];
  }
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
