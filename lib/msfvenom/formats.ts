export type FormatId = string;
export type FormatCategory = "executable" | "script" | "web" | "raw";

export interface MsfvenomFormat {
  id: FormatId;
  label: string;
  /** File extension without the dot; "" for formats that don't produce a conventional extension. */
  extension: string;
  category: FormatCategory;
  /** False for stdout-dump formats (raw bytecode / source-code snippets) where msfvenom prints to
   *  the console rather than writing a file — generate.ts omits -o entirely for these, unless the
   *  selected payload sets forceOutputFilename (e.g. Android, which uses -f raw -o file.apk). */
  producesFile: boolean;
  note?: string;
}

/** Ids below are verified against `msfvenom -l formats`. Earlier drafts of this catalog included
 *  several formats that don't exist as real -f values (elf32/elf64/macho32/macho64 — arch is set
 *  via -a, not a separate format; apk/dex — Android output is `-f raw -o file.apk`; cab/scr/jsp/php —
 *  not in msfvenom's format list; veil — a separate framework, not an msfvenom format; hta — the
 *  real id is hta-psh). Those have been removed or corrected. Also corrected: "ps1" was previously
 *  labeled as a runnable-script format (like psh); metasploit-framework's own source
 *  (lib/msf/base/simple/buffer.rb) maps it to the identical transform as "powershell" — a
 *  byte-array dump, not a script. See the ps1/powershell/psh notes below for the real distinction. */
