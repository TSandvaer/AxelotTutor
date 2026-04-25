# Diagnostic Screen — UX Spec

**Ticket:** UX-02 (`86c9gqpzv`) · **Status:** v1 (PSY-02 findings folded in)
**Owner:** Kyle · **Implements:** DEV-05 (screen) · **Cross-discipline:** DEV-04 (engine + item bank — Kevin)
**Surfaces:** Optional adaptive diagnostic. Reached only via the "Want a more accurate start?" link on Setup. Mounts after Setup, advances to Greet when complete.

> **Folded-in PSY-02 (Dave):** the audit at `design/research/psy-02-diagnostic-audit.md` reshaped this spec on eight points. The biggest screen-level changes are (1) age-5 cap at 4 probes, (2) early stop on two consecutive wrong answers (engine-owned, screen-rendered), (3) winnable-first-probe visual treatment, (4) per-`probeType` layouts (`dot-array`, `numeral`, `letter-name-audio`, `letter-sound-audio`, `cvc-image`), and (5) "help Axel learn about you" framing in copy. All eight recommendations are explicitly addressed in the relevant sections below.

---

## Goal

Run a short, gentle, age-banded probe sequence so the engine can nudge skill-tree levels ±1 from `defaultsForAge(age)` before the child reaches her first session — without the diagnostic ever feeling like a test.

**Non-goals.** This screen does not grade, score, or surface "right / wrong" totals. The child sees Axel's reactions; the engine writes nudges; nothing else is shown.

## User state entering this screen

- The child just tapped the secondary "Want a more accurate start? →" link on Setup.
- Setup spoke L6 ("Okay, a few quick questions.") synchronously inside the link tap, then unmounted at +800 ms.
- **iPad Safari's audio context is already `unlocked`** — Setup is the wake-tap surface in the Axelot fresh-fork flow (per UX-01 §"Audio-unlock contract"). Diagnostic mounts with the gate's state already `unlocked` and **does not own a wake-tap of its own**. (See _Audio-unlock contract_ for the watchdog-only fallback.)
- `Progress` has **not** been written yet — Setup deferred persistence to the diagnostic-completion path (UX-01 acceptance: "On Diagnostic-link tap: `Progress` is not written yet").
- The child's `name` and `age` are already in memory (passed via `<Diagnostic>` props), but the engine consumes `age` only — `name` is not spoken in v1 (see UX-01 L5 rule + open Q #4).

## Visual layout

Portrait-first iPad. All content stays inside `env(safe-area-inset-*)`. Background is the same `bg-axel-cream` as Splash / Setup / Greet — visual continuity in the first 60 seconds.

```
┌─────────────────────────────────────────┐
│ env(safe-area-inset-top)                │
│  ╭────────╮                  · 1 / 6 ·  │  ← Top-right progress chip.
│  │ Help   │                             │     HIDDEN on probe 1 (warm
│  │ Axel   │                             │     intro, no pressure). Fades in
│  │ learn! │                             │     at probe 2. See _Progress
│  ╰────────╯                             │     chip_ for the dot-row variant.
│                                         │
│           ┌──────────────┐              │  ← Axel pose. Smaller than Setup
│           │              │              │     (~26vh) so the probe stem +
│           │    AXEL      │              │     answer area can dominate.
│           │   (idle)     │              │     `layoutId="axel"` shared with
│           │              │              │     Setup → Diagnostic transition.
│           └──────────────┘              │
│                                         │
│   ┌─────────────────────────────────┐   │  ← Speech ribbon. Same shape as
│   │  How many?                      │   │     Setup / Greet (88% width,
│   └─────────────────────────────────┘   │     pink border, white fill).
│                                         │     Mirrors the spoken stem.
│                                         │
│        ╭───────────────────╮            │  ← Stem area. Per-probeType layout
│        │                   │            │     (see §"Per-probe layouts").
│        │   STEM CONTENT    │            │     For dot-array: dot cluster.
│        │                   │            │     For numeral: numeral card.
│        │                   │            │     For letter-name-audio:
│        │                   │            │     speaker-replay button only.
│        │                   │            │     For letter-sound-audio: same.
│        │                   │            │     For cvc-image: speaker button.
│        ╰───────────────────╯            │
│                                         │
│   ┌──────┐  ┌──────┐  ┌──────┐          │  ← Answer choice tiles. Always
│   │  A   │  │  B   │  │  C   │          │     2 or 3 tiles (never 4+).
│   └──────┘  └──────┘  └──────┘          │     76×96pt min, single row.
│                                         │     Tile content varies by
│                                         │     probeType (see §layouts).
│                                         │
│ env(safe-area-inset-bottom)             │
└─────────────────────────────────────────┘
```

### Component breakdown (top → bottom)

