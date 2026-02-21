import { globalLoadingAtom, sidebarOpenAtom, themeAtom } from "@/lib/state/atoms/ui";
import { atom } from "jotai";
import { describe, expect, it } from "vitest";

describe("UI Atoms", () => {
  it("sidebarOpenAtom is defined", () => {
    expect(sidebarOpenAtom).toBeDefined();
  });

  it("themeAtom is defined", () => {
    expect(themeAtom).toBeDefined();
  });

  it("globalLoadingAtom is defined", () => {
    expect(globalLoadingAtom).toBeDefined();
  });

  it("can create and use atoms", () => {
    const testAtom = atom(true);
    expect(testAtom).toBeDefined();
  });
});
