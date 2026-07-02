import { utf8Bytes, bytesToHex } from "../hash/bytes";
import { bytesToBase64, base64ToBytes, hexToBytes, utf8BytesToString } from "./bytes";

export type EncodingOperationId = "base64" | "hex" | "url" | "html-entity" | "unicode-escape";

export type EncodingOperation = {
  id: EncodingOperationId;
  name: string;
  /** Only present for operations with a configurable encode mode (drives a per-step toggle in the UI). */
  modes?: { id: string; label: string }[];
  encode: (input: string, mode?: string) => string;
  decode: (input: string) => string;
};

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const RESERVED_HTML_CHARS: Record<string, string> = {
  "&": "amp",
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos",
};

function htmlEntityEncode(input: string, mode: string | undefined): string {
  if (mode === "reserved-only") {
    return input.replace(/[&<>"']/g, (ch) => `&${RESERVED_HTML_CHARS[ch]};`);
  }
  return Array.from(input, (ch) => `&#${ch.codePointAt(0)};`).join("");
}

function htmlEntityDecode(input: string): string {
  return input.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (Number.isNaN(codePoint)) throw new Error(`Invalid numeric HTML entity: ${match}`);
      return String.fromCodePoint(codePoint);
    }
    const resolved = NAMED_HTML_ENTITIES[entity];
    if (resolved === undefined) throw new Error(`Unknown named HTML entity: ${match}`);
    return resolved;
  });
}

function unicodeEscapeEncode(input: string, mode: string | undefined): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (mode === "non-ascii-only" && code < 128) {
      out += input[i];
    } else {
      out += "\\u" + code.toString(16).padStart(4, "0");
    }
  }
  return out;
}

function unicodeEscapeDecode(input: string): string {
  if (!/^(\\u[0-9a-fA-F]{4})*$/.test(input)) {
    throw new Error("Invalid Unicode escape — expected a sequence of \\uXXXX groups.");
  }
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

/** Single source of truth for every encode/decode operation the Payload Encoder can chain. */
export const ENCODING_OPERATIONS: EncodingOperation[] = [
  {
    id: "base64",
    name: "Base64",
    encode: (input) => bytesToBase64(utf8Bytes(input)),
    decode: (input) => utf8BytesToString(base64ToBytes(input)),
  },
  {
    id: "hex",
    name: "Hex",
    encode: (input) => bytesToHex(utf8Bytes(input)),
    decode: (input) => utf8BytesToString(hexToBytes(input)),
  },
  {
    id: "url",
    name: "URL",
    encode: (input) => encodeURIComponent(input),
    decode: (input) => {
      try {
        return decodeURIComponent(input);
      } catch {
        throw new Error("Invalid URL encoding — contains a malformed % escape sequence.");
      }
    },
  },
  {
    id: "html-entity",
    name: "HTML Entity",
    modes: [
      { id: "all", label: "Encode every character" },
      { id: "reserved-only", label: "Reserved characters only (& < > \" ')" },
    ],
    encode: (input, mode) => htmlEntityEncode(input, mode),
    decode: htmlEntityDecode,
  },
  {
    id: "unicode-escape",
    name: "Unicode Escape",
    modes: [
      { id: "all", label: "Escape every character" },
      { id: "non-ascii-only", label: "Non-ASCII characters only" },
    ],
    encode: (input, mode) => unicodeEscapeEncode(input, mode),
    decode: unicodeEscapeDecode,
  },
];

export const ENCODING_OPERATIONS_BY_ID: Record<string, EncodingOperation> = Object.fromEntries(
  ENCODING_OPERATIONS.map((op) => [op.id, op]),
);
