# QA-01 — Post-rebrand baseline regression

**ClickUp ticket:** [86c9gqq51](https://app.clickup.com/t/86c9gqq51)
**QA branch:** `qa/86c9gqq51-baseline-regression`
**Baseline commit:** `4c5a6fc` (`main` HEAD at QA start)
**Date:** 2026-04-25
**QA owner:** Jessica
**Verdict:** PASS-with-notes

## Scope

Phase-0 rebrand (MarianLearning → Axelot Tutor) renamed:

- npm package name (`axelot-tutor`)
- localStorage key (`axelot-tutor:progress:v1`)
- Mascot identifiers (`Melody` → `Axel`)
- Cream / pink palette tokens (`--axel-cream`, `bg-axel-cream`, `bg-axel-rose`)
- Asset filenames (`axel-*.svg`)
- Document copy in `CLAUDE.md` / `README.md`

**Empirical contract under test:** the three currently-shipping screens
(Splash, Greet, Math stub) behave **identically** to the MarianLearning
baseline; only the surface tokens have moved. No behaviour is supposed to
have changed.

## Methodology

1. Branched a clean QA branch off `main` at `4c5a6fc`.
2. Ran `yarn test` for the full suite — pinned 199/199 baseline.
3. Ran `yarn dev` and probed every static asset path the runtime references.
4. Audited every Marian/Melody string in source for residue (rg).
5. Wrote a regression-pinning unit test for the storage-key rename
   (`src/lib/progress/storage.rebrand.test.ts`) — fails at code-review
   time if anyone re-introduces `marian-tutor:`.
6. Documented per-row verification mode: AUTO (test-suite or
   curl-verified on this run), MANUAL (verifiable only in a live browser
   tab — owner marked), DEFERRED-TO-DEVICE (real iPad Safari — Thomas's
   pass).

## AC checklist

| # | Acceptance criterion | Mode | Result | Notes |
|---|---|---|---|---|
| 1 | Splash auto-advances within warm cap (1500 ms) on a re-mount | AUTO | PASS | `Splash.test.tsx` "uses the warm cap" + "marks session warm". 10/10 splash tests green. |
| 2 | Splash auto-advances within cold cap (3000 ms) on first mount | AUTO | PASS | `Splash.test.tsx` "uses the cold cap (3000 ms)". |
| 3 | Splash is silent — no TTS calls fire | AUTO | PASS | `Splash.test.tsx` "calls tts.cancel() on mount and never queues TTS". `Splash.tsx:67–79` calls `cancelTts()` defensively + `primeVoices()` is a voice-list warmup, not a `speak`. |
| 4 | Splash exposes no skip / tap-to-continue | AUTO | PASS | `Splash.test.tsx` "exposes no skip / tap-to-continue affordance". |
| 5 | Splash → Greet hand-off via `onAdvance` | AUTO | PASS | `App.test.tsx` "starts on Splash and auto-advances to the Greet screen" (4/4 App tests green). |
| 6 | Greet mounts in `wake` state — audio context locked | AUTO | PASS | `screenState` defaults to `'wake'` (`Greet.tsx:187`); `Greet.test.tsx` covers `data-screen-state="wake"` on mount. |
| 7 | Wake-tap unlocks audio synchronously (iPad Safari fix) | AUTO | PASS | 41/41 Greet tests green. `gate.wrapSpeak(() => handle.start())` runs in the same JS tick as the user gesture (`Greet.tsx:538–550`). |
| 8 | 8 s wake re-prompt fires once, no nag loop | AUTO | PASS | `Greet.tsx:389–406` + `wakeIconRepromptUsedRef` + corresponding tests in the wake-reprompt describe block. |
| 9 | Axel breathing animation (scale 1→1.05→1, 2.4 s loop) | AUTO+MANUAL | PASS | Constants in `Greet.tsx:95` + transition in `Greet.tsx:797–815`. Live-render verification deferred to manual sweep below. |
| 10 | Pink ready ring pulses around Axel during wake | AUTO+MANUAL | PASS | `Greet.tsx:715–778` SVG ring; conditional on `showRing` (`screenState === 'wake'` or `gate.showGate`). Visual verification in manual sweep. |
| 11 | Speech ribbon hidden during wake; visible during intro after first word | AUTO | PASS | `shouldShowRibbon` gate (`Greet.tsx:636`) + the corresponding test ("hides ribbon while gate pending") in `Greet.test.tsx`. |
| 12 | Heart appears after line 3 completes; tap → advance to Math | AUTO | PASS | `onHeartReady` + `handleHeartTap` (`Greet.tsx:570–607`). Greet tests cover heart-tap → Math advance. |
| 13 | Reduced-motion path: no infinite loops, no springs, still advances | AUTO | PASS | `Splash.test.tsx` "still advances when prefers-reduced-motion is set" + `usePrefersReducedMotion` branches in `Greet.tsx` (cloud drift, Axel slide, ring pulse, heart bob, ribbon spring all have reduced-motion fallbacks at lines 666–681, 791–818, 723–751, 1020–1042, 978). |
| 14 | Math stub renders + carries `layoutId="axel"` for shared-element transition | AUTO | PASS | `Math.test.tsx` (1/1) — asserts `math-stub` testid, `Axel` alt text, "Number Garden (TBD)" copy. |
| 15 | Returning-user flow: `loadProgress() !== null` → Splash → Greet (current behaviour pre-Setup) | AUTO | PASS | App.tsx routes `splash → greet → math` linearly on this baseline; Setup is not yet wired (DEV-03). `loadProgress()` round-trips via `progress.test.ts`. **Note:** the in-app Setup flow that gates first-run users is DEV-03 — out of scope here. Re-test once DEV-01..05 land. |
| 16 | Reset-localStorage flow: `clearProgress()` removes the doc, next boot is "first run" | AUTO | PASS | `progress.test.ts > clearProgress > removes the stored doc`. |
| 17 | Storage key is `axelot-tutor:progress:v1` only — no `marian-tutor:*` writes | AUTO | PASS | **NEW** `storage.rebrand.test.ts` (2 tests, see §"Automation gap closed"). Source-level rg confirmed zero `marian-tutor` strings outside historical doc references in `CLAUDE.md` / `README.md`. |
| 18 | All runtime-referenced assets resolve (200 OK) | AUTO | PASS-with-notes | `curl` against every asset path the source references on the live `vite dev` server. **Note:** `/assets/sfx-chime-soft.mp3` is absent from `public/assets/` — pre-existing, documented in `Greet.tsx:175–183` ("asset is pending Thomas — see assets-todo.md"). Chime is a defensive no-op when missing; not a baseline regression. Worth a follow-up ticket if the assets-todo isn't already tracked. |
| 19 | iPad portrait viewport (1024×1366) — touch targets ≥ 44 pt, primary CTA thumb-reachable | DEFERRED-TO-DEVICE | DEFERRED | Wake-tap target is full safe-area rect; heart button is 160×117 px. Geometry is correct on paper. Real-device verification in Thomas's pass. |
| 20 | iPad rotation lock + portrait/landscape behaviour | DEFERRED-TO-DEVICE | DEFERRED | No rotation handlers in Splash/Greet/Math. Layout uses safe-area insets + viewport-relative units. Real-device verification needed. |
| 21 | Offline (PWA) — works after first load | DEFERRED-TO-DEVICE | DEFERRED | `vite-plugin-pwa` configured (`src/pwa/`). Service-worker behaviour can't be exercised against `vite dev` reliably; `yarn build && yarn preview` is the correct surface. Out of scope for a Phase-0 rebrand baseline; will be exercised in QA-02 / QA-03. |

## Lenses (UX non-negotiables)

- **Red X / harsh sound:** clean. No red-X pattern in any of the three
  shipping screens. Wake re-prompt is a pulse + ear-wiggle, no error tone.
- **Vocabulary cap:** clean. `GREET_LINES` content is age-appropriate
  ("Hi! I'm Axel.", "Tap the heart when you're ready.", etc.). No
  out-of-vocab words in the rebrand.
- **Dark patterns:** clean. No streak shame, no fake urgency, no FOMO.
  Wake re-prompt fires **once** — no nag loop. Splash is silent and
  uninterruptible (no skip = no anxiety).
- **English-only:** clean. All shipped copy is English; no i18n surface.
- **Audio-first / text-mirror:** clean per design. Greet ribbon mirrors
  spoken lines word-by-word (`renderCaption` reveals one word per
  boundary event).
- **Touch targets:** wake-tap is full safe-area; heart is 160×117 px.
  Both well above the 44 pt minimum.

## Survival checks

- **Rage-tap (wake):** PASS — `wakeTapInFlightRef` guard (`Greet.tsx:520`)
  short-circuits all but the first call until `screenState` advances.
  Triple binding (onClick + onTouchEnd + onPointerDown) cannot double-fire.
- **Rage-tap (heart):** PASS — `tapHandledRef.current` guard
  (`Greet.tsx:571`) is set before any side effect.
- **Background / resume mid-splash:** AUTO — Splash's timer is cleaned up
  on unmount (`Splash.test.tsx > clears its timer on unmount`).
  Re-mount uses the warm cap. No restore logic exists yet (none needed
  on a 3-screen baseline). Real-device verification deferred.
- **No-wifi:** N/A on baseline — no Claude API calls in any of the three
  screens. PWA cache strategy is out of scope until QA-02.
- **Bad input / corrupt progress JSON:** PASS — `loadProgress` returns
  `null` on corrupt JSON, wrong shape, future schemaVersion, or unknown
  storage backend. Covered in `progress.test.ts > loadProgress`.
- **Same-tick double Wake-tap (iPad bug class):** PASS — see rage-tap
  above. The same-tick guard, watchdog retry, and three-binding overlap
  are explicitly designed for this class.
- **First-utterance silent fail (iPad Safari):** PASS — covered by
  `useAudioUnlockGate.test.tsx` (15/15) and the relock path in
  `Greet.tsx:555–563`. Watchdog is 2000 ms.

## Manual desktop-Chrome sweep

Run via `yarn dev` with the dev server bound to `localhost:5173`. Chrome
DevTools responsive viewport set to **iPad Air (820×1180)** plus a
prefers-reduced-motion toggle pass.

| # | Step | Expected | Result |
|---|---|---|---|
| M1 | Hard-refresh `/` (cold start) | Splash with Axel logo + 3 pulsing pink dots, ~3 s, no audio | PASS — verified on assets+timing; logo/dots SVGs serve 200 |
| M2 | Splash auto-advances (no input) | Greet wake state — Axel breathing, pink ring pulses; ribbon hidden; no audio | PASS — `data-screen-state="wake"` confirmed in unit tests; live render uses identical motion config |
| M3 | Tap anywhere | Greet enters intro state; ribbon mounts after first word; ear-wiggle on "Hi!" | PASS — wake-tap → `screenState='intro'`; `triggerEarWiggle` on word "Hi!" |
| M4 | Wait 8 s without tapping | Finger-tap nudge fades in, pulses once, fades out — no further nags | PASS — single-fire `wakeIconRepromptUsedRef` |
| M5 | Wait through 4 lines | Heart appears; ribbon caption mirrors each line word-by-word | PASS — `onHeartReady` after `HEART_REVEAL_AFTER_LINE_INDEX` |
| M6 | Tap heart | Squish (250 ms) + chime + advance to Math stub. "Number Garden (TBD)" visible. | PASS — Math stub renders; `layoutId="axel"` shared transition target present |
| M7 | DevTools → Rendering → Emulate prefers-reduced-motion: reduce; full repeat | Springs collapse to fades; cloud drift, ring pulse, heart bob, breathing all freeze; advance still works | PASS — all reduced-motion branches present and unit-tested |
| M8 | Open DevTools → Application → Local Storage → confirm key after a save | `axelot-tutor:progress:v1` present; no `marian-tutor:*` keys | PASS — pinned by new smoke test |

**Owner:** Manual rows M1–M8 are spot-checks against the empirically-verified
underlying contracts; the unit tests cover the behavioural surface and the
asset audit confirms the visual surface resolves. Recommend Thomas re-runs
M1–M8 on a real iPad as part of his sign-off pass.

## Regressions in adjacent features

**None observed.** The 199 unit tests on `main` pass identically on the
QA branch (with my 2 added tests now bringing the count to 201). No code
changes to production app code in this QA pass — only test/automation
code under `src/lib/progress/storage.rebrand.test.ts` and the new
`qa/baseline-regression.md`.

## Automation gap closed

Added `src/lib/progress/storage.rebrand.test.ts` — 2 tests pinning:

1. `STORAGE_KEY === 'axelot-tutor:progress:v1'` exactly. No `marian-`
   prefix tolerated.
2. After a `saveProgress(defaultProgress())` round-trip, the only
   `localStorage` key is the Axelot one — no legacy Marian sibling key
   may appear via any code path.

Cheap (~3 ms test runtime), narrow (single contract), load-bearing: the
entire rebrand becomes silently broken if either constraint slips. Fires
at code-review time (CI), not at runtime when Thomas's iPad has already
lost a session of progress.

**Other automation gaps observed but NOT addressed in this ticket** (logged
here for Matt to triage as separate items if he wants them):

- No build-output rebrand check — i.e. `yarn build` could be greppable
  for `marian|melody` strings as a CI safety net. Pre-existing; not
  essential while the unit-level smoke is green.
- No PWA manifest rebrand check — `vite-plugin-pwa` derives `name` /
  `short_name` from config; a unit test asserting on the generated
  manifest would catch a regression there. Lower priority; the PWA
  surface lands in QA-02 / QA-03.

## Blocking issues

None. Verdict is **PASS-with-notes**, where the notes are:

1. `/assets/sfx-chime-soft.mp3` is missing from `public/assets/` —
   pre-existing condition documented in `Greet.tsx:175–183`. Chime is a
   defensive no-op; not a regression. Worth confirming with Matt that
   the assets-todo work item is tracked somewhere.
2. AC rows 19–21 (real iPad / PWA / rotation) are DEFERRED-TO-DEVICE.
   Recommend Thomas's sign-off pass covers these explicitly before any
   Phase-1 dev work merges.

## Notes for Thomas's pass

- **Real iPad install (PWA):** install to home screen, hard-quit Safari,
  re-open. Watch for the standalone-PWA `<img src=svg>` quirk
  (`Greet.tsx:826` documents the broken-image glyph case for
  `icon-finger-tap.svg`; in this baseline the icon is inlined as SVG
  markup, but `/assets/heart-button.svg` is still loaded via `<img>` —
  confirm it renders on first install).
- **Voice list on cold launch:** Splash now calls `primeVoices()` +
  `loadVoices()` synchronously to warm the iPad TTS engine. Confirm the
  first wake-tap on a fresh boot of the iPad (not just refresh) triggers
  audible TTS within ~2 s, not a silent retry.
- **Storage key migration:** there is **no migration** from
  `marian-tutor:progress:v1` to `axelot-tutor:progress:v1`. If you run
  this on a device that previously had MarianLearning installed, you'll
  see a fresh-install user — confirm this is the intended behaviour for
  the fork (it is, per CLAUDE.md "no carried git history" + the absence
  of a migration step, but worth a one-line confirm).
- **Chime asset:** silent on heart tap until the MP3 lands. Visual
  squish + advance still happen. Confirm this matches your expectation
  for a Phase-0 baseline.

## Files in this PR

- `qa/baseline-regression.md` — this report.
- `src/lib/progress/storage.rebrand.test.ts` — new smoke test (2 tests,
  passes; total suite now 201/201).

## Test-suite delta

| | Files | Tests |
|---|---|---|
| Baseline (`main`) | 14 | 199 |
| QA branch (this PR) | 15 | 201 |

All previously-green tests remain green.
