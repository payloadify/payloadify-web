export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("Invalid Base64 — contains characters outside the standard Base64 alphabet.");
  }
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().replace(/^0x/i, "").replace(/\s+/g, "");
  if (clean.length === 0) return new Uint8Array(0);
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("Invalid hex — expected an even number of hex digits (0-9, a-f).");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

/** fatal: true so invalid UTF-8 byte sequences throw instead of silently becoming U+FFFD —
 *  a security tool shouldn't hide data corruption behind a replacement character. */
export function utf8BytesToString(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Decoded bytes are not valid UTF-8 text.");
  }
}
