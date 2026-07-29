import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { MagicDecoderTool } from "@/components/tools/magic-decoder/MagicDecoderTool";

export const metadata: Metadata = {
  title: "Magic Auto-Decoder: Detect and Unwrap Base64, Hex, ROT13, and More",
  description:
    "Paste an unknown obfuscated string and auto-detect the decoding chain: Base64, Hex, URL, HTML entity, ROT13, and Binary, up to 4 layers deep. Free, entirely in your browser.",
};

export default function MagicDecoderPage() {
  return (
    <ToolPageLayout
      title="Magic Auto-Decoder"
      description="Paste an obfuscated string and this tool tries common decodings (Base64, Hex, URL, HTML entity, ROT13, Binary) up to 4 layers deep, showing the exact chain it found so you can verify it yourself."
    >
      <Suspense fallback={null}>
        <MagicDecoderTool />
      </Suspense>
    </ToolPageLayout>
  );
}