| Region | Component                | Size / placement                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------ | ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1      | `<ProgressChip>`         | top-right, `mt-4 mr-4`, ~88×40pt          | Dot-row + counter. **Hidden on probe 1**, fades in at the start of probe 2. See _Progress chip_ for layout. Uses `text-ink/60`, `axel-rose` for completed dots, `axel-pink` for current dot, `axel-200` for upcoming.                                                                                                                                                                                  |
| 2      | `<AxelPose>`             | `h-[26vh]`, centered                      | Smaller than Setup's 38vh — stem + answers need vertical room. `layoutId="axel"` shared with Setup. Breathing loop **always on** (audio is already unlocked; no "perfectly still" wake state needed).                                                                                                                                                                                                  |
| 3      | `<SpeechRibbon>`         | 88% width, max 640px, mt-3                | White card, 3px `axel-pink` border, rounded-3xl. `font-display`, `text-[2.4rem]`, `leading-snug`. Mirrors the active stem. Chunk-fade reveal (no word-by-word).                                                                                                                                                                                                                                        |
| 4      | `<ProbeStem>`            | mt-6, dynamic height                      | Polymorphic by `probeType` — see §"Per-probe layouts". Stem area is **always tappable as a whole** to replay the audio (acts as a giant speaker button), with a small visible speaker chip in the bottom-right corner.                                                                                                                                                                                |
| 5      | `<ProbeChoices>`         | mt-8, single row, 2–3 tiles               | Each tile 76×96pt min, rounded-2xl, 3px `axel-pink` border, white fill. Tap target wraps the whole tile. **Selected tile briefly inflates to scale 1.06 then locks** while Axel reacts; siblings fade to `opacity 0.4` for 800 ms then the next probe replaces the row. **No "submit" button** — first tap is the answer.                                                                              |

### Progress chip

```
  ╭──────────────╮
  │ • • • ◦ ◦ ◦  │   ← 6-dot variant (ages 6–10). Solid dots = answered;
  │   3 / 6      │      ring-only dots = upcoming. Current probe is the
  ╰──────────────╯      first ring (slightly larger, axel-pink fill).

  ╭────────────╮
  │ • • ◦ ◦    │     ← 4-dot variant (age 5). Same grammar.
  │  3 / 4     │
  ╰────────────╯
```

- **Hidden on probe 1.** Fades in at the start of probe 2 with a 250 ms `opacity 0 → 1` (no scale). The intent: probe 1 is a warm hello, not a countdown.
- **Counter text** is small (`text-[0.85rem] text-ink/60`); the dot row carries the load.
- **Adapts to early stop.** If the engine emits `EARLY_STOP` after probe N, the chip animates the remaining-dots out to opacity 0 over 200 ms (synchronously with the celebrate-out transition), so the child doesn't see "you stopped at 3 of 6". The chip simply disappears as Axel cheers.
- **Reduced motion:** static appearance; no fade transitions.

### Thumb zones (iPad portrait, child-sized hand)

- **Choice tiles sit in the bottom 45% of the safe-area rect** — primary thumb zone for both hands. Spacing between tiles ≥ 24pt so an off-target tap is rare.
- **Stem area is mid-screen** (replay tap target spans the whole stem card, but the speaker chip sits in the corner so a child can find it without re-reading).
- **Progress chip is intentionally top-right** — out of the thumb zone, not tappable, can be ignored entirely.
- **No back / skip / pause UI on this screen.** Once the diagnostic starts, it runs to completion or early-stop. (See _Open questions_ — abort path is not in v1.)

## Per-probe layouts

Five `probeType` variants. Each layout reuses the same outer scaffolding (Axel + ribbon + progress + choice row) and varies the stem + choice cell content.

### `dot-array` (math, age 5)

Subitizable range only — sets of 1, 2, 3, or 4 dots. Numerals are **not used at age 5** per PSY-02.

**Stem.** A single rectangular card centered on screen, ~360×260pt. Inside: a randomly arranged cluster of `axel-rose` filled dots (24pt diameter each, 18pt min spacing). Cluster avoids straight rows so the child does not count by lining up — visual grouping is the cue. Dots fade in together (250 ms, no stagger).

**Spoken stem.** "How many?" (Axel TTS).

**Mirror text.** "How many?" (in ribbon).

**Choices.** **3 numeral tiles** showing the candidate counts. Tile content is a single large numeral (`text-[2.6rem] font-display ink`). Distractors are ±1 from the target, clamped to 1–4 (so a target of 1 produces choices `1, 2, 3` and a target of 4 produces `2, 3, 4`). Order is shuffled by the engine; correct answer is **never always position 0**.

**Why numerals as choices but dots in stem?** PSY-02 says "set-to-numeral" tasks have higher validity than numeral-only at pre-K. The child sees a set, identifies the matching numeral. Pure numeral-only would mean both stem and choices are digits, which is the format we're avoiding at age 5.

### `numeral` (math, ages 6–10)

Numeric stem, numeric choices.

**Stem.** A single large numeral or short expression centered in a card. For `number-recog` at age 6 this is "7". For `add-to-10`, "3 + 4". For `add-to-20`, "8 + 6". For `sub-to-10`, "9 − 4". For `two-digit-addsub`, "23 + 14". Numeral or expression in `text-[5.0rem] font-display ink`. The card itself stays ~360×260pt for visual consistency with `dot-array`.

**Spoken stem.** Engine-supplied; see _Probe schema_ field `stem.spoken`. Examples: "What number is this?" / "Three plus four?" / "Eight plus six?" / "Nine take away four?". TTS speaks the **expression** in natural English, never the symbols.

**Mirror text.** Same as spoken; ribbon shows the words. **The numeric stem card is the visual carrier.** Ribbon is the audio mirror.

**Choices.** **3 numeral tiles**. Distractors are engine-supplied (`choices` array); typically off-by-one or off-by-the-other-operand. Same shape as `dot-array` choices.

### `letter-name-audio` (literacy, ages 5–6)

Letter-name probes precede letter-sound probes per PSY-02 (Scarborough meta-analysis). Audio prompt + visual letter choices.

