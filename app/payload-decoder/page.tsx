import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { PayloadDirectionTabs } from "@/components/tools/payload-encoder/PayloadDirectionTabs";
import { PayloadEncoderTool } from "@/components/tools/payload-encoder/PayloadEncoderTool";

export const metadata: Metadata = {
  title: "Payload Decoder Online: Base64, Hex, URL, HTML Entity, ROT13, Binary",
  description:
    "Decode Base64, Hex, URL, HTML-entity, ROT13, or Binary payloads: chain multiple steps together to unwrap obfuscated data, free, entirely in your browser, no data leaves your device.",
};

export default function PayloadDecoderPage() {
  return (
    <ToolPageLayout
      title="Payload Decoder"
      description="Decode Base64, Hex, URL, HTML-entity, ROT13, or Binary payloads. Chain multiple steps together (each step's output feeds the next) to unwrap obfuscated data."
    >
      <PayloadDirectionTabs active="decode" />
      <Suspense fallback={null}>
        <PayloadEncoderTool direction="decode" />
      </Suspense>
    </ToolPageLayout>
  );
}
