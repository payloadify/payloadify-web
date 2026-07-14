"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChangelogModal } from "@/components/site/ChangelogModal";
import { getLatestChangelogDate } from "@/lib/changelog/entries";
import { useChangelogLastSeen, useHasUnseenChangelog } from "@/lib/storage/changelogSeen";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const latestDate = getLatestChangelogDate();
  const hasUnseen = useHasUnseenChangelog(latestDate);
  const [, markSeen] = useChangelogLastSeen();

  useFocusTrap(menuRef, menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function openChangelog() {
    setOpen(true);
    markSeen(latestDate);
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-zinc-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/android-chrome-192x192.png"
            alt="Payloadify logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "#F5F5F5" }}
          >
            Payloadify
          </span>
          <span
            className="hidden sm:inline text-sm"
            style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#8A8A8A" }}
          >
            &gt;_generate.exploit.learn
          </span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm text-zinc-400 sm:flex">
          <Link href="/about" className="rounded-md px-3 py-2 hover:bg-zinc-800/60 hover:text-zinc-100">
            About
          </Link>
          <button
            type="button"
            onClick={openChangelog}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="relative rounded-md px-3 py-2 hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            Changelog
            {hasUnseen && (
              <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            )}
            <span className="sr-only">{hasUnseen ? " (new entries)" : ""}</span>
          </button>
          <Link href="/" className="rounded-md px-3 py-2 hover:bg-zinc-800/60 hover:text-zinc-100">
            All tools
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-label="Open menu"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 sm:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {hasUnseen && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-full w-64 max-w-[80vw] flex-col border-l border-zinc-800 bg-zinc-950 p-4 shadow-xl outline-none"
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="text-sm font-semibold tracking-tight text-zinc-100"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col text-sm text-zinc-400">
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-3 hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                About
              </Link>
              <button
                type="button"
                onClick={openChangelog}
                aria-haspopup="dialog"
                className="relative flex min-h-[44px] items-center rounded-md px-3 text-left hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                Changelog
                {hasUnseen && (
                  <span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                )}
              </button>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-3 hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                All tools
              </Link>
            </nav>
          </div>
        </div>
      )}

      {open && <ChangelogModal onClose={() => setOpen(false)} />}
    </header>
  );
}
