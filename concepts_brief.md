# Case study: designing an alpha test harness for MunshiBook Lite

* **Author:** Manish Aswani
* **Date:** 2026-10-28
* **Format:** Product brief, stress-tested by six AI reviewers (design, codebase accuracy, scope, comprehension, implementation readiness, structure)

## The situation

MunshiBook Lite turns a small merchant's in-app payments into a daily profit figure, with no bookkeeping. The prototype has three screens: Home, Profit and Overview. Before building further, the team wanted evidence that merchants find it simple, useful and free of bookkeeping chores.

The test had to be unmoderated. Field agents would send each merchant a link over WhatsApp or email. The merchant opens it on their own phone, usually inside WhatsApp's or Gmail's built-in browser, with nobody watching.

The brief proposed adding four things to the prototype:

1. **Scenario links.** Each link drops the merchant into one prepared situation (a good day, a loss day, or a return after 7 days away).
2. **Event logging.** Taps and screen views sent to a remote store, tagged with merchant, session and scenario.
3. **A short feedback prompt** after the main task.
4. **Merchant-safe presentation.** Debug tools hidden, copy free of accounting jargon, and screens that look right on a real phone.

Three research questions:

* **Q1 – Trust (healthy day):** Do merchants finish the day without checking the figures first?
* **Q2 – Loss:** When the day is a loss, do merchants understand why and carry on, or leave?
* **Q3 – Gap (7 days away):** After a gap, do merchants deal with today first, or feel pushed into clearing a backlog?

## What the review found

The harness was buildable, but as first specified it would have collected a lot of data that did not answer Q1–Q3. The findings, most severe first:

### Blockers

1. **The measurements didn't match the questions.** Q1 used "time to tap Save today" as a proxy for trust, but no such button existed, the Profit page opened with 4 payments the merchant had to sort first, and coach marks opened on every screen. The timer would have measured sorting and reading tips, not trust. "Checking the figures" also had no single tap to detect. **Fix:** a one-page research table (see `ALPHA_PLAN.md`) listing, per question, the scenario, the events that count as yes or no, the feedback question, the threshold and the design decision it feeds.
2. **The loss scenario contradicted itself.** Home showed "Loss ₹2,400", one tap later Overview showed a profitable day, and the Profit page came to about +₹10.6k. **Fix:** one shared set of figures feeding every screen, now built.
3. **The gap scenario offered no choice to observe.** The returning-merchant cards offered only "Catch up", so Q3's behaviour couldn't happen. **Fix:** a new card with "Today" and "Catch up" side by side (still open).
4. **A reload lost who the merchant was.** In-app browsers often reload when the merchant switches back from a chat. **Fix:** read the link once, keep merchant, scenario and session in `sessionStorage`, and log a resumed session separately from a new one.
5. **There was no server to send events to.** The site is static files, so any analytics key would be public. **Fix chosen for the alpha:** a write-only spreadsheet web app, since the volume is small. This public build swaps it for a mock logger and an on-screen Analytics Inspector.
6. **A scenario was a bundle of settings the code couldn't express in one place.** **Fix:** one versioned `alphaScenarios.json` applied by a single `applyScenario(id)` (still open).

### Major risks

7. **Debug controls visible to merchants.** **Fixed:** the controls panel and the state gallery only appear with a debug key in the link, and debug sessions are tagged.
8. **Forwarded links and link previews corrupt data.** Chat apps and security scanners open links to build previews. Use opaque tokens, strip them from the address bar, and only start a session after the first tap.
9. **Events get lost on weak mobile networks.** Queue on the phone with sequence numbers, send in batches, flush when the page is hidden, and de-duplicate on arrival.
10. **The first screen undermined trust.** A "Business Overview Prototype" link preview, a fake status bar and fixed dates that made a 7-day gap look like two months. **Partly fixed:** preview title and status bar; relative dates still open.
11. **Merchants won't know what they're being asked to do.** A short intro screen: one instruction ("Pretend you own Dhaba Kitchen. Check how today went, then finish your day."), "This is not your account. Nothing you tap moves money.", and a consent line.
12. **Privacy law is the slowest dependency.** It needs a lawful basis, consent wording and a retention period under local data-protection law. Free-text answers are the largest exposure.
13. **"Rate 1–5" is ambiguous.** Ask one concrete question with labelled ends, once per session, after the main task.
14. **Changes mid-alpha mix versions.** Tag every event with build and scenario version, and freeze the link format before the first send.

### What held up

* One scenario per link matches how field agents already work.
* A small `track(event, props)` with a fixed event list can be built before the provider is chosen.
* The jargon audit is cheap and useful whatever happens to the rest.

## Scope

**In scope**
* Research table linking Q1–Q3 to scenarios, events, feedback questions and thresholds.
* Jargon audit of all merchant-facing copy, as the "before" baseline.
* Three scenario bundles whose data agrees across every screen.
* Link and session handling that survives reloads, with a scenario lock.
* Hidden debug mode, unlocked by a separate key.
* Event tracking with an offline queue.
* Intro screen, one feedback question, mobile fixes, and a dry run in the WhatsApp and Gmail in-app browsers.

**Out of scope**
* Merchants' own transaction data (a known limit that weakens Q1 and Q2).
* A custom event backend or dashboards.
* Page-exit detection as a primary metric.
* Several scenarios in one sitting.

## Alternatives weighed

* **Moderated sessions over WhatsApp video (5–8 merchants, think-aloud).** Kept as a strong candidate to run first: the cheapest way to learn *why* merchants act as they do. Paid research tools work poorly in in-app browsers and on patchy mobile data; plain video calls avoid that.
* **Ready-made analytics with session replay.** Kept if the alpha stays unmoderated; needs a privacy decision on third-party scripts.
* **A form tool for feedback.** Low effort, but merchants leave the app to answer. The in-app bottom sheet was built instead.
* **Custom event backend.** Rejected: costly, more privacy exposure, little value at a few thousand events.
* **A spreadsheet as the event store.** Accepted for alpha volume. Mocked in this public build.
* **Merchants' own data.** Rejected for this alpha: it needs data access beyond a prototype.
* **Letting merchants switch scenarios.** Rejected: it would reveal that the states are staged.

## Decisions still open

1. Moderated, unmoderated or hybrid.
2. Cohort size and a written threshold per question (below about 20 merchants, event counts are anecdotes).
3. Analytics provider, hosting and link expiry.
4. Privacy: lawful basis, consent, retention.
5. Token format and who keeps the token-to-merchant list.
6. Session rules: reloads, idle timeout, second devices.
7. Exact contents of each scenario bundle.
8. Event definitions: what counts as "finishing the day" and as "checking the figures".
9. Whether to pre-sort the uncategorised payments in alpha scenarios.
10. Whether the intro screen names the task.

## Build order

1. Research table and thresholds (`ALPHA_PLAN.md`). **Done**, thresholds pending.
2. Jargon audit. **Done** as a baseline.
3. Scenario bundles with agreeing data, the new gap card, link and session handling.
4. Event tracking and offline queue.
5. Feedback prompt. **Done** (Profit page A/B test; see the Analytics Inspector).
6. Provider, consent and intro screen.
7. Link generation for field agents and a dry run.
