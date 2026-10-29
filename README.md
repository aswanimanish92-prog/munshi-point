# MunshiPoint — AI-Assisted SMB Bookkeeping & Profit Intelligence Prototype

A public **AI product management and rapid prototyping case study**. MunshiPoint is a fictional payments app for small merchants. Its bookkeeping layer, **MunshiBook Lite**, turns the payments a shop already receives into one answer: *how much did I make?* **MAI** (Munshi AI Assistant) says it in one line.

> All brands, businesses, people, account numbers and transactions are fictional or synthetic. Analytics are mocked: nothing leaves your browser.

---

## The product challenge

### Bookkeeping fatigue
Small merchants such as kirana stores, dhabas and beauty parlours know roughly what came in, but rarely what they *kept*. Notebooks and spreadsheets ask for daily effort, and the effort rarely pays off on the day. Most merchants stop within a week, so the daily profit habit never forms.

### Cold start vs. habit loop
The obvious headline is **month-to-date profit**. It's the number leadership asked for, and it's right for an established merchant. For a merchant who has logged only **2 days**, it misleads:

- "Your October profit: ₹21,000" really means "2 days of profit", but reads as the whole month.
- Compared with a full previous month, it looks like a collapse.
- The merchant loses trust in the number before the habit has a chance to form.

**Today's profit** is honest and actionable for a new merchant, but undersells the progress of someone with 20 logged days. Neither view is right for everyone.

### How the prototype resolves it
**1. An adaptive Business overview card (progressive disclosure).**
The Home card picks its timeframe from where the merchant is in their lifecycle:
- **Under 5 logged days:** it leads with **Today**, with "across the 2 days you've recorded" as secondary context.
- **5 or more days:** it leads with **This month (till now)**.
- **A pill (`Today | This month`)** lets the merchant switch at any time.
- **One shared set of figures** feeds every screen. A new merchant's "month" is only their logged days, everywhere, with no misleading comparison.

**2. MAI asks once, at the right moment (first-tap preference capture).**
The first time a merchant taps through from the profit card, MAI asks one question: *which view do you want to see?* The answer:
- is saved on the device,
- re-animates the card,
- updates MAI's one-line summary under the card,
- and is logged as a research signal.

The disagreement between leadership and product becomes evidence from merchants instead of an internal debate.

---

## Key product capabilities built

### Multi-state Business overview card
- **55 designed states:** new user (nothing to reveal yet), healthy day, **loss day** ("Loss ₹2,400" in muted red, never a bare minus), **missed days** and streak at risk, "just updated", error and cached states, very large amounts, and more.
- **Two tap zones:** the eye reveals the amount in place, and the rest of the card drills into the Business overview on the matching tab.
- **Privacy:** the amount follows the wallet's privacy mask.
- **Live count-up animation:** after a profit review is submitted, and whenever the timeframe changes.

### Sticky A/B/C experimentation engine
- **Three Profit review designs:**
  - **A:** month-to-date header with breakdown
  - **B:** blue header with month-to-date and "vs last month"
  - **C:** illustrated hero with breakdown
- **Sticky assignment:** each visitor is randomly given one design, which is saved on the device so every return visit shows the same flow.
- **Pinned links:** `/0`, `/1` and `/2` force design A, B or C for walkthroughs.
- **In-flow pulse survey:** after the merchant submits, two questions appear one at a time:
  - an **NPS-style** "How likely are you to recommend this?" (1–10)
  - a **daily habit** score, "How likely are you to do this every day?" (5-point scale)
- **Analytics Inspector:** an on-screen panel showing the visitor's assigned variant, session, and every logged event (flow started, flow completed, survey answers). Events are also printed with `console.table`.

### Catch-up queue and guided walkthroughs
- **Catch-up:** a queue for backfilling missed days one at a time, framed as "catch up in 2 minutes" rather than a pile of overdue chores.
- **Guided walkthroughs:** coach-mark walkthroughs on Home, Profit and Overview explain each part of the screen in plain language. The copy follows the merchant's chosen timeframe and lifecycle.
- **Jargon audit:** a separate audit lists accounting terms to replace with merchant language (see [`ALPHA_PLAN.md`](ALPHA_PLAN.md)).

### Scenario switcher ("god mode")
- **Controls panel:** a built-in panel switches in real time between every card state, Business overview scenario, Profit layout, timeframe mode and merchant lifecycle (new user with 2 days vs. established with 20 days).
- **Demo bar:** resets the first-tap question and tallies the answers given.
- **State gallery:** `/states` renders every card and blue-card state on one page through the same transforms Home uses.
- **Access:** god mode is always on in development. In a production build it only unlocks with a `?debug=<key>` link, so a merchant never sees it.

---

## How this was built: an AI-native workflow

The prototype was specified, built and stress-tested with **Claude Code**, using a two-layer memory approach so the agent stayed consistent across many sessions.

| Layer | What it holds | Where it lives |
|---|---|---|
| **Elephant** (long-term) | Domain rules that must never drift, such as "every profit surface reads one resolved timeframe; never hard-code *Today*", the card anatomy, and the analytics contract | [`SPEC.md`](SPEC.md), [`CLAUDE.md`](CLAUDE.md), and the agent's persistent project memory |
| **Goldfish** (working state) | The live checklist: what's built, what's open, what's still static | [`TASKS.md`](TASKS.md), updated at the end of every task |

Other parts of the workflow:
- **One data source.** `CLAUDE.md` requires that every screen reads from and writes to a single mock-data context (`src/context/MockDataContext.tsx`). Combined with one shared figures layer (`src/lib/figures.ts`), Home, Profit review and Business overview show the **same numbers**: recategorising one payment updates all three.
- **AI review of the research plan.** The alpha-test brief ([`concepts_brief.md`](concepts_brief.md)) was reviewed by six AI reviewers, each looking from a different angle (design, codebase accuracy, scope, comprehension, implementation readiness, structure). That review turned vague goals into a measurable research table ([`ALPHA_PLAN.md`](ALPHA_PLAN.md)).
- **The checklist is honest about gaps.** [`TASKS.md`](TASKS.md) lists what is still static (some charts and the weekly early-days cards) and what is planned next (relative dates, a MAI chat drawer, a returning-merchant card).

---

## Live demo routes

| Route | What you'll see |
|---|---|
| `/` | Home: wallet, the adaptive Business overview card, MAI, Services |
| `/exec-demo` | A frozen copy of Home for leadership demos; stays fixed while `/` changes |
| `/0` | Home, pinned to Profit review design **A** for the whole flow |
| `/1` | Home, pinned to Profit review design **B** for the whole flow |
| `/2` | Home, pinned to Profit review design **C** for the whole flow |
| `/overview` | Business overview: Today / This week / This month, money in and out, insights, streak |
| `/catch-up` | Catch-up queue for missed days |
| `/profit` | Profit review (sends you to your assigned design) |
| `/states` | Gallery of every card state (god mode only) |

**Suggested walkthrough:**
1. Open `/1` and tap **View details** on the Home card.
2. Sort the uncategorised payments and submit.
3. Watch Home count up.
4. Open **Overview** to answer the pulse survey.
5. Open the **Analytics** pill to see what was logged.

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000, god mode on
npm run build      # static export to ./out
```

| Setting | Purpose |
|---|---|
| `NEXT_PUBLIC_DEBUG_KEY` (optional, build time) | Unlocks god mode in a production build via `?debug=<key>` |
| `CURRENCY` in `src/lib/format.ts` | Currency symbol, locale and short forms (currently ₹ / en-IN / K, L, Cr) |

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
