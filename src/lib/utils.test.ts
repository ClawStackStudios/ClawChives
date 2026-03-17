import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("clsx", () => ({
  clsx: vi.fn((..._args: unknown[]) => "clsx-result"),
}));

vi.mock("tailwind-merge", () => ({
  twMerge: vi.fn((_arg: string) => "tw-merge-result"),
}));

import { cn, aggregateTags } from "./utils";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Bookmark } from "../services/types";

describe("aggregateTags", () => {
  test("aggregates tags correctly and sorts them by count descending", () => {
    const bookmarks: Bookmark[] = [
      { id: "1", url: "", title: "", tags: ["a", "b"], starred: false, archived: false, createdAt: "", updatedAt: "" },
      { id: "2", url: "", title: "", tags: ["a", "c"], starred: false, archived: false, createdAt: "", updatedAt: "" },
      { id: "3", url: "", title: "", tags: ["a"], starred: false, archived: false, createdAt: "", updatedAt: "" },
    ];

    const result = aggregateTags(bookmarks);

    expect(result).toEqual([
      ["a", 3],
      ["b", 1],
      ["c", 1],
    ]);
  });

  test("handles empty bookmarks array", () => {
    expect(aggregateTags([])).toEqual([]);
  });

  test("handles bookmarks with no tags", () => {
    const bookmarks: Bookmark[] = [
      { id: "1", url: "", title: "", tags: [], starred: false, archived: false, createdAt: "", updatedAt: "" },
    ];
    expect(aggregateTags(bookmarks)).toEqual([]);
  });
});

describe("cn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calls clsx with all inputs and passes result to twMerge", () => {
    const inputs = ["class1", { class2: true }, ["class3"]] as Parameters<typeof cn>;
    const result = cn(...inputs);

    // Verify clsx was called with all inputs
    expect(clsx).toHaveBeenCalledWith(inputs);

    // Verify twMerge was called with the result from clsx
    expect(twMerge).toHaveBeenCalledWith("clsx-result");

    // Verify final result is what twMerge returned
    expect(result).toBe("tw-merge-result");
  });

  test("handles empty inputs", () => {
    cn();

    expect(clsx).toHaveBeenCalledWith([]);
    expect(twMerge).toHaveBeenCalledWith("clsx-result");
  });
});
