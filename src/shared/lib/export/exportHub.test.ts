/**
 * ExportHub — Unit Tests
 *
 * Validates the central export orchestration layer.
 * A senior SWE focuses on: format routing, error paths, MIME types, filename conventions.
 *
 * Maintained by CrustAgent©™
 */

import { describe, it, expect } from "vitest";
import { getAvailableFormats, processExport } from "./exportHub";
import type { ExportData } from "./types";

const fixtureData: ExportData = {
  bookmarks: [
    { id: "1", title: "Reef One", url: "https://reef.one", tags: ["coral"], podId: "f1", createdAt: "2026-01-01T00:00:00Z" },
  ],
  folders: [
    { id: "f1", name: "Coral Reef" },
  ],
  settings: [
    { key: "theme", value: "dark" },
  ],
};

describe("ExportHub", () => {
  describe("getAvailableFormats", () => {
    it("returns all registered formatters", () => {
      const formats = getAvailableFormats();
      expect(formats.length).toBeGreaterThanOrEqual(3);
    });

    it("includes JSON, HTML, and CSV formats", () => {
      const formats = getAvailableFormats();
      const ids = formats.map(f => f.id);
      expect(ids).toContain("json");
      expect(ids).toContain("html");
      expect(ids).toContain("csv");
    });

    it("each format has id and label", () => {
      const formats = getAvailableFormats();
      formats.forEach(f => {
        expect(f.id).toBeTruthy();
        expect(f.label).toBeTruthy();
        expect(typeof f.id).toBe("string");
        expect(typeof f.label).toBe("string");
      });
    });
  });

  describe("processExport", () => {
    it("throws for unsupported format", async () => {
      await expect(processExport("yaml", fixtureData)).rejects.toThrow("Unsupported export format: yaml");
    });

    it("generates JSON export with correct MIME type", async () => {
      const result = await processExport("json", fixtureData);
      expect(result.blob.type).toBe("application/json");
      expect(result.filename).toMatch(/^clawchives_export_\d{4}-\d{2}-\d{2}\.json$/);
    });

    it("generates CSV export with correct MIME type", async () => {
      const result = await processExport("csv", fixtureData);
      expect(result.blob.type).toBe("text/csv");
      expect(result.filename).toMatch(/^clawchives_export_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it("generates HTML export with correct MIME type", async () => {
      const result = await processExport("html", fixtureData);
      expect(result.blob.type).toBe("text/html");
      expect(result.filename).toMatch(/^clawchives_export_\d{4}-\d{2}-\d{2}\.html$/);
    });

    it("filename contains today's date", async () => {
      const today = new Date().toISOString().split("T")[0];
      const result = await processExport("json", fixtureData);
      expect(result.filename).toContain(today);
    });

    it("blob contains non-empty data", async () => {
      const result = await processExport("json", fixtureData);
      expect(result.blob.size).toBeGreaterThan(0);
    });
  });
});
