/**
 * The one place currency is set. Switch symbol + locale (e.g. "$" / "en-US" with `short` K/M)
 * and every amount in the app follows. Data text uses ₹ directly.
 */
export const CURRENCY = {
  symbol: "₹",
  locale: "en-IN",
  /** Abbreviations, largest first: ₹1.24Cr, ₹3.1L, ₹46K. */
  short: [
    { at: 10_000_000, div: 10_000_000, suffix: "Cr" },
    { at: 100_000, div: 100_000, suffix: "L" },
    { at: 1_000, div: 1_000, suffix: "K", digits: 0 },
  ],
};

const nf = new Intl.NumberFormat(CURRENCY.locale, { maximumFractionDigits: 0 });

/** "₹12,400" (no paise). Negative numbers keep their sign after ₹ is stripped by callers. */
export function money(n: number) {
  return `${CURRENCY.symbol}${nf.format(Math.abs(Math.round(n)))}`;
}

/** Signed amount: "+₹2,100" / "−₹2,100". */
export function signedMoney(n: number) {
  return `${n < 0 ? "−" : "+"}${money(n)}`;
}

/** "₹1.24Cr" / "₹3.1L" / "₹46K". */
export function compactMoney(n: number, digits = 2) {
  const a = Math.abs(n);
  const s = CURRENCY.short.find((u) => a >= u.at);
  return s ? `${CURRENCY.symbol}${+(a / s.div).toFixed(s.digits ?? digits)}${s.suffix}` : money(a);
}

/** Insight amounts abbreviate from ₹10L. */
export function insightMoney(n: number) {
  return Math.abs(n) >= 1_000_000 ? compactMoney(n, 1) : money(n);
}

/** Split into whole rupees + paise for the "₹12,400.00" display. */
export function splitMinor(n: number) {
  const a = Math.abs(n);
  const whole = Math.floor(a);
  const minor = Math.round((a - whole) * 100);
  return { whole: `${CURRENCY.symbol}${nf.format(whole)}`, minor: `.${String(minor).padStart(2, "0")}` };
}
