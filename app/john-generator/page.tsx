import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { JohnGeneratorTool } from "@/components/tools/john-generator/JohnGeneratorTool";

export const metadata: Metadata = {
  title: "John the Ripper Command Generator: Build John Commands in One Click",
  description:
    "Build a complete John the Ripper command: format, crack mode (wordlist, single, incremental, mask, external), rules, and advanced flags. Then copy it straight into your terminal. Free, entirely in your browser.",
};

export default function JohnGeneratorPage() {
  return (
    <ToolPageLayout
      title="John the Ripper Command Generator"
      description="Pick a John the Ripper format and crack mode, fill in your wordlist/mask/rules, and get a copy-ready john command. No more remembering flag order yourself. Comes pre-filled with the format when you arrive from the Hash Identifier."
    >
      <Suspense fallback={null}>
        <JohnGeneratorTool />
      </Suspense>
    </ToolPageLayout>
  );
}