export const MSFVENOM_FORMATS: MsfvenomFormat[] = [
  { id: "exe", label: "EXE (.exe) — Windows executable", extension: "exe", category: "executable", producesFile: true },
  {
    id: "exe-only",
    label: "EXE-only — Windows executable without a stub template",
    extension: "exe",
    category: "executable",
    producesFile: true,
    note: "Skips msfvenom's default template wrapper — typically paired with -x/a custom template (add it via Extra Options).",
  },
  {
    id: "exe-service",
    label: "EXE-service — Windows service executable",
    extension: "exe",
    category: "executable",
    producesFile: true,
    note: "Built to run as a Windows service — useful for persistence.",
  },
  { id: "exe-small", label: "EXE-small — smaller Windows executable", extension: "exe", category: "executable", producesFile: true },
  {
    id: "elf",
    label: "ELF — Linux executable",
    extension: "elf",
    category: "executable",
    producesFile: true,
    note: "No extension is required by msfvenom convention on Linux; .elf is added here for clarity. Architecture is set via -a, not the format.",
  },
  {
    id: "elf-so",
    label: "ELF-SO — Linux shared object (.so)",
    extension: "so",
    category: "executable",
    producesFile: true,
    note: "For library injection (LD_PRELOAD-style delivery) rather than standalone execution.",
  },
  {
    id: "macho",
    label: "Mach-O — macOS binary",
    extension: "macho",
    category: "executable",
    producesFile: true,
    note: "No extension is required by msfvenom convention on macOS; .macho is added here for clarity. Architecture is set via -a, not the format.",
  },
  { id: "dll", label: "DLL — Windows Dynamic Link Library", extension: "dll", category: "executable", producesFile: true },
  { id: "msi", label: "MSI — Windows Installer package", extension: "msi", category: "executable", producesFile: true },
  {
    id: "msi-nouac",
    label: "MSI-noUAC — Windows Installer without a UAC prompt",
    extension: "msi",
    category: "executable",
    producesFile: true,
    note: "Skips the UAC elevation prompt on install — relevant for privilege-escalation scenarios.",
  },
  { id: "jar", label: "JAR — Java archive", extension: "jar", category: "executable", producesFile: true },
  {
    id: "hta-psh",
    label: "HTA-PSH (.hta) — HTML Application (mshta.exe)",
    extension: "hta",
    category: "script",
    producesFile: true,
    note: "Embeds a base64-encoded PowerShell command inside an HTA wrapper.",
  },
  {
    id: "psh",
    label: "PSH — PowerShell wrapper script",
    extension: "ps1",
    category: "script",
    producesFile: true,
    note: "Wraps the payload's shellcode in a PowerShell dropper. The similarly-named ps1/powershell formats below are a different, non-runnable byte-array transform, not a script wrapper.",
  },
  {
    id: "psh-cmd",
    label: "PSH-CMD — PowerShell one-liner command",
    extension: "",
    category: "script",
    producesFile: false,
    note: "Prints a single PowerShell command to the console for direct copy-paste execution rather than saving a script file.",
  },
  { id: "psh-net", label: "PSH-NET — PowerShell .NET reflection loader", extension: "ps1", category: "script", producesFile: true },
  { id: "vbs", label: "VBS — VBScript, runs via cscript.exe", extension: "vbs", category: "script", producesFile: true },
  { id: "bash", label: "Bash — Bash script", extension: "sh", category: "script", producesFile: true },
  { id: "sh", label: "SH — POSIX shell script", extension: "sh", category: "script", producesFile: true },
  { id: "asp", label: "ASP — Active Server Pages web shell (IIS)", extension: "asp", category: "web", producesFile: true },
  { id: "aspx", label: "ASPX — ASP.NET web shell (IIS)", extension: "aspx", category: "web", producesFile: true },
  { id: "war", label: "WAR — Java Web Archive", extension: "war", category: "web", producesFile: true },
  { id: "py", label: "PY — Python script", extension: "py", category: "script", producesFile: true },
  { id: "rb", label: "RB — Ruby script", extension: "rb", category: "script", producesFile: true },
  { id: "pl", label: "PL — Perl script", extension: "pl", category: "script", producesFile: true },
  {
    id: "raw",
    label: "Raw — direct bytecode, no wrapper",
    extension: "",
    category: "raw",
    producesFile: false,
    note: "Prints raw bytes to the console by default; Android payloads generate with -o since raw is the only way to produce an installable .apk.",
  },
  { id: "hex", label: "Hex — hexadecimal shellcode dump", extension: "", category: "raw", producesFile: false },
  { id: "c", label: "C — C source code array", extension: "", category: "raw", producesFile: false },
  { id: "csharp", label: "C# — C# source code array", extension: "", category: "raw", producesFile: false },
  { id: "java", label: "Java — Java source template", extension: "", category: "raw", producesFile: false },
  { id: "vba", label: "VBA — Office macro code snippet", extension: "", category: "raw", producesFile: false },
  { id: "vbapplication", label: "VBApplication — alternate VBA transform", extension: "", category: "raw", producesFile: false },
  { id: "vbscript", label: "VBScript — alternate VBS transform (array, not a runnable script)", extension: "", category: "raw", producesFile: false },
  {
    id: "powershell",
    label: "PowerShell array — byte array, not a runnable script",
    extension: "",
    category: "raw",
    producesFile: false,
    note: "Dumps a PowerShell byte array for embedding in your own script — not a runnable script itself. \"ps1\" (below) is a literal alias of this same transform in real msfvenom, despite the name; psh is the format that produces a runnable dropper script.",
  },
  {
    id: "ps1",
    label: "PS1 array — alias of the PowerShell array format above, not a runnable script",
    extension: "",
    category: "raw",
    producesFile: false,
    note: "Same underlying transform as \"powershell\" above (msfvenom maps both to the identical byte-array output) — despite the name, this does not produce a runnable .ps1 script. Use psh to wrap shellcode in a runnable dropper, or raw for payloads (like windows/powershell_reverse_tcp) that already generate literal script text.",
  },
  { id: "base32", label: "Base32 — Base32-encoded shellcode", extension: "", category: "raw", producesFile: false },
  { id: "base64", label: "Base64 — Base64-encoded shellcode", extension: "", category: "raw", producesFile: false },
  { id: "js_be", label: "JS (Big Endian) — JavaScript shellcode array", extension: "", category: "raw", producesFile: false },
  { id: "js_le", label: "JS (Little Endian) — JavaScript shellcode array", extension: "", category: "raw", producesFile: false },
];

export const MSFVENOM_FORMATS_BY_ID: Record<FormatId, MsfvenomFormat> = Object.fromEntries(
  MSFVENOM_FORMATS.map((f) => [f.id, f]),
);
