import { describe, expect, it } from "vitest";
import { extractSeedWordsFromKnownSubdomains, parseBaseDomainInput } from "./domainParse";

describe("parseBaseDomainInput", () => {
  it("parses a bare registrable domain", () => {
    expect(parseBaseDomainInput("example.com")).toEqual({
      registrableDomain: "example.com",
      seedLabel: null,
      valid: true,
    });
  });

  it("strips scheme and path", () => {
    const result = parseBaseDomainInput("https://example.com/some/path?x=1");
    expect(result.valid).toBe(true);
    expect(result.registrableDomain).toBe("example.com");
  });

  it("strips a leading www label without keeping it as a seed", () => {
    const result = parseBaseDomainInput("www.example.com");
    expect(result.registrableDomain).toBe("example.com");
    expect(result.seedLabel).toBeNull();
  });

  it("extracts a seed label from a subdomain input", () => {
    const result = parseBaseDomainInput("api.example.com");
    expect(result.registrableDomain).toBe("example.com");
    expect(result.seedLabel).toBe("api");
  });

  it("only keeps the nearest label as seed for deeply nested input", () => {
    const result = parseBaseDomainInput("a.b.api.example.com");
    expect(result.registrableDomain).toBe("example.com");
    expect(result.seedLabel).toBe("api");
  });

  it("handles multi-part TLDs", () => {
    const result = parseBaseDomainInput("api.example.co.uk");
    expect(result.registrableDomain).toBe("example.co.uk");
    expect(result.seedLabel).toBe("api");
  });

  it("strips trailing dot and port", () => {
    expect(parseBaseDomainInput("example.com.").valid).toBe(true);
    expect(parseBaseDomainInput("example.com:8080").registrableDomain).toBe("example.com");
  });

  it("rejects IP addresses", () => {
    expect(parseBaseDomainInput("192.168.1.1").valid).toBe(false);
    expect(parseBaseDomainInput("::1").valid).toBe(false);
  });

  it("rejects empty or invalid input", () => {
    expect(parseBaseDomainInput("").valid).toBe(false);
    expect(parseBaseDomainInput("not a domain").valid).toBe(false);
    expect(parseBaseDomainInput("justoneword").valid).toBe(false);
  });
});

describe("extractSeedWordsFromKnownSubdomains", () => {
  it("extracts words from pasted subdomains, stripping the base domain", () => {
    const result = extractSeedWordsFromKnownSubdomains("api-dev.example.com\nstaging.example.com", "example.com");
    expect(result).toEqual(["api", "dev", "staging"]);
  });

  it("handles comma-separated input and scheme prefixes", () => {
    const result = extractSeedWordsFromKnownSubdomains("https://api.example.com, vpn.example.com", "example.com");
    expect(result).toEqual(["api", "vpn"]);
  });

  it("dedupes words across multiple entries", () => {
    const result = extractSeedWordsFromKnownSubdomains("api.example.com\napi-v2.example.com", "example.com");
    expect(result).toEqual(["api", "v2"]);
  });

  it("returns an empty array for empty input", () => {
    expect(extractSeedWordsFromKnownSubdomains("", "example.com")).toEqual([]);
  });
});
