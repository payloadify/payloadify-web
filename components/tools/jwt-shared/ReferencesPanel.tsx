"use client";

import { ReferencesPanel as GenericReferencesPanel } from "@/components/ui/ReferencesPanel";
import { JWT_REFERENCES } from "@/lib/jwt/references";

const COLLAPSED_KEY = "payloadify:jwt:references-collapsed";

export function ReferencesPanel() {
  return <GenericReferencesPanel references={JWT_REFERENCES} storageKey={COLLAPSED_KEY} />;
}
