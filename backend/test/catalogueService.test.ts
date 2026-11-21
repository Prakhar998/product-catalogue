import { describe, expect, it } from "vitest";
import { CatalogueService } from "../src/services/catalogueService.js";
import { FakeSource } from "./fixtures.js";

const service = new CatalogueService(new FakeSource());

describe("CatalogueService", () => {
  it("features the 5 highest rated products, best first", async () => {
    const ids = (await service.featured()).map((p) => p.id);
    expect(ids).toEqual([1, 5, 6, 7, 2]);
  });

  it("splits a category into top rated and the rest", async () => {
    const result = await service.category("electronics");
    expect(result?.topRated.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(result?.others.map((p) => p.id)).toEqual([4]);
  });

  it("matches categories case-insensitively and returns null if unknown", async () => {
    expect(await service.category("JEWELERY")).not.toBeNull();
    expect(await service.category("toys")).toBeNull();
  });

  it("lists distinct categories", async () => {
    expect(await service.categories()).toEqual(["electronics", "jewelery", "men's clothing"]);
  });

  describe("search", () => {
    it("only returns products containing the term, case-insensitively", async () => {
      expect((await service.search("LAPTOP")).map((p) => p.id)).toEqual([1]);
    });

    it("matches category text too", async () => {
      expect((await service.search("jewelery")).map((p) => p.id)).toEqual([5, 6]);
    });

    it("requires every term to match", async () => {
      expect((await service.search("gold ring")).map((p) => p.id)).toEqual([5]);
      expect(await service.search("gold laptop")).toEqual([]);
    });

    it("returns nothing for a blank query", async () => {
      expect(await service.search("   ")).toEqual([]);
    });
  });
});
