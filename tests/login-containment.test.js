import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

describe("magic-link signup containment", () => {
  it("uses exactly one OTP login call with the approved redirect and no user creation", () => {
    expect([...appSource.matchAll(/\.signInWithOtp\s*\(/g)]).toHaveLength(1);
    expect(appSource).toMatch(/signInWithOtp\s*\(\s*\{\s*email,\s*options:\s*\{\s*emailRedirectTo:\s*`\$\{location\.origin\}\$\{location\.pathname\}`,\s*shouldCreateUser:\s*false,/s);
    expect(appSource).not.toMatch(/\.signUp\s*\(/);
  });
});