"use client";

import { ChangeEvent, RefObject } from "react";
import { Callout } from "@/components/ui/Callout";
import { Tooltip } from "@/components/ui/Tooltip";
import { dangerButtonClasses, iconButtonClasses, inputClasses, selectClasses, successButtonClasses } from "@/components/ui/formClasses";
import { MAX_CVSS_TITLE_LENGTH } from "@payloadify/cvss-core";
import { MAX_SAVED_CVSS_TEMPLATES, SAVED_CVSS_TEMPLATES_WARNING_THRESHOLD, SavedCvssTemplate } from "@/lib/storage/savedCvssTemplates";

export type StatusMsg = { type: "success" | "error"; message: string };

export function SavedTemplatesPanel({
  saveNameInput,
  onSaveNameChange,
  saveNamePlaceholder,
  onSave,
  saveStatus,
  savedTemplates,
  selectedSavedTemplate,
  savedMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onLoad,
  onDelete,
  onDeleteAll,
  onReset,
  onExport,
  onTriggerImport,
  onImportFile,
  importFileInputRef,
  importStatus,
  onOpenImportReportModal,
}: {
  saveNameInput: string;
  onSaveNameChange: (v: string) => void;
  saveNamePlaceholder: string;
  onSave: () => void;
  saveStatus: StatusMsg | null;
  savedTemplates: SavedCvssTemplate[];
  selectedSavedTemplate: SavedCvssTemplate | null | undefined;
  savedMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onLoad: (t: SavedCvssTemplate) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onReset: () => void;
  onExport: () => void;
  onTriggerImport: () => void;
  onImportFile: (e: ChangeEvent<HTMLInputElement>) => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  importStatus: StatusMsg | null;
  onOpenImportReportModal: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-sm font-medium">Save this score as</label>
          <input
            type="text"
            value={saveNameInput}
            onChange={(e) => onSaveNameChange(e.target.value)}
            placeholder={saveNamePlaceholder}
            maxLength={MAX_CVSS_TITLE_LENGTH}
            className={inputClasses}
          />
        </div>
        <button type="button" onClick={onSave} className={successButtonClasses}>
          Save This Template
        </button>
      </div>
      {saveStatus && (
        <Callout variant={saveStatus.type === "error" ? "danger" : "success"}>{saveStatus.message}</Callout>
      )}

      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Saved templates
          <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400">
            ({savedTemplates.length}/{MAX_SAVED_CVSS_TEMPLATES})
          </span>
          <Tooltip text={`Stored in this browser only, not synced across devices, and lost if you clear your cache. Use Export to back up. Limit: ${MAX_SAVED_CVSS_TEMPLATES} templates.`} />
        </label>
        {savedTemplates.length >= SAVED_CVSS_TEMPLATES_WARNING_THRESHOLD && savedTemplates.length < MAX_SAVED_CVSS_TEMPLATES && (
          <div className="mb-2">
            <Callout variant="warning">
              {`You've saved ${savedTemplates.length}/${MAX_SAVED_CVSS_TEMPLATES} templates. Export a backup soon (Export Templates below) in case you hit the limit.`}
            </Callout>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMenu}
              className={`${selectClasses} min-w-[220px] text-left`}
            >
              {selectedSavedTemplate ? selectedSavedTemplate.name : "Load a saved template"}
              <span className="float-right text-zinc-400">▾</span>
            </button>
            {savedMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
                <div className="absolute z-20 mt-1 max-h-64 w-full min-w-[280px] overflow-auto rounded border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  {savedTemplates.length === 0 && <p className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500">No saved templates yet.</p>}
                  {savedTemplates.map((t) => (
                    <div key={t.id} className="group flex items-center justify-between px-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <button type="button" onClick={() => onLoad(t)} className="min-w-0 flex-1 truncate px-2 py-1 text-left text-sm">
                        {t.name}
                      </button>
                      <span className="hidden shrink-0 items-center gap-1 pr-1 group-hover:flex">
                        <button
                          type="button"
                          onClick={() => onDelete(t.id)}
                          title="Delete"
                          aria-label={`Delete ${t.name}`}
                          className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <button type="button" onClick={onDeleteAll} disabled={savedTemplates.length === 0} className={dangerButtonClasses}>
            Delete All
          </button>
          <button type="button" onClick={onReset} title="Clears the current working state; does not delete any saved templates" className={iconButtonClasses}>
            Reset
          </button>
          <button type="button" onClick={onExport} disabled={savedTemplates.length === 0} className={iconButtonClasses}>
            Export Templates
          </button>
          <button type="button" onClick={onTriggerImport} className={iconButtonClasses}>
            Import Templates
          </button>
          <button type="button" onClick={onOpenImportReportModal} className={iconButtonClasses}>
            Import from Report/Text
          </button>
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
            className="hidden"
          />
        </div>
        {importStatus && (
          <div className="mt-2">
            <Callout variant={importStatus.type === "error" ? "danger" : "success"}>{importStatus.message}</Callout>
          </div>
        )}
      </div>
    </div>
  );
}
