import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const stations = sqliteTable("stations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
  lines: text("lines").notNull().default("[]"), // JSON array of line names
  zone: text("zone").notNull().default("1"),
  naptan: text("naptan").notNull().unique(),
  transportScore: real("transport_score").default(0),
  journeyToOfficeMin: real("journey_to_office_min"),
  distanceToOfficeM: real("distance_to_office_m"),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // 'rightmove' | 'openrent'
  sourceId: text("source_id").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  address: text("address"),
  postcode: text("postcode"),
  lat: real("lat"),
  lon: real("lon"),
  pricePerMonth: integer("price_per_month"),
  bedrooms: integer("bedrooms").default(1),
  description: text("description"),
  imageUrls: text("image_urls").default("[]"), // JSON array
  furnishing: text("furnishing"),
  hasWasher: integer("has_washer", { mode: "boolean" }).default(false),
  hasDryer: integer("has_dryer", { mode: "boolean" }).default(false),
  hasModularKitchen: integer("has_modular_kitchen", { mode: "boolean" }).default(false),
  hasDishwasher: integer("has_dishwasher", { mode: "boolean" }).default(false),
  nearestStationId: integer("nearest_station_id").references(() => stations.id),
  distanceToStationM: real("distance_to_station_m"),
  transportScore: real("transport_score").default(0),
  amenityScore: real("amenity_score").default(0),
  compositeScore: real("composite_score").default(0),
  firstSeen: text("first_seen").notNull(),
  lastSeen: text("last_seen").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const journeys = sqliteTable("journeys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromLat: real("from_lat").notNull(),
  fromLon: real("from_lon").notNull(),
  toLat: real("to_lat").notNull(),
  toLon: real("to_lon").notNull(),
  durationMin: real("duration_min"),
  legs: text("legs").default("[]"), // JSON array
  fetchedAt: text("fetched_at").notNull(),
});

export const refreshLog = sqliteTable("refresh_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  status: text("status").notNull().default("running"), // 'running' | 'completed' | 'failed'
  listingsFound: integer("listings_found").default(0),
  newListings: integer("new_listings").default(0),
  errors: text("errors"),
});

// Type exports
export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Journey = typeof journeys.$inferSelect;
export type RefreshLogEntry = typeof refreshLog.$inferSelect;
