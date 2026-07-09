"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import {
  generateHmacSecret,
  SECRET_BITS_DEFAULT,
  SECRET_BITS_MAX,
  SECRET_BITS_MIN,
  SecretCharsetMode,
} from "@/lib/jwt/secretGenerator";

export function SecretPanel({ secret, onChange }: { secret: string; onChange: (secret: string) => void }) {
  const [mode, setMode] = useState<SecretCharsetMode>("standard");
  const [bits, setBits] = useState(SECRET_BITS_DEFAULT);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">HMAC secret</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={secret}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a secret, or generate one below"
          spellCheck={false}
          className={`${inputClasses} flex-1`}
        />
        <CopyButton text={secret} disabled={!secret} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded border border-zinc-300 p-2 dark:border-zinc-700">
        <button type="button" className={toggleButtonClasses(mode === "standard")} onClick={() => setMode("standard")}>
          Standard
        </button>
        <button type="button" className={toggleButtonClasses(mode === "enhanced")} onClick={() => setMode("enhanced")}>
          Enhanced
        </button>
        <label className="ml-1 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          Strength
          <input
            type="range"
            min={SECRET_BITS_MIN}
            max={SECRET_BITS_MAX}
            step={8}
            value={bits}
            onChange={(e) => setBits(Number(e.target.value))}
          />
          {bits} bits
        </label>
        <button type="button" className={toggleButtonClasses(false)} onClick={() => onChange(generateHmacSecret(bits, mode))}>
          Generate random secret
        </button>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Standard = letters + numbers only. Enhanced = adds special characters. Strength sets the generated secret&apos;s
        target entropy (default 256 bits).
      </p>
    </div>
  );
}
