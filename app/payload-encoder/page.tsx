import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { PayloadEncoderTool } from "@/components/tools/payload-encoder/PayloadEncoderTool";

export const metadata: Metadata = {
  title: "Payload Encoder/Decoder — Base64, Hex, URL, HTML Entity, Unicode",
  description:
    "Chain Base64, Hex, URL, HTML-entity, and Unicode escape encoding and decoding steps together to build or unwrap obfuscated payloads — free, runs entirely in your browser, no data leaves your device.",
};

export default function PayloadEncoderPage() {
  return (
    <ToolPageLayout
      title="Payload Encoder / Decoder"
      description="Chain Base64, Hex, URL, HTML-entity, and Unicode escape steps together — each step's output feeds the next — to build or unwrap obfuscated payloads."
    >
      <PayloadEncoderTool />
    </ToolPageLayout>
  );
}
