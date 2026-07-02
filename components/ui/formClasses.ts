export const toggleButtonClasses = (active: boolean) =>
  `rounded border px-3 py-1.5 text-sm ${
    active
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
  }`;

export const selectClasses =
  "rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const inputClasses =
  "w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const iconButtonClasses =
  "rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-600 hover:border-zinc-400 disabled:opacity-30 disabled:hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:disabled:hover:border-zinc-700";

export const checkboxLabelClasses = "flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400";
