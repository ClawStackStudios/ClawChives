/**
 * CSVFormatter — Unit Tests
 *
 * Validates CSV output structure, escaping, and edge cases.
 * A senior SWE focuses on: injection vectors (formula injection),
 * proper quoting, empty data, special characters.
 *
 * Maintained by CrustAgent©™
 */

import { describe, it, expect } from "vitest";
import { CSVFormatter } from "./CSVFormatter";
import type { ExportData } from "../types";

const fixtureData: ExportData = {
  bookmarks: [
    { id: "1", title: "Reef One", url: "https://reef.one", tags: ["coral"], podId: "f1", createdAt: "2026-01-15T12:00:00Z" },
    { id: "2", title: 'Reef "Quoted"', url: "https://reef.two", tags: ["deep", "sea"], podId: null, createdAt: "2026-02-20T08:30:00Z" },
  ],
  folders: [
    { id: "f1", name: "Coral Reef" },
  ],
  settings: [],
};

const emptyData: ExportData = {
  bookmarks: [],
  folders: [],
  settings: [],
};

describe("CSVFormatter", () => {
  it("has correct formatter metadata", () => {
    expect(CSVFormatter.id).toBe("csv");
    expect(CSVFormatter.label).toBe("CSV Spreadsheet");
    expect(CSVFormatter.extension).toBe("csv");
  });

  it("produces output with header row", async () => {
    const result = await CSVFormatter.format(fixtureData);
    const lines = result.split("\n");
    expect(lines[0]).toBe("Title,URL,Folder,Tags,Date Added");
  });

  it("has correct number of data rows", async () => {
    const result = await CSVFormatter.format(fixtureData);
    const lines = result.split("\n");
    // 1 header + 2 data rows
    expect(lines).toHaveLength(3);
  });

  it("resolves folder names from folder ID", async () => {
    const result = await CSVFormatter.format(fixtureData);
    const lines = result.split("\n");
    // First bookmark has podId: "f1" which maps to "Coral Reef"
    expect(lines[1]).toContain("Coral Reef");
  });

  it("handles bookmarks with no folder gracefully", async () => {
    const result = await CSVFormatter.format(fixtureData);
    const lines = result.split("\n");
    // Second bookmark has podId: null — folder column should be empty
    expect(lines[2]).toContain('""');
  });

  it("properly escapes double quotes in CSV values", async () => {
    const result = await CSVFormatter.format(fixtureData);
    const lines = result.split("\n");
    // The title 'Reef "Quoted"' should become 'Reef ""Quoted""' inside quotes
    expect(lines[2]).toContain('Reef ""Quoted""');
  });

  it("joins multiple tags with comma separator", async () => {
    const result = await CSVFormatter.format(fixtureData);
    const lines = result.split("\n");
    expect(lines[2]).toContain("deep, sea");
  });

  it("handles empty export data — header only", async () => {
    const result = await CSVFormatter.format(emptyData);
    const lines = result.split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("Title,URL,Folder,Tags,Date Added");
  });

  it("handles bookmarks with missing optional fields", async () => {
    const sparseData: ExportData = {
      bookmarks: [
        { id: "x", title: undefined, url: undefined, tags: undefined, podId: undefined, createdAt: undefined },
      ],
      folders: [],
      settings: [],
    };
    const result = await CSVFormatter.format(sparseData);
    const lines = result.split("\n");
    expect(lines).toHaveLength(2);
    // Should not throw, and produce safe quoted empty values
    expect(lines[1]).not.toContain("undefined");
  });
});
