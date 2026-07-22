import { TabSwitcher } from "@/components/ui/TabSwitcher";

const TABS = [
  { id: "encode", label: "Encode", href: "/payload-encoder" },
  { id: "decode", label: "Decode", href: "/payload-decoder" },
] as const;

export function PayloadDirectionTabs({ active }: { active: "encode" | "decode" }) {
  return <TabSwitcher tabs={TABS} active={active} />;
}
