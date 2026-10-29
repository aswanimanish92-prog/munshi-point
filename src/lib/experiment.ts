"use client";

import { useSyncExternalStore } from "react";
import { readDebug } from "@/lib/debug";
import type { ProfitLayout } from "@/types/mockData";

/** The three Profit pages under test. Merchants are split evenly and keep their page on this device. */
export const VARIANTS = {
  A: { id: "profit_page_test", route: "/profit" },
  B: { id: "profit_page_1", route: "/profit-test1" },
  C: { id: "profit_page_2", route: "/profit-test2" },
} as const;

export type VariantKey = keyof typeof VARIANTS;
export type VariantId = (typeof VARIANTS)[VariantKey]["id"];

export interface Experiment {
  sessionId: string;
  variant: VariantKey;
  /** Set by a /0, /1 or /2 link this session: the variant was chosen, not randomised. */
  pinned: boolean;
}

/** One analytics row. Flow start, flow completion and each feedback answer each send one. */
export interface AnalyticsRow {
  timestamp: string;
  sessionId: string;
  variant: VariantId;
  feedbackQuestion: string | null;
  /** A number for the Profit-flow questions; the chosen mode id for the Home timeframe question. */
  feedbackResponse: number | string | null;
  completedFlow: boolean;
  /** Team sessions opened with ?debug=, so they can be filtered out of the results. */
  debug: boolean;
}

const VARIANT_KEY = "Munshipoint_variant"; // localStorage: same page on every visit
const SESSION_KEY = "Munshipoint_session"; // sessionStorage: one id per browser session
const PINNED_KEY = "Munshipoint_pinned"; // sessionStorage: variant came from a /0, /1 or /2 link
const LOG_KEY = "Munshipoint_analytics_log"; // localStorage: rows shown in the Analytics Inspector

/** Assigned variant and session id. null during the static prerender. */
export function useExperiment(): Experiment | null {
  return useSyncExternalStore(subscribe, readExperiment, () => null);
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Replaces the random assignment with `variant`, on this device from now on. */
export function pinVariant(variant: VariantKey) {
  safeSet(localStorage, VARIANT_KEY, variant);
  safeSet(sessionStorage, PINNED_KEY, "1");
  resolved = { ...readExperiment(), variant, pinned: true };
  listeners.forEach((fn) => fn());
}

let resolved: Experiment | undefined;

/** Reads or creates the assignment once per page load; later calls return the cached object. */
function readExperiment(): Experiment {
  if (resolved) return resolved;
  let variant = safeGet(localStorage, VARIANT_KEY) as VariantKey | null;
  if (!variant || !(variant in VARIANTS)) {
    const keys = Object.keys(VARIANTS) as VariantKey[];
    variant = keys[Math.floor(Math.random() * keys.length)];
    safeSet(localStorage, VARIANT_KEY, variant);
  }
  let sessionId = safeGet(sessionStorage, SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    safeSet(sessionStorage, SESSION_KEY, sessionId);
  }
  return (resolved = { sessionId, variant, pinned: safeGet(sessionStorage, PINNED_KEY) === "1" });
}

/** Short links that pin a variant: /0 → A, /1 → B, /2 → C. */
export const PIN_LINKS = { "0": "A", "1": "B", "2": "C" } as const satisfies Record<string, VariantKey>;

/** The variant a Profit layout belongs to. Debug sessions can open any layout, so log what was seen. */
export function variantForLayout(layout: ProfitLayout): VariantId {
  if (layout === "test1") return VARIANTS.B.id;
  if (layout === "test2") return VARIANTS.C.id;
  return VARIANTS.A.id;
}

/** True the first time `step` is claimed this session, so starts, completions and feedback log once. */
export function claimOnce(step: "started" | "completed" | "feedback"): boolean {
  const key = `Munshipoint_${step}`;
  if (safeGet(sessionStorage, key)) return false;
  safeSet(sessionStorage, key, "1");
  return true;
}

/**
 * Mock analytics: no network. Each row is printed with console.table and kept on this device
 * (newest last) so the Analytics Inspector can show how the A/B/C test is tracked.
 */
export function logRow(row: Omit<AnalyticsRow, "timestamp" | "sessionId" | "debug">) {
  const full: AnalyticsRow = { timestamp: new Date().toISOString(), sessionId: readExperiment().sessionId, debug: readDebug(), ...row };
  console.table([full]);
  writeAnalyticsLog([...readAnalyticsLog(), full]);
}

const NO_ROWS: AnalyticsRow[] = [];
let cachedRows: AnalyticsRow[] | undefined;

function readAnalyticsLog(): AnalyticsRow[] {
  if (cachedRows) return cachedRows;
  try {
    cachedRows = JSON.parse(safeGet(localStorage, LOG_KEY) ?? "[]");
  } catch {
    cachedRows = [];
  }
  return cachedRows!;
}

function writeAnalyticsLog(rows: AnalyticsRow[]) {
  cachedRows = rows;
  safeSet(localStorage, LOG_KEY, JSON.stringify(rows));
  listeners.forEach((fn) => fn());
}

/** Rows logged on this device; empty during the static prerender. */
export function useAnalyticsLog(): AnalyticsRow[] {
  return useSyncExternalStore(subscribe, readAnalyticsLog, () => NO_ROWS);
}

export function clearAnalyticsLog() {
  writeAnalyticsLog([]);
}

function safeGet(store: Storage, key: string) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the assignment lasts until the next reload.
  }
}
