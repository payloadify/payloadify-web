import type { ArchId } from "./archs";

export type EncoderId =
  | "none"
  | "x86/shikata_ga_nai"
  | "x86/fnstenv_mov"
  | "x86/jmp_call_additive"
  | "x86/alpha_mixed"
  | "x86/alpha_upper"
  | "x86/add_sub"
  | "x86/bloxor"
  | "x86/avoid_underscore_tolower"
  | "x86/avoid_utf8_tolower"
  | "x64/xor_dynamic"
  | "x64/xor"
  | "x64/xor_context"
  | "x64/zutto_dekiru";

export type EncoderEffectiveness = "Low-Medium" | "Medium" | "Medium-High" | "High";
export type EncoderSpeed = "Very Fast" | "Fast" | "Medium";

export interface MsfvenomEncoder {
  id: EncoderId;
  label: string;
  effectiveness: EncoderEffectiveness;
  speed: EncoderSpeed;
  /** Highest iteration count worth using — encoding loops rarely help past this, and more
   *  iterations means slower generation/execution for diminishing returns. */
  maxIterations: number;
  whyUseIt: string;
  /** Real msfvenom encoders are namespaced by architecture (e.g. x86/shikata_ga_nai only
   *  encodes x86 shellcode) — null means "always available" (only true for the none sentinel,
   *  including archless payloads like python). Non-null means "only offer this encoder when the
   *  selected payload's arch is in this list." */
  compatibleArchs: ArchId[] | null;
}

export const NONE_ENCODER: MsfvenomEncoder = {
  id: "none",
  label: "None (no encoding)",
  effectiveness: "Low-Medium",
  speed: "Very Fast",
  maxIterations: 0,
  whyUseIt:
    "Fastest to generate, smallest payload. Fine for stageless payloads or size-constrained targets — but raw, unencoded shellcode is the easiest thing for signature-based AV to catch.",
  compatibleArchs: null,
};

export const MSFVENOM_ENCODERS: MsfvenomEncoder[] = [
  NONE_ENCODER,
  {
    id: "x86/shikata_ga_nai",
    label: "x86/shikata_ga_nai",
    effectiveness: "High",
    speed: "Fast",
    maxIterations: 10,
    whyUseIt:
      "The most common msfvenom encoder — polymorphic, so each pass produces different bytes. Best default choice for Windows x86 targets; 2–4 iterations is the typical sweet spot for AV evasion. x86 only — msfvenom has no direct x64 equivalent.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/fnstenv_mov",
    label: "x86/fnstenv_mov",
    effectiveness: "Medium-High",
    speed: "Medium",
    maxIterations: 5,
    whyUseIt: "FPU-instruction-based encoder, less commonly fingerprinted by signature AV than shikata_ga_nai. x86 only.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/jmp_call_additive",
    label: "x86/jmp_call_additive",
    effectiveness: "Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt: "Jump/call-based obfuscation — simple but effective, fast to generate. x86 only.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x64/xor_dynamic",
    label: "x64/xor_dynamic",
    effectiveness: "Low-Medium",
    speed: "Very Fast",
    maxIterations: 2,
    whyUseIt:
      "Dynamic-key XOR encoder for x64 shellcode. Very fast, but easily detectable on its own — best combined with other evasion, not relied on alone. x64 only.",
    compatibleArchs: ["x64", "x86_64"],
  },
  {
    id: "x86/alpha_mixed",
    label: "x86/alpha_mixed",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt:
      "Restricts encoded output to printable mixed-case alphanumeric bytes — for delivery channels that only accept alphanumeric characters, not general AV evasion. msfvenom ranks it 'low'.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/alpha_upper",
    label: "x86/alpha_upper",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt:
      "Same narrow use case as alpha_mixed (alphanumeric-only delivery channels) but restricted to uppercase output. msfvenom ranks it 'low'.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/add_sub",
    label: "x86/add_sub",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt:
      "Add/Sub arithmetic encoder. msfvenom ranks it 'manual' (not auto-selected) — less battle-tested than shikata_ga_nai, use only if you have a specific reason to avoid XOR-based encoders.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/bloxor",
    label: "x86/bloxor",
    effectiveness: "Medium",
    speed: "Medium",
    maxIterations: 3,
    whyUseIt:
      "Metamorphic block-based XOR encoder — restructures code, not just bytes, on each pass. msfvenom ranks it 'manual', so test the generated payload before relying on it in an engagement.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/avoid_underscore_tolower",
    label: "x86/avoid_underscore_tolower",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt:
      "Avoids bytes that break under underscore/tolower transformations — a narrow filter-evasion case, not general AV evasion. msfvenom ranks it 'manual'.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x86/avoid_utf8_tolower",
    label: "x86/avoid_utf8_tolower",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt:
      "Avoids bytes that break under UTF8-normalization/tolower — relevant when the payload passes through a filter that does either. msfvenom ranks it 'manual'.",
    compatibleArchs: ["x86"],
  },
  {
    id: "x64/xor",
    label: "x64/xor",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt: "Basic fixed-key XOR encoder for x64 shellcode — simpler than xor_dynamic but more predictable. msfvenom ranks it 'normal'.",
    compatibleArchs: ["x64", "x86_64"],
  },
  {
    id: "x64/xor_context",
    label: "x64/xor_context",
    effectiveness: "Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt:
      "Context-keyed XOR encoder for x64 — derives its key from runtime context (e.g. hostname), making static analysis harder than a fixed key. msfvenom ranks it 'normal'.",
    compatibleArchs: ["x64", "x86_64"],
  },
  {
    id: "x64/zutto_dekiru",
    label: "x64/zutto_dekiru",
    effectiveness: "Low-Medium",
    speed: "Medium",
    maxIterations: 3,
    whyUseIt: "x64 encoder with an unusual code structure. msfvenom ranks it 'manual' — test before relying on it in an engagement.",
    compatibleArchs: ["x64", "x86_64"],
  },
];

export const MSFVENOM_ENCODERS_BY_ID: Record<EncoderId, MsfvenomEncoder> = Object.fromEntries(
  MSFVENOM_ENCODERS.map((e) => [e.id, e]),
) as Record<EncoderId, MsfvenomEncoder>;

/** Encoders offered for a given (possibly null/archless) architecture — the none sentinel is
 *  always included, arch-scoped encoders only when the arch matches. */
export function encodersForArch(archId: ArchId | null): MsfvenomEncoder[] {
  return MSFVENOM_ENCODERS.filter((e) => e.compatibleArchs === null || (archId !== null && e.compatibleArchs.includes(archId)));
}
