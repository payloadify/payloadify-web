"use client";

import { useEffect, useState } from "react";

export interface NavSection {
  id: string;
  label: string;
}

/** Tracks which section heading is currently active and whether `outputSectionId` is in view,
 *  via a single shared IntersectionObserver — used by both `SectionNav` (active-link highlight)
 *  and `StickySummaryBar` (show/hide) on the same page, so the two components don't each stand up
 *  their own observer. Long tool pages only (CVSS Calculator, MSFVenom Generator, Nmap Command Builder). */
export function useSectionTracking(sectionIds: string[], outputSectionId: string) {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const [outputVisible, setOutputVisible] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const outputEl = document.getElementById(outputSectionId);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.id === outputSectionId) {
            setOutputVisible(entry.isIntersecting);
          } else if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    if (outputEl) observer.observe(outputEl);

    return () => observer.disconnect();
  }, [sectionIds, outputSectionId]);

  return { activeId, outputVisible };
}

/** Slim horizontal row of anchor links jumping to each section's heading, with active-section
 *  highlighting. Smooth-scroll is gated behind `prefers-reduced-motion` in globals.css. */
export function SectionNav({ sections, activeId }: { sections: NavSection[]; activeId: string }) {
  return (
    <nav aria-label="Section navigation" className="mb-6 flex flex-wrap gap-x-4 gap-y-1 border-b border-zinc-200 pb-3 text-sm dark:border-zinc-800">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`payloadify-scroll-link rounded px-1 py-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 ${
            activeId === section.id
              ? "font-medium text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
