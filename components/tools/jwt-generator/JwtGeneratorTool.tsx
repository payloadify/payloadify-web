"use client";

import { useCallback, useEffect, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { JsonEditor } from "@/components/ui/JsonEditor";
import { CopyField } from "@payloadify/cvss-core";
import { AlgorithmPicker } from "./AlgorithmPicker";
import { ClaimsHelper } from "./ClaimsHelper";
import { SecretPanel } from "./SecretPanel";
import { AsymmetricKeyMaterial, KeyPairPanel } from "./KeyPairPanel";
import { OutputPanel } from "./OutputPanel";
import { WeaknessFlags } from "./WeaknessFlags";
import { PresetPicker } from "./PresetPicker";
import { ReferencesPanel } from "./ReferencesPanel";
import { CopyAllPanel } from "./CopyAllPanel";
import { DecodeVerifyPanel } from "./DecodeVerifyPanel";
import { ALGORITHMS, JoseAlg } from "@/lib/jwt/algorithms";
import { applyAlgToHeaderJson, toNumericDate } from "@/lib/jwt/claims";
import { buildAndSignToken, SigningKeyMaterial } from "@/lib/jwt/generate";
import { computeGeneratorWeaknessFlags } from "@/lib/jwt/weaknessFlags";
import { getPreset } from "@/lib/jwt/presets";

const DEFAULT_ALG: JoseAlg = "HS256";

function defaultHeaderJson(alg: JoseAlg): string {
  return applyAlgToHeaderJson("", alg);
}

function defaultPayloadJson(): string {
  const now = toNumericDate(new Date());
  return JSON.stringify({ sub: "user-1234", iat: now, exp: now + 3600 }, null, 2);
}

export function JwtGeneratorTool() {
  const [alg, setAlg] = useState<JoseAlg>(DEFAULT_ALG);
  const [headerJson, setHeaderJson] = useState(() => defaultHeaderJson(DEFAULT_ALG));
  const [payloadJson, setPayloadJson] = useState(() => defaultPayloadJson());
  const [hmacSecret, setHmacSecret] = useState("");
  const [asymmetricKeys, setAsymmetricKeys] = useState<AsymmetricKeyMaterial | null>(null);
  const [outputToken, setOutputToken] = useState("");
  const [outputError, setOutputError] = useState<string | null>(null);

  const spec = ALGORITHMS[alg];

  function handleAlgChange(newAlg: JoseAlg) {
    setAlg(newAlg);
    setHeaderJson((prev) => {
      try {
        return applyAlgToHeaderJson(prev, newAlg);
      } catch {
        return defaultHeaderJson(newAlg);
      }
    });
    setAsymmetricKeys(null);
  }

  const handleAsymmetricKeysChange = useCallback((keys: AsymmetricKeyMaterial | null) => {
    setAsymmetricKeys(keys);
  }, []);

  function applyPreset(presetId: string) {
    const preset = getPreset(presetId);
    if (!preset) return;
    const now = toNumericDate(new Date());
    setAlg(preset.alg);
    setHeaderJson(JSON.stringify(preset.buildHeader(), null, 2));
    setPayloadJson(JSON.stringify(preset.buildPayload(now), null, 2));
    setAsymmetricKeys(null);
  }

  function loadDecodedToken({
    alg: newAlg,
    headerJson: h,
    payloadJson: p,
  }: {
    alg: JoseAlg;
    headerJson: string;
    payloadJson: string;
  }) {
    setAlg(newAlg);
    setHeaderJson(h);
    setPayloadJson(p);
    setAsymmetricKeys(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function sign() {
      let keyMaterial: SigningKeyMaterial;
      if (spec.family === "none") {
        keyMaterial = { kind: "none" };
      } else if (spec.family === "hmac") {
        if (!hmacSecret) {
          if (!cancelled) {
            setOutputToken("");
            setOutputError(null);
          }
          return;
        }
        keyMaterial = { kind: "hmac", secret: hmacSecret };
      } else {
        if (!asymmetricKeys) {
          if (!cancelled) {
            setOutputToken("");
            setOutputError(null);
          }
          return;
        }
        keyMaterial = { kind: "asymmetric", privateKey: asymmetricKeys.privateKey };
      }

      try {
        const token = await buildAndSignToken(headerJson, payloadJson, alg, keyMaterial);
        if (!cancelled) {
          setOutputToken(token);
          setOutputError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setOutputToken("");
          setOutputError(err instanceof Error ? err.message : "Could not build/sign the token");
        }
      }
    }

    sign();
    return () => {
      cancelled = true;
    };
  }, [alg, headerJson, payloadJson, hmacSecret, asymmetricKeys, spec.family]);

  let parsedHeader: Record<string, unknown> | null = null;
  let parsedPayload: Record<string, unknown> | null = null;
  try {
    parsedHeader = JSON.parse(headerJson || "{}");
  } catch {
    // JsonEditor shows its own parse error for the header field.
  }
  try {
    parsedPayload = JSON.parse(payloadJson || "{}");
  } catch {
    // JsonEditor shows its own parse error for the payload field.
  }

  const flags = computeGeneratorWeaknessFlags({ alg, header: parsedHeader, payload: parsedPayload, hmacSecret });

  const copyFields: CopyField[] = [
    ...(outputToken ? [{ id: "token", label: "Token", value: outputToken }] : []),
    { id: "header", label: "Header", value: headerJson },
    { id: "payload", label: "Payload", value: payloadJson },
    ...(outputToken ? [{ id: "signature", label: "Signature", value: outputToken.split(".")[2] ?? "" }] : []),
    ...(spec.family === "hmac" && hmacSecret ? [{ id: "secret", label: "Secret", value: hmacSecret }] : []),
    ...(asymmetricKeys ? [{ id: "publicKey", label: "Public key", value: asymmetricKeys.publicPem }] : []),
    ...(asymmetricKeys ? [{ id: "privateKey", label: "Private key", value: asymmetricKeys.privatePem }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Callout variant="warning">Use only on systems you own or are explicitly authorized to test.</Callout>

      <PresetPicker onApply={applyPreset} />

      <AlgorithmPicker alg={alg} onChange={handleAlgChange} />

      {spec.family === "hmac" && <SecretPanel secret={hmacSecret} onChange={setHmacSecret} />}
      {(spec.family === "rsa" || spec.family === "ec" || spec.family === "rsa-pss") && (
        <KeyPairPanel key={alg} alg={alg} onKeysChange={handleAsymmetricKeysChange} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <JsonEditor label="Header" value={headerJson} onChange={setHeaderJson} />
        <JsonEditor label="Payload" value={payloadJson} onChange={setPayloadJson} />
      </div>

      <ClaimsHelper payloadJson={payloadJson} onChange={setPayloadJson} />

      <WeaknessFlags flags={flags} />

      <OutputPanel token={outputToken} error={outputError} />

      {copyFields.length > 0 && <CopyAllPanel fields={copyFields} />}

      <ReferencesPanel />

      <DecodeVerifyPanel onLoadIntoGenerator={loadDecodedToken} />
    </div>
  );
}
