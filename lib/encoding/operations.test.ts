import { describe, expect, it } from "vitest";
import { ENCODING_OPERATIONS_BY_ID } from "./operations";

const base64 = ENCODING_OPERATIONS_BY_ID["base64"];
const hex = ENCODING_OPERATIONS_BY_ID["hex"];
const url = ENCODING_OPERATIONS_BY_ID["url"];
const htmlEntity = ENCODING_OPERATIONS_BY_ID["html-entity"];
const unicodeEscape = ENCODING_OPERATIONS_BY_ID["unicode-escape"];

describe("base64", () => {
  it("matches a known reference value", () => {
    expect(base64.encode("hello")).toBe("aGVsbG8=");
  });

  it("round-trips ASCII and emoji (surrogate pair) input", () => {
    for (const text of ["hello world", "😀 payload", "日本語"]) {
      expect(base64.decode(base64.encode(text))).toBe(text);
    }
  });

  it("throws a clear error on invalid Base64", () => {
    expect(() => base64.decode("not-valid-base64!!!")).toThrow(/invalid base64/i);
  });
});

describe("hex", () => {
  it("matches a known reference value", () => {
    expect(hex.encode("hello")).toBe("68656c6c6f");
  });

  it("round-trips ASCII and emoji input", () => {
    for (const text of ["hello world", "😀 payload"]) {
      expect(hex.decode(hex.encode(text))).toBe(text);
    }
  });

  it("throws on odd-length hex", () => {
    expect(() => hex.decode("abc")).toThrow(/invalid hex/i);
  });

  it("throws on non-hex characters", () => {
    expect(() => hex.decode("zzzz")).toThrow(/invalid hex/i);
  });
});

describe("url", () => {
  it("matches a known reference value", () => {
    expect(url.encode("a b&c")).toBe("a%20b%26c");
  });

  it("round-trips", () => {
    expect(url.decode(url.encode("a b&c=d?e"))).toBe("a b&c=d?e");
  });

  it("throws a clear error on a malformed % escape", () => {
    expect(() => url.decode("%")).toThrow(/malformed % escape/i);
  });
});

describe("html-entity", () => {
  it("'all' mode encodes every character as a numeric entity", () => {
    expect(htmlEntity.encode("<a>", "all")).toBe("&#60;&#97;&#62;");
  });

  it("'reserved-only' mode only escapes the 5 reserved characters", () => {
    expect(htmlEntity.encode("<a>", "reserved-only")).toBe("&lt;a&gt;");
  });

  it("the two modes produce different output for the same input", () => {
    expect(htmlEntity.encode("<script>", "all")).not.toBe(htmlEntity.encode("<script>", "reserved-only"));
  });

  it("decodes both numeric and named entities", () => {
    expect(htmlEntity.decode("&#60;script&#62;")).toBe("<script>");
    expect(htmlEntity.decode("&lt;script&gt;")).toBe("<script>");
  });

  it("leaves a stray unescaped & alone", () => {
    expect(htmlEntity.decode("Tom & Jerry")).toBe("Tom & Jerry");
  });

  it("throws on an unknown named entity", () => {
    expect(() => htmlEntity.decode("&foo;")).toThrow(/unknown named html entity/i);
  });
});

describe("unicode-escape", () => {
  it("'all' mode escapes every character", () => {
    expect(unicodeEscape.encode("AB", "all")).toBe("\\u0041\\u0042");
  });

  it("'non-ascii-only' mode leaves ASCII untouched", () => {
    expect(unicodeEscape.encode("AB", "non-ascii-only")).toBe("AB");
    expect(unicodeEscape.encode("é", "non-ascii-only")).toBe("\\u00e9");
  });

  it("round-trips astral (surrogate pair) characters", () => {
    expect(unicodeEscape.decode(unicodeEscape.encode("😀", "all"))).toBe("😀");
  });

  it("throws on a truncated \\u escape", () => {
    expect(() => unicodeEscape.decode("\\u12")).toThrow(/invalid unicode escape/i);
  });
});

describe("chaining", () => {
  it("composes across operations and reverses back to the original text", () => {
    const original = "Hello, World! 😀";
    const encoded = url.encode(base64.encode(original));
    const decoded = base64.decode(url.decode(encoded));
    expect(decoded).toBe(original);
  });
});
