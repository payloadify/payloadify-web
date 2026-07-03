export type ArchId = "x86" | "x64" | "x86_64" | "armle" | "armbe" | "aarch64" | "mips" | "mips64" | "ppc";

export type ArchSupportLevel = "Good" | "Excellent" | "Limited";

export interface MsfvenomArch {
  id: ArchId;
  label: string;
  description: string;
  supportLevel?: ArchSupportLevel;
}

/** Ids verified against a real `msfvenom -l arches` / `msfvenom --list arches` dump. Earlier drafts
 *  of this catalog used Android-NDK-style ABI names (armeabi-v7a, arm64-v8a) and granular ARM
 *  version labels (armv5l/armv5b/armv6l/armv7l) that aren't real msfvenom -a values — the real
 *  framework only exposes generic "armle"/"armbe" (endianness, not chip generation). Android
 *  payloads don't take an -a value at all (see payloads.ts — archs: [] for android/*). */
export const MSFVENOM_ARCHS: MsfvenomArch[] = [
  { id: "x86", label: "x86 (32-bit)", description: "Default for many older payloads; runs on 64-bit Windows via WoW64 or 32-bit Linux libs." },
  { id: "x64", label: "x64 (64-bit)", description: "Modern default — native 64-bit execution on Windows and Linux." },
  {
    id: "x86_64",
    label: "x86_64",
    description: "Alias of x64 on Linux — msfvenom accepts either name for the same 64-bit architecture.",
  },
  {
    id: "armle",
    label: "ARM (little-endian, 32-bit)",
    description: "Covers 32-bit little-endian ARM boards — Raspberry Pi (1–4, 32-bit OS), most consumer routers/IoT gear.",
    supportLevel: "Good",
  },
  {
    id: "armbe",
    label: "ARM (big-endian, 32-bit)",
    description: "Big-endian ARM — rare in modern consumer hardware, occasionally seen in older embedded/networking gear.",
    supportLevel: "Limited",
  },
  { id: "aarch64", label: "aarch64 (64-bit ARM)", description: "64-bit ARM — Raspberry Pi 4 (64-bit), ARM servers.", supportLevel: "Excellent" },
  { id: "mips", label: "MIPS (32-bit)", description: "Older routers and embedded systems (D-Link, TP-Link, Netgear routers pre-2015).", supportLevel: "Good" },
  { id: "mips64", label: "MIPS64", description: "High-end routers and switches — rare in consumer IoT.", supportLevel: "Limited" },
  { id: "ppc", label: "PowerPC", description: "Big-endian, mostly legacy Cisco/networking gear.", supportLevel: "Limited" },
];

export const MSFVENOM_ARCHS_BY_ID: Record<ArchId, MsfvenomArch> = Object.fromEntries(
  MSFVENOM_ARCHS.map((a) => [a.id, a]),
) as Record<ArchId, MsfvenomArch>;
