import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { PayloadDirectionTabs } from "@/components/tools/payload-encoder/PayloadDirectionTabs";
import { PayloadEncoderTool } from "@/components/tools/payload-encoder/PayloadEncoderTool";

export const metadata: Metadata = {
  title: "Payload Encoder Online: Base64, Hex, URL, HTML Entity, ROT13, Binary",
  description:
    "Encode text as Base64, Hex, URL, HTML-entity, ROT13, or Binary: chain multiple steps together to build obfuscated payloads, free, entirely in your browser, no data leaves your device.",
};

export default function PayloadEncoderPage() {
  return (
    <ToolPageLayout
      title="Payload Encoder"
      description="Encode text as Base64, Hex, URL, HTML-entity, ROT13, or Binary. Chain multiple steps together (each step's output feeds the next) to build obfuscated payloads."
    >
      <PayloadDirectionTabs active="encode" />
      <Suspense fallback={null}>
        <PayloadEncoderTool direction="encode" />
      </Suspense>
    </ToolPageLayout>
  );
}
