/**
 * ClawChivesJSON Formatter — Unit Tests
 *
 * Validates the structural integrity of the sovereign JSON export format.
 * A senior SWE looks at: schema compliance, empty/edge data, metadata accuracy.
 *
 * Maintained by CrustAgent©™
 */

import { describe, it, expect } from "vitest";
import { ClawChivesJSONFormatter } from "./ClawChivesJSON";
import type { ExportData, ClawChivesExport } from "../types";

const fixtureData: ExportData = {
  bookmarks: [
    { id: "1", title: "Reef One", url: "https://reef.one", tags: ["coral", "deep"], podId: "f1", createdAt: "2026-01-01T00:00:00Z" },
    { id: "2", title: "Reef Two", url: "https://reef.two", tags: [], podId: null, createdAt: "2026-01-02T00:00:00Z" },
  ],
  folders: [
    { id: "f1", name: "Coral Reef", color: "#0891b2" },
  ],
  settings: [
    { key: "theme", value: "dark" },
  ],
};

const emptyData: ExportData = {
  bookmarks: [],
  folders: [],
  settings: [],
};

describe("ClawChivesJSON Formatter", () => {
  it("has correct formatter metadata", () => {
    expect(ClawChivesJSONFormatter.id).toBe("json");
    expect(ClawChivesJSONFormatter.label).toBe("ClawChives JSON");
    expect(ClawChivesJSONFormatter.extension).toBe("json");
  });

  it("produces valid JSON output", async () => {
    const result = await ClawChivesJSONFormatter.format(fixtureData);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("includes all required top-level keys", async () => {
    const result: ClawChivesExport = JSON.parse(await ClawChivesJSONFormatter.format(fixtureData));
    expect(result).toHaveProperty("version");
    expect(result).toHaveProperty("exportedAt");
    expect(result).toHaveProperty("branding");
    expect(result).toHaveProperty("metadata");
    expect(result).toHaveProperty("data");
  });

  it("metadata counts match actual data", async () => {
    const result: ClawChivesExport = JSON.parse(await ClawChivesJSONFormatter.format(fixtureData));
    expect(result.metadata.totalBookmarks).toBe(2);
    expect(result.metadata.totalFolders).toBe(1);
    expect(result.metadata.totalSettings).toBe(1);
    expect(result.metadata.encrypted).toBe(false);
  });

  it("preserves bookmark data integrity", async () => {
    const result: ClawChivesExport = JSON.parse(await ClawChivesJSONFormatter.format(fixtureData));
    expect(result.data.bookmarks).toHaveLength(2);
    expect(result.data.bookmarks[0].title).toBe("Reef One");
    expect(result.data.bookmarks[0].tags).toEqual(["coral", "deep"]);
    expect(result.data.bookmarks[1].tags).toEqual([]);
  });

  it("handles empty export data gracefully", async () => {
    const result: ClawChivesExport = JSON.parse(await ClawChivesJSONFormatter.format(emptyData));
    expect(result.metadata.totalBookmarks).toBe(0);
    expect(result.metadata.totalFolders).toBe(0);
    expect(result.metadata.totalSettings).toBe(0);
    expect(result.data.bookmarks).toEqual([]);
    expect(result.data.folders).toEqual([]);
  });

  it("generates a non-empty checksum", async () => {
    const result: ClawChivesExport = JSON.parse(await ClawChivesJSONFormatter.format(fixtureData));
    expect(result.metadata.checksum).toBeTruthy();
    expect(typeof result.metadata.checksum).toBe("string");
    expect(result.metadata.checksum.length).toBeGreaterThan(0);
  });

  it("includes branding with ClawChives identity", async () => {
    const result: ClawChivesExport = JSON.parse(await ClawChivesJSONFormatter.format(fixtureData));
    expect(result.branding.name).toBe("ClawChives");
    expect(result.branding.tagline).toContain("Sovereign");
  });
});