**Stem.** A speaker-icon card centered ~280×220pt. Glyph: rounded speaker (`axel-rose` fill on white card with `axel-pink` border). The whole card is tap-to-replay. Beneath the icon, in `text-[1.0rem] text-ink/70`, the subtitle "Tap to hear it again". (This subtitle is **not spoken** — it's an iconographic affordance.)

**Spoken stem.** "Tap the letter A." / "Tap the letter M." (etc., engine-supplied per item).

**Mirror text.** Same in ribbon.

**Choices.** **3 letter tiles** showing uppercase letters in `text-[2.6rem] font-display ink`. Distractors are visually similar letters (engine-curated; e.g. for target M, distractors might be N, W). Tile shape identical to numeral tiles.

### `letter-sound-audio` (literacy, ages 5–6, after letter-name probes)

Same scaffolding as `letter-name-audio`, but the spoken prompt asks for the sound, not the name.

**Stem.** Identical speaker card — replay-tap target.

**Spoken stem.** "Which letter says /m/?" (TTS speaks the phoneme `/m/` clearly; engine supplies the IPA-flavoured spoken text and a phoneme audio asset for the `/m/` itself).

**Mirror text.** "Which letter says /m/?" (ribbon shows the slash-bracketed phoneme).

**Choices.** Same 3 letter tiles as `letter-name-audio`.

**Sequencing rule (engine-owned).** For ages 5–6, **letter-name probes always come before letter-sound probes** in the sequence. UX-02 spec depends on this; flag for Kevin in DEV-04.

### `cvc-image` (literacy, ages 5–6 mostly; ages 7+ for diagnostic of `cvc-words` / `blending-cv`)

CVC word recognition — audio prompt + image choices. **Image-first, not text-first**, because CVC decoding is the skill being probed; we don't want to read-test before we measure.

**Stem.** Speaker card, identical to `letter-sound-audio`.

**Spoken stem.** "Find the cat." / "Find the sun." / "Find the bug." (engine-supplied).

**Mirror text.** Same in ribbon.

**Choices.** **3 image tiles**, each containing a single illustration on white background. Tile size 96×96pt minimum (slightly larger than letter tiles to give the image room). Image asset path supplied by engine via `choices[i].imageSrc`. **No text label on the tile** — image is the answer carrier. (Optional small alt-text below the image at `text-[0.85rem] text-ink/60` for screen-reader users, but the visible read is the image.)

**Distractors.** Engine-curated CVC words from the same vowel family. For "cat" target: distractors might be "cap" and "cup" (illustrated as such). The image-vs-image task is what discriminates — no need for text-based foils.

## Probe schema (interface contract for Kevin / DEV-04)

This is the cross-discipline contract. Kyle ships these names; Kevin's `pickProbes` and `src/content/diagnostic.ts` adopt them. If Kevin needs to deviate, flag back via Matt before committing — the screen renders directly off these field names.

```ts
// Proposed location: src/lib/setup/diagnosticTypes.ts (Kevin owns the file).
// Kyle's UX-02 layouts depend on these field names verbatim.

import type { Age, SkillLevel, SkillNode } from '../progress/types'

/** What kind of stem/answer interaction the screen renders. */
export type ProbeType =
  | 'dot-array' // math, age 5: dot cluster stem, numeral choices
  | 'numeral' // math, ages 6–10: numeral / expression stem, numeral choices
  | 'letter-name-audio' // literacy, ages 5–6: speaker stem, letter choices
  | 'letter-sound-audio' // literacy, ages 5–6: speaker stem (phoneme), letter choices
  | 'cvc-image' // literacy: speaker stem, image choices

export interface ProbeChoice {
  /**
   * Visible label inside the choice tile.
   *  - dot-array: numeral string ("1", "2", "3", "4")
   *  - numeral: numeral string ("7", "12", "37")
   *  - letter-name-audio / letter-sound-audio: uppercase letter ("A", "M")
   *  - cvc-image: alt text for screen readers ("cat"); the rendered tile
   *    shows the image and HIDES the label visually
   */
  label: string

  /**
   * Image asset path. ONLY supplied for `probeType === 'cvc-image'`.
   * Path convention: `/assets/diagnostic/cvc/<word>.svg` (e.g.
   * `/assets/diagnostic/cvc/cat.svg`). Devon ships the asset folder with
   * DEV-05; Kyle ships the v1 illustrations as a follow-up if Thomas
   * approves the image style brief.
   */
  imageSrc?: string
}

export interface Probe {
  /** Unique probe ID — diagnostic for engine logs only, not user-visible. */
  id: string

  /** Drives the screen layout. Kyle UX-02 owns the per-type rendering. */
  probeType: ProbeType

  /**
   * Inclusive [min, max] age band this probe is eligible for. Used by
   * `pickProbes` to filter by `profile.age`.
   */
  ageBand: [Age, Age]

  /**
   * Skill node this probe targets. Engine nudges this node ±1 SkillLevel
   * on answer (clamped within ['locked','intro','practicing','mastered']).
   */
  nodeId: SkillNode

  stem: {
    /**
     * Visual stem text. EMPTY STRING for audio-only probe types
     * (`letter-name-audio`, `letter-sound-audio`, `cvc-image`) — the
     * speaker card is the visual stem. For `numeral`, the expression
     * ("3 + 4") goes here. For `dot-array`, the integer count goes here
     * as a string ("3") — the renderer reads it to know how many dots
     * to draw. For `cvc-image`, leave empty (the spoken word is the cue).
     */
    text: string

    /**
     * What Axel says. ALWAYS populated, all probe types. ~200-word
     * vocabulary cap applies — keep stems short, friendly, declarative.
     * Examples:
     *   - "How many?"
     *   - "Three plus four?"
     *   - "Tap the letter A."
     *   - "Which letter says /m/?"
     *   - "Find the cat."
     */
    spoken: string

    /**
     * Optional. ONLY for `letter-sound-audio`: path to the phoneme audio
     * sample if engine wants to play the actual sound separately from
     * the TTS sentence (e.g. /m/ as a clip).
     */
    phonemeAudioSrc?: string
  }

  /**
   * Always 2 or 3 choices. Never 4+ (PSY-02 cognitive-load floor for the
   * 5-year-old end of the band; tested visual-grammar consistency for the
   * older end). Engine guarantees uniqueness within the array.
   */
  choices: [ProbeChoice, ProbeChoice] | [ProbeChoice, ProbeChoice, ProbeChoice]

  /** Index into `choices` of the correct answer, 0-based. */
  correctIndex: 0 | 1 | 2

  /**
   * Optional difficulty hint for `pickProbes` to enforce the winnable-first
   * rule. `'easy'` items are eligible for slot 0; the engine MUST pick an
   * `'easy'` probe at the target node's `defaultsForAge` level for slot 0.
   * Slots 1+ may use any difficulty.
   */
  difficulty?: 'easy' | 'medium' | 'hard'
}

/** Per-call probe set produced by the engine. Cap differs by age. */
export interface ProbeSet {
  /** Length is 4 if `age === 5`, else 6. */
  probes: Probe[]
  /** The age band this set was selected for; copied from `profile.age`. */
  forAge: Age
}

/** Engine outcome for one probe — the screen reports this back. */
export interface ProbeOutcome {
  probeId: string
  /** 0-based index of the choice the child tapped. */
  pickedIndex: 0 | 1 | 2
  isCorrect: boolean
  /** ms from probe-mount to choice-tap. Diagnostic only; not surfaced. */
  responseMs: number
}

/** Result of an entire run; passed to engine for nudge application. */
export interface DiagnosticResult {
  outcomes: ProbeOutcome[]
  /**
   * `true` if the engine triggered the early-stop rule (two consecutive
   * wrong). Screen reads this off the engine and short-circuits to the
   * cheering exit anyway — the child sees no failure cue.
   */
  earlyStopped: boolean
  /** SkillLevel deltas the engine applied; for QA logs / debug only. */
  appliedNudges: { node: SkillNode; from: SkillLevel; to: SkillLevel }[]
}
```

**Engine contract (rules Kevin's `diagnosticEngine.ts` enforces, surfaced here so the screen knows what to expect):**

1. **Length cap.** `pickProbes(age)` returns 4 probes if `age === 5`, else 6.
2. **Composition.** For 6 probes: 3 math + 3 literacy. For 4 probes: 2 math + 2 literacy. (The `dot-array` and `cvc-image`/`letter-*-audio` types fill the age-5 set.)
3. **Winnable first probe.** Slot 0 is always `difficulty: 'easy'` and targets the node at `defaultsForAge(age)` already labelled `'intro'` or `'practicing'` — never a `'locked'` cold-start.
4. **Sequencing.** For ages 5–6, all `letter-name-audio` probes precede all `letter-sound-audio` probes within the literacy bucket.
5. **Early stop.** After two consecutive `isCorrect === false` outcomes at any age, the engine emits `EARLY_STOP` and the screen short-circuits to the exit (see _States → Early stop_).
6. **Nudges.** Each correct answer nudges the target `nodeId` up by one `SkillLevel` (clamped at `'mastered'`). Each wrong answer nudges it down by one (clamped at `'locked'`). Nudges apply once per probe.

## Copy / TTS script

All Axel speech respects the ~200-word vocabulary cap. Stems are stored on individual `Probe` objects (engine-owned). Below are the **screen-owned** lines (intro, transitions, exit).

| #   | Trigger                                       | Spoken (Axel TTS)                  | On-screen text mirror              | Caption-reveal timing                                                                                                                  |
| --- | --------------------------------------------- | ---------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Mount (audio already unlocked from Setup)     | "This will help me learn about you." | "This will help me learn about you." | Single chunk, 250 ms fade in. Axel idle. **Probe 1 stem does NOT speak yet** — D1 plays first, then 600 ms gap, then probe 1 stem.   |
| D2  | First probe stem starts (probe 1, after D1)  | (Probe.stem.spoken — engine-supplied) | (matches spoken)                | Chunk-fade in ribbon as the line plays.                                                                                                |
| D3  | After correct answer, before next probe       | (chime + ear-wiggle, no TTS)       | (no ribbon change)                 | Sparkles fire 200 ms after tap. Next probe stem auto-advances at +800 ms (sparkles still fading).                                      |
| D4  | After wrong answer, before next probe         | (gentle "poof" sound, no TTS)      | (ribbon stays on previous stem)    | Axel cross-fades idle → puzzled for **400 ms only** (mildest reaction; PSY-02). Next probe auto-advances at +600 ms. **No retry.**     |
| D5  | After probe N completes (N ≥ 2), before N+1 stem | (Probe.stem.spoken for N+1)     | (next stem)                        | 400 ms gap between previous probe's exit and next probe's stem audio. Same gap as Greet's `LINE_GAP_MS`.                              |
| D6  | All probes done (or early stop)               | "All done! Great job."             | "All done! Great job."             | Speak synchronously with the cheering-pose swap. Chime fires on the same tick. Advance to Greet scheduled at +1200 ms.                |

**Vocabulary used (D-line copy only, English, no Tagalog bridging):** _this, will, help, me, learn, about, you, all, done, great, job_ — 11 unique screen-owned words. Per-probe stems pull from the engine's vocabulary list (also kept inside the cap).

**Strict rules:**

- **Never the child's name in any spoken line on this screen.** Same rule as UX-01 L5: name is captured but not validated for TTS pronunciation safety.
- **Never the words "test", "quiz", "right", "wrong", "score", "grade", "fail", "pass".** This is "help Axel learn about you" framing — it must read all the way through. (Engine probe stems must respect the same vocabulary blacklist; flag for Kevin.)
- **Never count down remaining probes in TTS.** The progress chip is the visual cue. No "two more to go" / "last one!" lines.
- **Never any "your" or "you got" framing.** Wrong-answer "poof" is silent except for the SFX.

## Audio-unlock contract

This screen does **not** own a wake-tap. Setup is the audio-unlock surface in the fresh-fork flow (UX-01 §"Audio-unlock contract"); Diagnostic mounts with `gate.state === 'unlocked'`.

### Implementation contract for Kevin / Devon (DEV-05)

```tsx
// inside Diagnostic component
const gate = useAudioUnlockGate({ watchdogMs: 2_000 })

useEffect(() => {
  // Audio is already unlocked from Setup. Speak D1 on mount, no tap needed.
  // We still go through gate.wrapSpeak so the watchdog catches an iPadOS
  // re-suspension edge case (e.g. user backgrounded app between Setup-tap
  // and Diagnostic-mount).
  gate.wrapSpeak(() => speakFn(D1))
}, [])
```

**Watchdog-only fallback.** If the 2-second watchdog fires (silent first-utterance fail), surface a single ring + finger-tap nudge around Axel — same visuals as Setup's wake. **Next user tap** synchronously retries `speak(D1)`. From the user's perspective: a slightly delayed Axel, never an error. (Reuse `useAudioUnlockGate` verbatim — same hook, same retry path.)

**Cancellation.** On unmount (component navigates away or AnimatePresence exits), `cancelTts()` to silence any in-flight stem; the gate's own cleanup handles the watchdog.

## Motion

All values are spring-physics where listed. LazyMotion already imported in `App.tsx`. Bundle delta target: ≤ 5 KB gzipped over Setup (most logic is shared via `useAudioUnlockGate` + reused ribbon component).

| Element               | Trigger                       | Animation                                                                  | Spring / duration                                              |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Axel entrance         | Setup → Diagnostic mount      | `layoutId="axel"` shared transition; opacity stays 1                       | Framer's automatic layout transition                           |
| Axel breathing        | Mount (audio already unlocked) | `scale: [1, 1.05, 1]` infinite                                            | `duration: 2.4s, ease: easeInOut` (matches Setup)              |
| D1 ribbon entrance    | Mount + 250 ms                | `scale: 0.9 → 1, opacity: 0 → 1`                                          | `{ stiffness: 260, damping: 20 }`                              |
| Stem fade-in          | After D1 ends + 600 ms        | `opacity: 0 → 1, y: +12 → 0`                                              | `{ stiffness: 240, damping: 22 }`, ~280 ms                     |
| Choice row entrance   | Same tick as stem             | Group fade-in, 250 ms, no stagger                                         | `duration: 0.25, ease: easeOut`                                |
| Choice tile press     | Tap                           | `scale: 1 → 1.06`, fill swap to `axel-pink` then back                    | `{ stiffness: 320, damping: 18 }`, ~200 ms                     |
| Sibling tiles fade    | After tap (correct OR wrong)  | `opacity: 1 → 0.4` over 200 ms                                            | `duration: 0.2, ease: easeOut`                                 |
| Axel correct reaction | Correct tap                   | Cross-fade `idle → happy` for 600 ms, then back                            | Same `EAR_WIGGLE_MS` constant from Greet                       |
| Sparkles              | Correct tap + 200 ms          | 6 small `axel-pink` + `sparkle` puffs, drift up + fade out                 | `duration: 800ms, ease: easeOut`, no spring                    |
| Axel wrong reaction   | Wrong tap                     | Cross-fade `idle → puzzled` for **400 ms** (mildest), then back            | **Half the duration of Math/Word Song's 800 ms.** PSY-02 rule. |
| "Poof" sound          | Wrong tap                     | Howler-served `sfx-poof-soft.mp3` (pending Thomas)                         | —                                                              |
| Probe-to-probe        | Engine advances to next probe | Stem + choices fade out 200 ms; new stem + choices fade in over 280 ms     | Sequential, total ~480 ms                                      |
| Progress chip reveal  | Start of probe 2              | `opacity: 0 → 1` over 250 ms                                               | `duration: 0.25, ease: easeOut`                                |
| Cheering exit         | Last probe done OR early-stop | Axel cross-fades to `cheering`, springs in `scale: 0.9 → 1`, then bobs  | `{ stiffness: 220, damping: 20 }`; bob `2s, easeInOut`         |
| End-screen ribbon     | Same tick as cheering         | Existing chunk-fade with D6 copy                                           | Same as D1 entrance                                            |
| Exit transition out   | After +1200 ms on cheering    | `opacity: 1 → 0` over 250 ms; App router swaps to Greet                    | `duration: 0.25, ease: easeInOut`                              |

**Reduced motion** (`prefers-reduced-motion: reduce`):

- Axel breathing → off (static).
- Stem + choice-row entrance → 200 ms fade only, no `y` slide.
- Choice tile press → no scale, fill swap only.
- Sibling fade → kept (communicating the lock-in, not decorative).
- Axel correct/puzzled cross-fades → kept (communicating, not decorative).
- Sparkles → reduce to 2 puffs, no drift, opacity-only fade.
- Cheering bob → off (scale-in only).
- Probe-to-probe transition → kept; the fade is communicating "next item".

Reuse `usePrefersReducedMotion()` helper from Greet / Setup verbatim.

## States

### Idle (probe N stem visible, awaiting tap)

Axel breathing, stem rendered per `probeType`, choice row interactive. Ribbon shows the current stem text. Progress chip visible (probes 2+) or hidden (probe 1).

### Happy path — correct answer

- Tapped tile inflates to scale 1.06, fill swaps to `axel-pink` for 200 ms then settles.
- Sibling tiles fade to opacity 0.4.
- Chime fires on tap (Howler).
- Axel cross-fades idle → happy at +0 ms; sparkles fire at +200 ms.
- Engine applies `+1` `SkillLevel` nudge on the target `nodeId` (clamped).
- Progress chip's current dot fills `axel-rose` at +400 ms.
- At +800 ms: stem + choices fade out, next probe enters.

### Error path — wrong answer (NEVER a red X, NO RETRY)

- Tapped tile inflates to scale 1.06 once, fill stays neutral (no red, no green).
- Sibling tiles fade to opacity 0.4.
- "Poof" SFX fires on tap.
- Axel cross-fades idle → puzzled for **400 ms only** (half the lessons-mode duration; mildest reaction per PSY-02).
- Engine applies `-1` `SkillLevel` nudge on the target `nodeId` (clamped).
- Progress chip's current dot fills `axel-pink` at +400 ms (same colour as upcoming dots — the chip does not visually distinguish correct from wrong; only completion matters from the chip's perspective).
- At +600 ms: stem + choices fade out, next probe enters. **The wrong probe is never re-shown. No "try again" prompt. No correction shown.**

The stem-card "correct answer reveal" pattern (highlighting the right tile after a wrong tap) is **explicitly out of scope** — PSY-02 says no accumulating visual failure signal. The engine logs the answer; the child moves on.

### Early stop (engine emits `EARLY_STOP` after probe N due to two-consecutive-wrong rule)

- Triggered by the engine, not the screen — but the screen is responsible for routing the early-stop into the **same exit experience** as a normal completion.
- Stem + choices fade out (same 200 ms exit as normal).
- Progress chip fades out over 200 ms (the remaining-dots are hidden — the child does not see "you stopped at 3 of 6").
- Axel cross-fades to `cheering` at +200 ms.
- D6 ("All done! Great job.") plays synchronously with the cheering swap.
- At +1200 ms: exit to Greet.

**This is the most important PSY-02 contract on the screen side:** an early-stopped diagnostic looks identical to a completed one. The child experiences a celebration; the engine quietly applies the partial nudges.

### Empty / first-visit

This screen is itself the first-visit-only path. There is no "no probes yet" empty state — the engine always returns at least 4 probes (per `pickProbes` contract). If for any reason the probe set is empty (defensive fallback), **the screen does not render** — it immediately calls `onAdvance()` and routes to Greet without showing any UI.

### Return-user

Not applicable. A returning user does not see Diagnostic — Setup itself is gated by `loadProgress() === null`. If a developer accidentally routes a returning user here, the screen renders normally (it has no preconditions other than `name` + `age` props).

### Transition in (from Setup)

- Setup's L6 ("Okay, a few quick questions.") ended at +800 ms; App-router unmounts Setup over 250 ms (`opacity: 1 → 0`).
- Diagnostic mounts with `bg-axel-cream` already in place (no flash). Axel takes the shared `layoutId="axel"` transition.
- D1 plays at +250 ms after mount.

### Transition out (to Greet)

- Cheering pose + D6 line + chime + 1200 ms hold.
- Whole `<m.main>` exits with `opacity: 0, duration: 0.25` (matches Setup → Greet shape).
- App writes `Progress` doc with `name`, `age`, `setupCompletedISO`, `diagnosticCompletedISO`, `defaultsForAge(age)` seeded skill tree, **then engine's nudges applied on top**, then routes to Greet.

### Relock (silent first-utterance fail on D1)

- Watchdog fires at 2 s with no `onstart` for D1.
- Ring + finger-tap nudge appears around Axel. Probe 1 stem is **not yet rendered** (D1 has not finished — gating contract).
- Next user tap synchronously retries `speak(D1)`. From the child's perspective: a slightly delayed Axel.

## Assets required

### Reused (no new asset)

- `/assets/axel-idle.svg` (UX-03)
- `/assets/axel-happy.svg` (UX-03)
- `/assets/axel-puzzled.svg` (UX-03 — used at half-duration here vs lessons mode)
- `/assets/axel-cheering.svg` (UX-03)
- `/assets/icon-finger-tap.svg` (Greet inline pattern; reused for relock fallback)
- `/assets/sfx-chime-soft.mp3` (pending Thomas; correct-answer chime)
- `bg-axel-cream` (Tailwind token)
- All `axel-*` palette tokens

### New (this screen)

| Asset                                  | Format          | Where                                         | Why                                                                                                                                                                       |
| -------------------------------------- | --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon-speaker.svg`                     | inline SVG      | inside speaker stem cards (audio probe types) | Replay-tap glyph. ~32×32pt visible chip; whole stem card is the larger tap target.                                                                                        |
| `sfx-poof-soft.mp3`                    | Howler asset    | wrong-answer reaction                         | Gentle "poof" — never harsh, never a buzzer. Pending Thomas review of the source clip; `createSfx` is tolerant of missing asset.                                          |
| `/assets/diagnostic/cvc/<word>.svg`    | per-CVC-item    | `cvc-image` choice tiles                      | One illustration per CVC item in the bank (e.g. `cat.svg`, `cap.svg`, `cup.svg`, `bug.svg`). **Kyle owns the illustration brief; ship as a follow-up if Thomas approves.** |
| `/assets/diagnostic/sparkle-puff.svg` | inline SVG      | correct-answer sparkle layer                  | Single-frame puff used in Framer-driven sparkle motion. Reuses `axel-pink` + `sparkle` tokens.                                                                            |

**No new background.** Cream continuity through the first-run flow.

**No new pose SVGs.** The five UX-03 poses cover every state on this screen.

### Tailwind tokens used

`bg-axel-cream` · `text-ink` · `text-ink/60` · `text-ink/70` · `border-axel-pink` · `bg-axel-pink` · `bg-axel-rose` (selected progress dot) · `bg-axel-200` (upcoming progress dot) · `font-display` · `text-[2.4rem]` (ribbon) · `text-[2.6rem]` (numeral / letter tile) · `text-[5.0rem]` (numeric stem expression) · `text-[1.0rem]` (speaker subtitle) · `text-[0.85rem]` (counter, image alt) · `text-sparkle` (sparkle puff fill)

All tokens already land via UX-03.

## Acceptance criteria

Jessica reads these. Each is testable on iPad Safari + the installed PWA. Engine-owned rules are **assumed** (Kevin's DEV-04 acceptance covers them); screen-owned rules are listed below.

### Probe rendering

- [ ] On mount, Axel `idle` is visible, breathing on. **No wake-tap is required** — the audio context is already unlocked from Setup.
- [ ] D1 ("This will help me learn about you.") plays within 250 ms of mount.
- [ ] Probe 1 stem audio starts 600 ms after D1 ends.
- [ ] **Progress chip is hidden during probe 1** and fades in at the start of probe 2 (250 ms).
- [ ] At `age === 5`, the progress chip is the 4-dot variant; at ages 6–10, the 6-dot variant.
- [ ] Stem layout matches `probeType`: dot-array shows a clustered set of dots; numeral shows a large numeral / expression; letter-name-audio / letter-sound-audio show a speaker card; cvc-image shows a speaker card.
- [ ] Tapping the speaker card on any audio probe replays `Probe.stem.spoken`.
- [ ] Choice row always has 2 or 3 tiles; never 4+. Each tile is ≥76×96pt.
- [ ] No "submit" button — first tile tap is the answer.
- [ ] Tile-tap inflates the tapped tile (scale 1.06) and fades sibling tiles to opacity 0.4.

### Correct / wrong reactions

- [ ] Correct tap fires chime + Axel `idle → happy` cross-fade + sparkle puffs at +200 ms.
- [ ] Wrong tap fires "poof" SFX + Axel `idle → puzzled` cross-fade for **400 ms** (half the lessons-mode duration).
- [ ] **No red X anywhere.** The wrong-answer treatment shows no error icon, no red colour, no "try again" copy.
- [ ] **No retry.** A wrong answer auto-advances to the next probe at +600 ms; the child does not see the correct answer revealed.
- [ ] Sibling tiles do not visually distinguish correct from wrong — both correct and wrong fade siblings identically.
- [ ] Progress chip dot fills `axel-rose` for any answered probe (correct or wrong); it does not visually distinguish correctness.

### Early stop (PSY-02)

- [ ] When the engine emits `EARLY_STOP` (two consecutive wrong), the screen routes to the cheering exit identically to a full completion.
- [ ] D6 ("All done! Great job.") plays on the early-stop path, exactly as on the full-completion path.
- [ ] The progress chip fades out (does not show "you stopped at 3 of 6" or similar partial state).
- [ ] The child sees no error / failure cue at any point.

### Winnable first probe

- [ ] Probe 1's `Probe.difficulty` is `'easy'`. (Verifiable via engine output / fixture.)
- [ ] Probe 1's stem is at the child's `defaultsForAge(age)` level for the targeted node.
- [ ] Probe 1's UI visibly **does not** show the progress chip — the warm intro contract.
- [ ] At age 5, probe 1 is **always** a `dot-array` probe with target count 1, 2, or 3 (the easiest end of the subitizable range).
- [ ] At ages 6–10, probe 1 is a `numeral` `number-recog` item if math, OR a `letter-name-audio` item if literacy — never `letter-sound-audio` and never `cvc-image` for probe 1.

### Sequencing

- [ ] At ages 5–6, all `letter-name-audio` probes appear before all `letter-sound-audio` probes within the literacy bucket.
- [ ] At age 5, math probes are 100% `dot-array` (no `numeral`).
- [ ] At ages 6–10, math probes are 100% `numeral` (no `dot-array`).

### Copy / a11y

- [ ] Every spoken line has an on-screen mirror in the ribbon. No spoken line is unscripted.
- [ ] No spoken line uses the words "test", "quiz", "right", "wrong", "score", "grade", "fail", "pass".
- [ ] No spoken line includes the child's name.
- [ ] No spoken line counts down remaining probes ("two more!", "last one!").
- [ ] Ribbon body text is ≥28pt (≥37px). Choice tile labels are ≥34pt for numerals/letters; cvc-image alt text is ≥11pt.
- [ ] Touch target audit: every interactive element ≥60×60pt; choice tiles ≥76×96pt.
- [ ] Each choice tile has an `aria-label` matching its label or alt text.
- [ ] No copy contains Tagalog, Danish, or any non-English string.

### Routing / persistence

- [ ] On mount, no `Progress` document is read or written.
- [ ] On the cheering-exit (full or early-stop), the App writes `Progress` with: `name`, `age`, `setupCompletedISO = now`, `diagnosticCompletedISO = now`, `defaultsForAge(age)` seeded skill tree, **then** engine nudges applied on top.
- [ ] After persistence completes, App routes to Greet.
- [ ] If the user backgrounds the app mid-diagnostic, on next mount the screen re-runs from probe 1 (no half-state persisted).

### Reduced motion

- [ ] With `prefers-reduced-motion: reduce`: Axel does not breathe; stem entrance is fade-only; choice press is no scale; sparkles reduce to 2 opacity-only puffs; cheering bob is off.
- [ ] Cross-fades for happy / puzzled / cheering pose changes **still play** — they're communicating, not decorative.
- [ ] Sibling-tile fade-out **still plays** — communicating the lock-in.

### Performance

- [ ] First-paint to interactive (post-Setup transition) ≤ 350 ms on iPad mini gen 6 cold.
- [ ] Diagnostic screen JS budget delta ≤ 5 KB gzipped over Setup.
- [ ] No layout-shift CLS spikes when stem or choice row mounts (use opacity / scale, not display swaps that re-flow).

## Open questions

Flag for Thomas / orchestrator routing:

1. **Abort affordance.** The current spec has **no skip / back / pause** UI on the diagnostic itself. A grown-up wanting to bail mid-flow has to background the app; on re-launch the diagnostic re-runs from probe 1. Is that acceptable for v1, or do we need a small "Skip for now" link tucked in the top-left? **Kyle's recommendation: no abort in v1.** The flow is short (4–6 probes; max ~90 s), early-stop already handles the "this child is struggling" signal, and a skip affordance risks the diagnostic being skipped reflexively. Re-flag if Thomas wants a parent-mediated abort.
2. **CVC illustration style.** The `cvc-image` probes need real illustrations (pending `/assets/diagnostic/cvc/<word>.svg`). Style options: (a) consistent flat-vector matching Axel's palette; (b) photographic clipart; (c) emoji-style line drawings. **Kyle's recommendation: (a)** — preserves the visual language. Needs a separate art ticket if Thomas wants to scope it. Until shipped, `cvc-image` probes either degrade to text labels (acceptable fallback for ages 7+; not for 5–6 because of the read-test concern) **or** the engine de-prioritises `cvc-image` items in age-5/6 sets in favour of `letter-name-audio` / `letter-sound-audio`. Default for v1: **degrade to letter-* probes at 5–6 until illustrations ship.**
3. **Phoneme audio assets for `letter-sound-audio`.** TTS engines pronounce `/m/` inconsistently — some say "muh", some "em", some try the IPA. We have two options: (a) ship per-phoneme audio clips (`/assets/diagnostic/phonemes/m.mp3`) and play them after the TTS sentence; (b) trust TTS and accept some inconsistency. **Kyle's recommendation: ship clips for the 5 short-vowel + most common consonant phonemes** (~20 clips; small bundle hit). Flag for Kevin: this is a content-bank delivery, not a screen change — the screen already supports `Probe.stem.phonemeAudioSrc`.
4. **Per-probe response timeout.** Should the screen nudge "Tap one!" after N seconds of no answer? The current spec has **no timeout** — probes wait indefinitely. Risk: a child who walked away from the iPad never reaches Greet. **Kyle's recommendation: no timeout in v1**, but track via QA whether real children stall. Easy to add as `useReprompt` analog from Greet (20 s, plays current stem once more).
5. **Sparkle puff count for correct answers.** Spec says 6; reduced-motion drops to 2. Is 6 the right "celebration intensity" for a diagnostic correct answer (where we don't want to over-celebrate to avoid "I got it right" framing creeping in)? **Kyle's recommendation: tune to 4 puffs** (not 6) for diagnostic mode, vs. 6 for actual lessons — keep the celebration mild matching the mild puzzled. Re-flag for Dave consult slot.
6. **Should the "All done!" exit show a tally?** E.g. "You answered 4 questions!" Spec currently says no — we frame the diagnostic as "help Axel learn", not "your performance". **Kyle's recommendation: no tally in v1.** The cheering pose + chime + D6 is enough closure. A tally invites the child to read it as a score.
7. **What if Setup-tap-into-diagnostic loses gesture context?** UX-01 contract says the audio context is unlocked across Setup → Diagnostic. If for any reason iPadOS re-suspends the PWA between Setup unmount and Diagnostic mount (foregrounded right at the boundary), D1 may silently fail. The watchdog handles this — but the failure surface is the relock-ring around Axel, which on Diagnostic-mount may be visually different (Axel breathing already, no "still" wake state). **Kyle's recommendation: accept the relock surface as-is**; the watchdog + ring is consistent enough across Setup and Diagnostic that the child reads "tap me again" without fresh confusion. Devon to verify on real iPad after first integration.

---

**Spec version:** v1 · **PSY-02 folded in** (Dave 2026-04-25). Cross-discipline schema pinned for Kevin's DEV-04. Open questions remain for Thomas routing.
