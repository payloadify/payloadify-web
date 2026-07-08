export type CvssVersion = "3.1" | "4.0";

export type SeverityRating = "None" | "Low" | "Medium" | "High" | "Critical";

export type Platform = "web" | "api" | "mobile" | "desktop-windows" | "desktop-mac" | "desktop-linux";

export interface PlatformOption {
  id: Platform;
  label: string;
}

export const PLATFORMS: PlatformOption[] = [
  { id: "web", label: "Web" },
  { id: "api", label: "API" },
  { id: "mobile", label: "Mobile" },
  { id: "desktop-windows", label: "Desktop (Windows)" },
  { id: "desktop-mac", label: "Desktop (macOS)" },
  { id: "desktop-linux", label: "Desktop (Linux)" },
];
