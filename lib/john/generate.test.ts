import { describe, expect, it } from "vitest";
import { buildBenchmarkCommand, buildCommand, buildRestoreCommand, buildShowCommand } from "./generate";
import { JohnSelection } from "./params";

function baseSelection(overrides: Partial<JohnSelection> = {}): JohnSelection {
  return {
    format: "nt",
    customFormat: "",
    hashFile: "hashes.txt",
    crackMode: "wordlist",
    wordlist: "rockyou.txt",
    rules: "None",
    customRules: "",
    singleSection: "",
    singleSeed: "",
    incrementalMode: "",
    mask: "",
    customCharsets: ["", "", "", ""],
    minLength: "",
    maxLength: "",
    externalMode: "",
    sessionName: "",
    fork: "",
    potFile: "",
    noLog: false,
    ...overrides,
  };
}

describe("buildCommand", () => {
  it("builds a wordlist crack command", () => {
    expect(buildCommand(baseSelection())).toBe("john --format='nt' --wordlist='rockyou.txt' hashes.txt");
  });

  it("uses the custom format override instead of the dropdown value", () => {
    const sel = baseSelection({ customFormat: "raw-sha256" });
    expect(buildCommand(sel)).toBe("john --format='raw-sha256' --wordlist='rockyou.txt' hashes.txt");
  });

  it("does not quote the hash file path", () => {
    const sel = baseSelection({ hashFile: "/mnt/dumps/hashes.txt" });
    expect(buildCommand(sel)).toBe("john --format='nt' --wordlist='rockyou.txt' /mnt/dumps/hashes.txt");
  });

  it("escapes an embedded single quote in a free-text value instead of breaking out of quoting", () => {
    const sel = baseSelection({ wordlist: "abc' ; touch pwned #" });
    expect(buildCommand(sel)).toBe("john --format='nt' --wordlist='abc'\\'' ; touch pwned #' hashes.txt");
  });

  it("adds a named --rules= flag from the dropdown", () => {
    const sel = baseSelection({ rules: "best64" });
    expect(buildCommand(sel)).toBe("john --format='nt' --wordlist='rockyou.txt' --rules='best64' hashes.txt");
  });

  it("omits --rules entirely when the dropdown is None and no custom rule is set", () => {
    const sel = baseSelection({ rules: "None" });
    expect(buildCommand(sel)).toBe("john --format='nt' --wordlist='rockyou.txt' hashes.txt");
  });

  it("prefers a custom inline :rule over the dropdown", () => {
    const sel = baseSelection({ rules: "best64", customRules: ":se3 sep" });
    expect(buildCommand(sel)).toBe("john --format='nt' --wordlist='rockyou.txt' --rules=':se3 sep' hashes.txt");
  });

  it("builds a single-crack command with a section override", () => {
    const sel = baseSelection({ crackMode: "single", singleSection: "Single:MyRule" });
    expect(buildCommand(sel)).toBe("john --format='nt' --single='Single:MyRule' hashes.txt");
  });

  it("builds a bare --single command when no section is given", () => {
    const sel = baseSelection({ crackMode: "single" });
    expect(buildCommand(sel)).toBe("john --format='nt' --single hashes.txt");
  });

  it("includes --single-seed when set", () => {
    const sel = baseSelection({ crackMode: "single", singleSeed: "seedword" });
    expect(buildCommand(sel)).toBe("john --format='nt' --single --single-seed='seedword' hashes.txt");
  });

  it("builds an incremental command with a mode", () => {
    const sel = baseSelection({ crackMode: "incremental", incrementalMode: "Alnum" });
    expect(buildCommand(sel)).toBe("john --format='nt' --incremental='Alnum' hashes.txt");
  });

  it("builds a bare --incremental command when no mode is given", () => {
    const sel = baseSelection({ crackMode: "incremental" });
    expect(buildCommand(sel)).toBe("john --format='nt' --incremental hashes.txt");
  });

  it("builds a mask command with custom charsets and length bounds", () => {
    const sel = baseSelection({
      crackMode: "mask",
      wordlist: "",
      mask: "?1?1?1?1?d?d?d?d",
      customCharsets: ["?l?u", "", "", ""],
      minLength: "6",
      maxLength: "10",
    });
    expect(buildCommand(sel)).toBe(
      "john --format='nt' --mask='?1?1?1?1?d?d?d?d' -1='?l?u' --min-length='6' --max-length='10' hashes.txt",
    );
  });

  it("builds an external mode command", () => {
    const sel = baseSelection({ crackMode: "external", wordlist: "", externalMode: "Filter_Digits" });
    expect(buildCommand(sel)).toBe("john --format='nt' --external='Filter_Digits' hashes.txt");
  });

  it("includes advanced flags in the expected order", () => {
    const sel = baseSelection({ sessionName: "job1", fork: "4", potFile: "custom.pot", noLog: true });
    expect(buildCommand(sel)).toBe(
      "john --format='nt' --wordlist='rockyou.txt' --session='job1' --fork='4' --pot='custom.pot' --no-log hashes.txt",
    );
  });
});

describe("buildShowCommand", () => {
  it("builds a --show command", () => {
    expect(buildShowCommand(baseSelection())).toBe("john --format='nt' --show hashes.txt");
  });
});

describe("buildRestoreCommand", () => {
  it("builds a --restore command from a session name", () => {
    expect(buildRestoreCommand("job1")).toBe("john --restore='job1'");
  });
});

describe("buildBenchmarkCommand", () => {
  it("builds a --test command for the selected format", () => {
    expect(buildBenchmarkCommand(baseSelection())).toBe("john --format='nt' --test");
  });
});
