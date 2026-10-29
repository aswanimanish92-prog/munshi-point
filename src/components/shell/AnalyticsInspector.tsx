"use client";

import { useState } from "react";
import { Activity, X } from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { clearAnalyticsLog, useAnalyticsLog, VARIANTS, type AnalyticsRow, type VariantKey } from "@/lib/experiment";

const LETTER = Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [v.id, k])) as Record<string, VariantKey>;

function eventLabel(r: AnalyticsRow) {
  if (r.feedbackQuestion) return "Feedback answer";
  return r.completedFlow ? "Profit flow completed" : "Profit flow started";
}

/**
 * Shows what the mock logger has recorded on this device, so visitors can see how the A/B/C test is tracked.
 * Always available (not debug-only): a pill on phones, a panel beside the phone frame on desktop.
 */
export function AnalyticsInspector() {
  const { experiment } = useMockData();
  const rows = useAnalyticsLog();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-3 z-50 flex items-center gap-1.5 rounded-full border border-[#DCDCD6] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1D4FD7] shadow-md lg:bottom-4 lg:left-4"
      >
        <Activity className="size-3.5" />
        Analytics · {rows.length}
      </button>
    );
  }

  return (
    <aside
      aria-label="Analytics inspector"
      className="fixed inset-x-3 bottom-3 z-50 flex max-h-[70dvh] flex-col rounded-2xl border border-[#DCDCD6] bg-white text-[13px] text-[#3F4451] shadow-xl lg:sticky lg:inset-auto lg:top-10 lg:max-h-[844px] lg:w-[300px] lg:shadow-none"
    >
      <div className="flex items-center justify-between border-b border-[#ECECE8] p-4 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1D4FD7]">Analytics inspector</h2>
        <div className="flex items-center gap-3">
          <button onClick={clearAnalyticsLog} className="text-xs font-semibold text-[#5B6170] underline">
            Clear
          </button>
          <button onClick={() => setOpen(false)} aria-label="Close analytics inspector">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto p-4 pt-3">
        <p className="text-xs leading-relaxed text-[#5B6170]">
          Mock logger: nothing leaves this browser. Each visitor gets one of three Profit pages at random and keeps it. Starting
          the Profit flow, submitting it and answering the feedback questions each add a row here (also printed with{" "}
          <code>console.table</code>).
        </p>

        {experiment && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl bg-[#F6F6F3] p-3 text-xs">
            <dt className="text-[#5B6170]">Your variant</dt>
            <dd className="font-semibold">
              {experiment.variant} · {VARIANTS[experiment.variant].id}
              {experiment.pinned ? " (pinned by link)" : " (random)"}
            </dd>
            <dt className="text-[#5B6170]">Session</dt>
            <dd className="truncate font-mono">{experiment.sessionId.slice(0, 8)}</dd>
          </dl>
        )}

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#DCDCD6] p-3 text-xs text-[#5B6170]">
            No rows yet. Tap &ldquo;View details&rdquo; on the Home card to open the Profit page.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {[...rows].reverse().map((r, i) => (
              <li key={rows.length - i} className="rounded-xl border border-[#ECECE8] p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#16181D]">{eventLabel(r)}</span>
                  <span className="text-[#5B6170]">{new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                </div>
                <div className="mt-1 text-[#5B6170]">
                  Variant {LETTER[r.variant] ?? "?"} · {r.variant}
                  {r.debug && " · debug"}
                </div>
                {r.feedbackQuestion && (
                  <div className="mt-1.5">
                    {r.feedbackQuestion} <span className="font-semibold text-[#16181D]">→ {String(r.feedbackResponse)}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
