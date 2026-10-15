import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit then blocks", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 60000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60000).allowed).toBe(true);
    const blocked = rateLimit(key, 2, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks distinct keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    rateLimit(a, 1, 60000);
    expect(rateLimit(b, 1, 60000).allowed).toBe(true);
  });
});
