"use client";

import { useMemo, useState } from "react";
import { iconButtonClasses, inputClasses, selectClasses } from "@/components/ui/formClasses";
import { HostValidation, isValidPort, validateLhost } from "@/lib/msfvenom/validation";
import { SavedListener, useSavedListeners } from "@/lib/storage/savedListeners";

const SAVED_LISTENERS_KEY = "payloadify:msfvenom-generator:saved-listeners";

export function ListenerPanel({
  lhost,
  lportText,
  port,
  hostValidation,
  portValid,
  onLhostChange,
  onLportTextChange,
}: {
  lhost: string;
  lportText: string;
  port: number;
  hostValidation: HostValidation;
  portValid: boolean;
  onLhostChange: (v: string) => void;
  onLportTextChange: (v: string) => void;
}) {
  // useSyncExternalStore's getServerSnapshot always returns [] (matching the server-rendered
  // HTML), so hydration can't mismatch even though this list is rendered directly into <option>
  // elements — unlike other component-local state, which never reaches the DOM.
  const {
    listeners: savedListeners,
    save: saveListener,
    remove: removeListener,
    removeAll: removeAllListeners,
    update: updateListener,
  } = useSavedListeners(SAVED_LISTENERS_KEY);
  const [selectedListenerId, setSelectedListenerId] = useState("");
  const [saveNameInput, setSaveNameInput] = useState("");
  const [listenerMenuOpen, setListenerMenuOpen] = useState(false);
  const [editingListener, setEditingListener] = useState<SavedListener | null>(null);
  const [editName, setEditName] = useState("");
  const [editLhost, setEditLhost] = useState("");
  const [editLportText, setEditLportText] = useState("");

  function loadListener(id: string) {
    setSelectedListenerId(id);
    const l = savedListeners.find((x) => x.id === id);
    if (l) {
      onLhostChange(l.lhost);
      onLportTextChange(String(l.lport));
    }
    setListenerMenuOpen(false);
  }

  function saveCurrentListener() {
    if (!hostValidation.ok || !portValid) return;
    const trimmedHost = lhost.trim();
    const label = saveNameInput.trim() || `${trimmedHost}:${lportText.trim()}`;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    saveListener({ id, label, lhost: trimmedHost, lport: port });
    setSaveNameInput("");
  }

  function deleteListener(id: string) {
    removeListener(id);
    if (selectedListenerId === id) setSelectedListenerId("");
  }

  function deleteAllListeners() {
    if (savedListeners.length === 0) return;
    const confirmed = window.confirm(`Delete all ${savedListeners.length} saved listeners? This cannot be undone.`);
    if (!confirmed) return;
    removeAllListeners();
    setSelectedListenerId("");
  }

  function openEditListener(l: SavedListener) {
    setEditingListener(l);
    setEditName(l.label);
    setEditLhost(l.lhost);
    setEditLportText(String(l.lport));
    setListenerMenuOpen(false);
  }

  function closeEditListener() {
    setEditingListener(null);
  }

  const editHostValidation = useMemo(() => validateLhost(editLhost), [editLhost]);
  const editPort = Number(editLportText);
  const editPortValid = editLportText.trim().length > 0 && isValidPort(editPort);

  function saveEditedListener() {
    if (!editingListener || !editHostValidation.ok || !editPortValid) return;
    const trimmedHost = editLhost.trim();
    const label = editName.trim() || `${trimmedHost}:${editLportText.trim()}`;
    updateListener(editingListener.id, { label, lhost: trimmedHost, lport: editPort });
    if (selectedListenerId === editingListener.id) {
      onLhostChange(trimmedHost);
      onLportTextChange(String(editPort));
    }
    setEditingListener(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-sm font-medium">Save this listener as</label>
          <input
            type="text"
            value={saveNameInput}
            onChange={(e) => setSaveNameInput(e.target.value)}
            placeholder={lhost && lportText ? `${lhost}:${lportText}` : "e.g. prod-listener"}
            className={inputClasses}
          />
        </div>
        <button
          type="button"
          onClick={saveCurrentListener}
          disabled={!hostValidation.ok || !portValid}
          className={iconButtonClasses}
        >
          Save This Listener
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Saved listeners</label>
        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
          Saved listeners are stored in your browser only. They&apos;ll persist across refreshes, but won&apos;t sync across devices or browsers.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setListenerMenuOpen((open) => !open)}
              className={`${selectClasses} min-w-[220px] text-left`}
            >
              {savedListeners.find((l) => l.id === selectedListenerId)?.label ?? "(Load a saved listener)"}
              <span className="float-right text-zinc-400">▾</span>
            </button>
            {listenerMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setListenerMenuOpen(false)} />
                <div className="absolute z-20 mt-1 max-h-64 w-full min-w-[280px] overflow-auto rounded border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => loadListener("")}
                    className="block w-full px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    (None selected)
                  </button>
                  {savedListeners.length === 0 && (
                    <p className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500">No saved listeners yet.</p>
                  )}
                  {savedListeners.map((l) => (
                    <div
                      key={l.id}
                      className="group flex items-center justify-between px-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <button
                        type="button"
                        onClick={() => loadListener(l.id)}
                        className="min-w-0 flex-1 truncate px-2 py-1 text-left text-sm"
                      >
                        {l.label}{" "}
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {l.lhost}:{l.lport}
                        </span>
                      </button>
                      <span className="hidden shrink-0 items-center gap-1 pr-1 group-hover:flex">
                        <button
                          type="button"
                          onClick={() => openEditListener(l)}
                          title="Edit"
                          aria-label={`Edit ${l.label}`}
                          className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteListener(l.id)}
                          title="Delete"
                          aria-label={`Delete ${l.label}`}
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
          <button
            type="button"
            onClick={deleteAllListeners}
            disabled={savedListeners.length === 0}
            className={iconButtonClasses}
          >
            Delete All
          </button>
        </div>
      </div>

      {editingListener && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded border border-zinc-300 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Edit Saved Listener</h3>
              <button type="button" onClick={closeEditListener} aria-label="Close" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">LHOST</label>
                <input type="text" value={editLhost} onChange={(e) => setEditLhost(e.target.value)} className={inputClasses} />
                {editLhost.length > 0 && !editHostValidation.ok && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{editHostValidation.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">LPORT</label>
                <input
                  type="number"
                  min={1}
                  max={65535}
                  value={editLportText}
                  onChange={(e) => setEditLportText(e.target.value)}
                  className={`${selectClasses} w-full`}
                />
                {editLportText.length > 0 && !editPortValid && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Enter a port between 1 and 65535.</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={closeEditListener} className={iconButtonClasses}>
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedListener}
                disabled={!editHostValidation.ok || !editPortValid}
                className={iconButtonClasses}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
