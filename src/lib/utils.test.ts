import { expect, test, describe, mock, spyOn } from "bun:test";

// Mock the modules that are missing in the environment
const clsxMock = mock((...args: any[]) => "clsx-result");
const twMergeMock = mock((arg: string) => "tw-merge-result");

mock.module("clsx", () => ({
  clsx: clsxMock,
}));

mock.module("tailwind-merge", () => ({
  twMerge: twMergeMock,
}));

// Import the function after mocking
import { cn } from "./utils";

describe("cn", () => {
  test("calls clsx with all inputs and passes result to twMerge", () => {
    const inputs = ["class1", { class2: true }, ["class3"]];
    const result = cn(...inputs);

    // Verify clsx was called with all inputs
    expect(clsxMock).toHaveBeenCalledWith(inputs);

    // Verify twMerge was called with the result from clsx
    expect(twMergeMock).toHaveBeenCalledWith("clsx-result");

    // Verify final result is what twMerge returned
    expect(result).toBe("tw-merge-result");
  });

  test("handles empty inputs", () => {
    clsxMock.mockClear();
    twMergeMock.mockClear();

    cn();

    expect(clsxMock).toHaveBeenCalledWith([]);
    expect(twMergeMock).toHaveBeenCalledWith("clsx-result");
  });
});
