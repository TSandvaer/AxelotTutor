# Setup Screen — UX Spec

**Ticket:** UX-01 (`86c9gqpyy`) · **Status:** v1.1 (PSY-01 findings folded in)
**Owner:** Kyle · **Implements:** DEV-03
**Surfaces:** First-run setup phase. Audio-unlock surface for fresh-fork sessions.

> **Folded-in PSY-01 (Dave):** the age-5 self-report risk and age-10 "babied" risk
> shaped three changes vs the original v1 spec:
>
> 1. **Header reframe** — "How old are you?" → "So Axel knows where to start!" (instrumental, not identity-classifying — removes surveillance read for older kids).
> 2. **Grade sub-labels on tiles 9 and 10** ("3rd / 4th" and "4th / 5th grade") — gives 9–10-year-olds a self-concept hook without babying younger kids.
> 3. **Parent-assist nudge on age-5 tap only** — non-blocking soft prompt for the unreliable end of the band. See _Error path — age-5 self-report ambiguity_ below.
>
> Source: `design/research/psy-01-age-pick-audit.md` (Dave, 2026-04-25). Open Q #5 ("age-tile order") is resolved by this audit.

---

## Goal

Marian-or-any-kid lands here on first run. In one screen we capture the **child's name** and **age** (so age-defaults seed the skill tree), unlock iPad Safari's audio context for the rest of the session, and route to either Greet (default) or Diagnostic (opt-in). Returning users never see this screen.

## User state entering this screen

- **Splash** auto-advanced after 1.5–3.0 s of silent logo + pulsing dots. No prior tap.
- `loadProgress()` returned `null` (first-run gate already evaluated in App).
- iPad Safari's audio context is **locked** — no `speechSynthesis.speak()` has yet been honoured. Setup is the new wake-tap surface.
- A grown-up is most likely sitting next to the kid (first-run installs are usually adult-mediated). Spec accordingly: the name field assumes adult typing.

## Visual layout

Portrait-first iPad. All taps stay inside `env(safe-area-inset-*)`. Background reuses `bg-axel-cream` for screen-to-screen continuity from Splash.

```
┌─────────────────────────────────────────┐
│ env(safe-area-inset-top)                │
│                                         │
│           ┌──────────────┐              │
│           │              │              │  ← Axel idle pose, ~38vh tall.
│           │    AXEL      │              │     Centered horizontally.
│           │   (idle)     │              │     layoutId="axel" so future
│           │              │              │     screens shared-element-
│           └──────────────┘              │     transition her in.
│                                         │
│   ┌─────────────────────────────────┐   │  ← Speech ribbon. Same shape
│   │  What's your name?              │   │     as Greet ribbon (88% width,
│   └─────────────────────────────────┘   │     pink border, white fill).
│                                         │
│   ┌─────────────────────────────────┐   │  ← Name input. Tappable card.
│   │   ✏️  [your name here]          │   │     Empty placeholder uses an
│   └─────────────────────────────────┘   │     iconographic pencil glyph,
│                                         │     not a copy prompt.
│                                         │
│   So Axel knows where to start!         │  ← Age section header (per
│                                         │     PSY-01: instrumental, not
│                                         │     identity-classifying).
│   ┌────┬────┬────┬────┬────┬────┐       │
│   │ 5  │ 6  │ 7  │ 8  │ 9  │ 10 │       │  ← 6 age tiles, single row.
│   │    │    │    │    │ 3rd│ 4th│       │     Each tile 76×96pt (taller
│   │    │    │    │    │ 4th│ 5th│       │     to fit the optional grade
│   └────┴────┴────┴────┴────┴────┘       │     sub-label on 9 + 10).
│                                         │
│            ┌──────────────┐             │
│            │    START →   │             │  ← Primary CTA. Disabled until
│            └──────────────┘             │     name has ≥1 non-space char
│                                         │     AND an age is selected.
│                                         │
│    Want a more accurate start? →        │  ← Secondary link. Smaller,
│                                         │     muted, NOT a button shape.
│ env(safe-area-inset-bottom)             │
└─────────────────────────────────────────┘
```

### Component breakdown (top → bottom)

| Region | Component                | Size / placement                     | Notes                                                                                                                                                                                                                                                                                                                                                                                 |
| ------ | ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `<AxelPose pose="idle">` | `h-[38vh]`, centered                 | Same `m.img` pattern as Greet. `layoutId="axel"` shared with Greet. **Breathing loop only after first user tap** (see _Audio-unlock contract_).                                                                                                                                                                                                                                       |
| 2      | `<SpeechRibbon>`         | 88% width, max 640px, ~mt-4          | White card, 3px `axel-pink` border, rounded-3xl, padding 6/4. Text is `font-display`, `text-[2.4rem]`, `leading-snug`. Reads the active prompt; word-by-word reveal is **optional v2** (see open questions).                                                                                                                                                                          |
| 3      | `<NameInput>`            | 88% width, max 480px, mt-6           | Tappable card with rounded border, opens iOS keyboard on focus. 60pt min height. Pencil glyph left, name text or empty state right. 24-char hard cap.                                                                                                                                                                                                                                 |
| 4      | Age section header       | `text-[2.0rem] font-display`, mt-8   | "So Axel knows where to start!" — per PSY-01, instrumental framing reduces the surveillance read for older kids and gives all ages a "why". Mirrors the spoken line L3 (see _Copy_).                                                                                                                                                                                                  |
| 5      | `<AgeTileRow>`           | mt-3, 6 tiles, single row            | Each tile: 76×96pt (was 76×76pt), rounded-2xl, 3px `axel-pink` border, white fill. Numeral in `text-[2.6rem] font-display`. Tiles **9 and 10** carry a small grade sub-label below the numeral ("3rd / 4th" and "4th / 5th") in `text-[0.85rem] text-ink/60`. Selected state: `axel-rose` fill, white numeral, white sub-label, scale 1.04. Tiles 5–8 have no sub-label (no babying). |
| 6      | `<StartCta>`             | mt-10, h-[64pt] min, 240pt min width | Primary button. `axel-rose` fill, white text "Start", trailing arrow glyph. Disabled state: opacity 50%, no scale-bob.                                                                                                                                                                                                                                                                |
| 7      | `<DiagnosticLink>`       | mt-4, mb-8                           | `<button type="button">` shaped as inline link, `text-ink/70`, `text-[1.1rem]`, underline-on-hover (cosmetic; real read is iconographic). Trailing arrow glyph.                                                                                                                                                                                                                       |

### Thumb zones (iPad portrait, child-sized hand)

- Age tiles and Start CTA sit in the **bottom 50% of the safe-area rect** — both thumbs reach naturally.
- Name input sits in the middle band; tapping it opens the iOS keyboard, which itself takes the bottom half of the screen. By the time the keyboard is up the visible scroll moves Axel up, not the input down.
- The diagnostic link is intentionally **below** the Start CTA, so a hurried tap-flurry doesn't hit it by accident.

## Copy / TTS script

All Melody / Axel speech respects the ~200-word cap. **Every on-screen string is also spoken**, except numerals on the age tiles (which Axel says when first introducing the row, then is quiet about).

| #   | Trigger                                                                                 | Spoken (Axel TTS)               | On-screen text mirror                                                               | Caption-reveal timing                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L1  | Mount → first tap unlocks audio → speak L1 immediately on unlock                        | "Hi there!"                     | "Hi there!"                                                                         | Single chunk, 250 ms fade in.                                                                                                                                                        |
| L2  | After L1 ends + 400 ms gap                                                              | "What's your name?"             | "What's your name?"                                                                 | Word-by-word reveal optional (see open Qs). Chunk-fade is acceptable v1.                                                                                                             |
| L3  | After name committed (Done on iOS keyboard or Start tapped with name filled but no age) | "So Axel knows where to start!" | "So Axel knows where to start!"                                                     | Same chunk-fade. Per PSY-01: instrumental framing, not "How old are you?" (which reads as surveillance to older kids).                                                               |
| L3a | First time age-5 tile tapped in this session                                            | "Is a grown-up nearby?"         | "Is a grown-up nearby?" (in the ribbon, replacing L3 for ~3s)                       | PSY-01 parent-assist nudge. Non-blocking — tile is selected, CTA is enabled. Ribbon then returns to L3. **Plays at most once per session** even if the kid taps 5 → other → 5 again. |
| L4  | If start tapped while disabled                                                          | (no speech)                     | A 200 ms gentle Axel ear-twitch + the disabled-tile/disabled-button shake (no TTS). | —                                                                                                                                                                                    |
| L5  | After Start tap (success)                                                               | "Yay! Let's go!"                | (none — screen unmounts)                                                            | Speak synchronously inside the tap; chime fires on the same tick; advance scheduled at 600 ms (Axel happy ear-wiggle frames).                                                        |
| L6  | If diagnostic link tapped                                                               | "Okay, a few quick questions."  | "Okay, a few quick questions."                                                      | Speak synchronously inside the tap; advance scheduled at 800 ms.                                                                                                                     |

**Vocabulary used (English only, no Tagalog bridging):** _hi, there, what, name, so, axel, knows, where, to, start, is, a, grown-up, nearby, yay, let, go, okay, few, quick, questions_ — 21 unique words. Whole budget remaining for downstream screens.

**Strict rules:**

- Never any "your" before the kid has typed her name. Don't risk garbling a name we haven't seen typed yet.
- L5 ("Yay! Let's go!") **must not** include the name. The name has been captured but not yet validated for TTS pronunciation; speaking it could embarrass the child if the engine mangles it. UX-04 / UX-05 will introduce name-aware lines after a TTS-pronunciation safety pass (open Q).

## Audio-unlock contract

This is the load-bearing piece. Setup is the **first user-gesture surface** in the fresh-fork flow, so it owns the iPad Safari `speechSynthesis` unlock that Greet previously owned.

### Pattern reuse

Reuse `useAudioUnlockGate` from `src/lib/audio/useAudioUnlockGate.ts` verbatim — same hook, same watchdog, same retry mechanism. The Setup screen is to first-run what Greet's Wake state is to returning users.

### State machine

```
mount  ──►  wake  ─(first tap anywhere on safe-area)──►  intro  ──►  filling  ──►  advancing
                                                          │              │
                                                          │              └─ on Start: speak L5, chime, onAdvance
                                                          │                 on Diagnostic-link: speak L6, onAdvance(diagnostic)
                                                          │
                                                          └─ on relock (watchdog 2s, no onstart):
                                                             surface ring + finger-tap nudge again
                                                             next tap synchronously retries speak(L1)
```

| Phase       | TTS                                  | SFX                                                               | Visible UI                                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wake`      | none                                 | none (audio context locked)                                       | Axel idle (no breathing loop yet — sit perfectly still until tapped to make the silence read as "waiting for you", not "frozen"). Ring pulses around Axel after 900 ms (same `RING_REVEAL_DELAY_MS`). Full-viewport tap target. **No ribbon, no name input, no age tiles, no CTA — they all mount on first-tap.** Spec: 8s no-tap nudge with the same finger-tap inline SVG Greet uses. |
| `intro`     | speak L1 → 400 ms gap → speak L2     | chime fires on the wake-tap (silent unlock for Howler / WebAudio) | Ribbon mounts the moment the gate observes any speech (`gate.state === 'unlocked'` OR first-word-boundary fired — same `shouldShowRibbon` guard as Greet). Name input + age tiles + CTA + diagnostic link **fade in together** after L2 ends, 250 ms each, no stagger.                                                                                                                  |
| `filling`   | none (Axel is quiet while she works) | none                                                              | All inputs interactive. Disabled CTA bobs softly to draw attention but is non-interactive.                                                                                                                                                                                                                                                                                              |
| `advancing` | speak L5 (Start) or L6 (Diagnostic)  | chime on tap                                                      | Inputs fade out (200 ms). Axel cross-fades to `happy` pose for 600 ms. Then `onAdvance` fires.                                                                                                                                                                                                                                                                                          |

### Implementation contract for Kevin/Devon

```tsx
// inside Setup component
const gate = useAudioUnlockGate({ watchdogMs: 2_000 })
const [phase, setPhase] = useState<'wake' | 'intro' | 'filling' | 'advancing'>(
  'wake',
)

const handleWakeTap = () => {
  if (phase !== 'wake') {
    gate.dispatchGesture() // route through retry path if relock
    return
  }
  cancelTts()
  const sequence = buildSetupSequence({
    speakFn,
    onLine0Start: gate.reportSpeechStart,
    onLine2End: () => setPhase('filling'),
  })
  gate.wrapSpeak(() => {
    sequence.start()
    try {
      chime.play()
    } catch {}
  })
  gate.registerRetry(() => {
    sequence.cancel()
    cancelTts()
    const retry = buildSetupSequence({
      speakFn,
      onLine0Start: gate.reportSpeechStart,
      onLine2End: () => setPhase('filling'),
    })
    gate.wrapSpeak(() => retry.start())
  })
  setPhase('intro')
}

const handleStartTap = () => {
  if (!canSubmit) {
    triggerDisabledShake()
    return // no TTS, no chime
  }
  cancelTts()
  setPhase('advancing')
  // Speak L5 synchronously inside the tap. The audio context is already
  // unlocked from the wake-tap, but we still wrap so any future iPadOS
  // re-suspension is caught by the watchdog.
  gate.wrapSpeak(() => {
    speakFn("Yay! Let's go!")
    chime.play()
  })
  setTimeout(() => onAdvance({ name, age }), 600)
}
```

**Same-tick guard:** copy `wakeTapInFlightRef` from Greet — three tap handlers (`onClick` + `onTouchEnd` + `onPointerDown`) all wired to a single idempotent handler. iPad Safari quirk; Greet's comment block at lines 217–245 of `Greet.tsx` is the canonical doc, mirror it here.

**Native event recording:** also mirror Greet's `useEffect`-attached native listeners (`recordRawTapEvent` on the wake-tap target). Diagnostic-only, but priceless for the next iPad-only bug.

### What Setup does NOT do

- Does **not** cancel TTS on unmount with prejudice — `cancelTts()` is fine, but the gate hook's own unmount cleanup handles the watchdog. Don't double-call.
- Does **not** persist anything until Start is tapped. If the user backgrounds the app mid-setup, on next mount we land back on `wake`. (No half-state on the persistence layer.)
- Does **not** prompt for confirmation on the diagnostic link. The link itself is the confirmation — user-tested phrasing, low pressure.

## Motion

All values are spring-physics where listed; LazyMotion is already imported in `App.tsx`. Bundle budget per project brief: ≤ 4.6 KB delta from this screen.

| Element                                      | Trigger                           | Animation                                                                                        | Spring / duration                                             |
| -------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Axel entrance                                | Splash → Setup mount              | Slide-in from `x: -120, y: 60` to `0, 0`, opacity 0→1                                            | `{ stiffness: 220, damping: 22, delay: 0.3 }` (matches Greet) |
| Axel breathing                               | After first tap (phase ≥ `intro`) | `scale: [1, 1.05, 1]` infinite loop                                                              | `duration: 2.4s, ease: easeInOut`                             |
| Axel happy swap                              | Start-tap or Diagnostic-tap       | Cross-fade `idle` ↔ `happy` for 600 ms                                                           | Same `EAR_WIGGLE_MS` constant from Greet                      |
| Ready ring (wake state only)                 | 900 ms after mount                | Opacity 0→1 over 200 ms; then `opacity: [0.4, 0.9, 0.4]` infinite                                | `duration: 1.4s, ease: easeInOut`                             |
| Ribbon entrance                              | After gate observes speech start  | `scale: 0.9 → 1, opacity: 0 → 1`                                                                 | `{ stiffness: 260, damping: 20 }`                             |
| Name input + age tiles + CTA + link entrance | After L2 ends                     | Group fade-in, 250 ms, no stagger                                                                | `duration: 0.25, ease: easeOut`                               |
| Age tile select                              | Tap                               | `scale: 1 → 1.04`, fill swap                                                                     | `{ stiffness: 300, damping: 18 }`, ~150 ms                    |
| Disabled CTA bob                             | While disabled                    | `y: [0, -3, 0]` infinite                                                                         | `duration: 2s, ease: easeInOut`                               |
| Disabled CTA shake                           | Tapped while disabled             | `x: [0, -6, 6, -4, 4, 0]` once                                                                   | `duration: 0.3, ease: easeInOut`                              |
| Disabled-age shake                           | Start tapped with no age picked   | Same shake on the **whole age row**                                                              | Same as above                                                 |
| Wake-icon nudge                              | 8 s no-tap                        | Inline SVG finger-tap, fade in 300 ms → pulse 600 ms → hold 2.5 s → fade out 400 ms, single play | Reuses Greet's `ICON_*` constants verbatim                    |

**Reduced motion** (`prefers-reduced-motion: reduce`):

- Axel breathing → off (static).
- Ring pulse → static glow at opacity 0.5.
- Ribbon entrance → 300 ms fade only, no scale.
- Tile select → no scale, fill swap only.
- Disabled CTA bob → off.
- Disabled CTA shake → kept (it's communicating, not decorative).
- Wake-icon nudge → kept but no scale pulse, just opacity.
- Cloud drift (if backgrounds gain clouds) → off.

Use Greet's `usePrefersReducedMotion()` helper verbatim — extract to a shared module if Devon hasn't already.

## States

### Idle (wake)

Axel still + ring pulsing + cream background. **No other UI.** Full-viewport tap target above everything else (`z-50`).

### Idle (filling)

Axel breathing softly, ribbon empty (or last spoken line still showing), name input visible, age tiles visible (none selected), Start disabled and softly bobbing.

### Happy path — name typed, age selected, Start tapped

- Disabled-state styles drop instantly when `name.length > 0 && age != null`.
- On Start tap: cancel any in-flight TTS, fire chime, speak L5, cross-fade Axel idle→happy, hold 600 ms, then `onAdvance({ name, age })`.
- App writes `Progress` doc seeded with `defaultsForAge(age)` (DEV-02) and routes to **Greet**.

### Diagnostic path

- Same as Start but speak L6 instead of L5 and route to **Diagnostic** (DEV-04/05).
- The link is **always enabled** — even with no name and no age. Tapping it before filling is fine; the diagnostic itself collects ages it needs from the question bank's age-band routing. (Confirm with Matt — flagged in open Qs.)

### Error path — Start tapped while disabled

- **Never a red X. Never a "you forgot something" toast.**
- The disabled element(s) shake once (300 ms). If both name and age are missing, **only the age row** shakes — name field gets a softer pulse (the keyboard reopening is louder than a shake at this scale).
- Axel does a single 600 ms ear-twitch (not full puzzled — that's reserved for wrong answers in actual lessons). No TTS.
- The first time this happens in the session, after the shake completes, speak L3 ("So Axel knows where to start!") if no age picked, OR speak L2 ("What's your name?") if no name. Subsequent attempts in the same session: silent shake only (don't nag).

### Age-5 self-report ambiguity (PSY-01)

- Per Dave's PSY-01 audit, age-5 self-report on a numeral tile is unreliable: 5-year-olds may tap "6" because they're "almost 6", or tap a tile because the tile looks appealing. Adaptive engine recovers, but a soft parent-assist nudge cuts the bad-pick rate at near-zero cost.
- **First time the age-5 tile is tapped in a session:** the ribbon swaps to L3a ("Is a grown-up nearby?") for ~3s. Tile stays selected. CTA enables (i.e. tap is committed, not blocked). After ~3s the ribbon returns to whatever it was showing.
- **Plays at most once per session.** If the kid taps 5 → 6 → 5, the second tap of 5 doesn't re-trigger L3a.
- **Does not play for ages 6–10.** PSY-01 evidence is specific to the 5-year-old end of the band.
- **Accessibility:** the audio is the optional layer — the on-screen ribbon swap is the load-bearing communication. If TTS is muted (e.g. screen-reader user with system speech off), the ribbon swap still fires.

### Empty / first-visit (this IS first-visit)

There is no other "empty" state — Setup only ever runs once per device. On returning visits the App router skips Setup entirely.

### Return-user

Not applicable. Spec for completeness: if a developer accidentally routes a returning user here (regression), the screen should still work — i.e. don't crash on a non-null `Progress` doc. Setup's commit step uses `setProgress(seedFromAge(age, name))` which already overwrites; flag in DEV-03 acceptance that Setup must be guarded at the App level.

### Transition in

From Splash. Splash already exits `opacity: 0, duration: 0.25`. Setup mounts with Axel sliding in (see _Motion_) and a soft cream background already in place. **No flash of an empty Setup form** — the form mounts at phase `wake`, which deliberately shows only Axel and the ring.

### Transition out — Start path

Axel cross-fades `idle → happy`. Form fades out 200 ms. Whole `<m.main>` exits with the same `opacity: 0, duration: 0.25` shape Greet uses. App-level `<AnimatePresence>` orchestrates the swap to Greet.

### Transition out — Diagnostic path

Same shape. App routes to Diagnostic. (Diagnostic is a separate spec — UX-02; not in scope here.)

### Relock (silent first-utterance fail)

- Watchdog at 2 s expires with no onstart → `gate.state === 'relock'`.
- Ring + tap-target reappear. Ribbon stays visible if any words have already been revealed (per `shouldShowRibbon` rule); otherwise it stays hidden.
- Next user tap synchronously retries `speak(L1)`. From the user's perspective: a slightly delayed Axel, never an error.

## Assets required

### Reused (no new asset)

- `/assets/axel-idle.svg` (post UX-03 — Axel-the-axolotl version)
- `/assets/axel-happy.svg` (post UX-03)
- `/assets/icon-finger-tap.svg` and the inline-SVG mirror in the component (Greet's pattern; copy verbatim)
- `/assets/sfx-chime-soft.mp3` (pending Thomas; `createSfx` is already tolerant of missing asset)
- `bg-axel-cream` (Tailwind token; new value lands with UX-03)

### New (this screen)

| Asset                  | Format                      | Where                                       | Why                                                                                                   |
| ---------------------- | --------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `icon-pencil.svg`      | inline SVG                  | inside `<NameInput>`, ~24×24pt              | Empty-state glyph for the name field. Must read at small size on iPad. Reuses ink + axel-rose tokens. |
| `icon-arrow-right.svg` | inline SVG                  | inside Start CTA + Diagnostic link, 18×18pt | Direction cue. Single token: white inside the CTA, ink on the link.                                   |
| `icon-check-tile.svg`  | inline SVG, **optional v2** | overlay on a selected age tile              | v1: rely on color/scale change alone. v2 candidate.                                                   |

**No new background.** Setup uses the same cream the Splash and Greet use; visual continuity matters more than per-screen variety in the first 30 seconds of the app.

**No new SFX** — chime-soft handles every audio cue this screen needs.

### Tailwind tokens used

`bg-axel-cream` · `text-ink` · `border-axel-pink` · `bg-axel-rose` (selected tile, CTA fill) · `text-ink/70` (diagnostic link) · `text-ink/60` (grade sub-labels) · `font-display` · `text-[2.4rem]` (ribbon body) · `text-[2.6rem]` (age tile numeral) · `text-[2.0rem]` (age section header) · `text-[0.85rem]` (grade sub-label)

All tokens land with their final UX-03 values (this PR pair).

## Acceptance criteria

Jessica reads these. Each is testable on an iPad in iPad Safari + the installed PWA.

### Audio unlock

- [ ] On fresh-fork first launch (clear localStorage), Splash auto-advances to Setup with **no audio**, no SFX, and Axel sitting still (not breathing).
- [ ] Within 8 s of mount, the ready ring fades in around Axel.
- [ ] At 8 s of no tap, a finger-tap icon nudge plays once and never repeats.
- [ ] Tapping anywhere inside the safe-area rect kicks off Axel's first line ("Hi there!") within 250 ms.
- [ ] If the first speak() silently fails (iPad Safari edge case), the ring re-appears within 2 s and the next tap retries — no error copy ever shown.
- [ ] After the wake-tap, every subsequent TTS line in the session plays without re-prompting (audio context stays unlocked across screens until iPadOS suspends the PWA).
- [ ] No `speechSynthesis.speak()` is ever called outside a synchronous tap handler on this screen.

### Form / input

- [ ] Name input opens the iOS keyboard on tap. Done key on the keyboard commits the name and dismisses the keyboard.
- [ ] Name accepts up to 24 characters; the 25th keystroke is rejected (no error, just doesn't land).
- [ ] Trimming a name down to all whitespace re-disables the Start CTA.
- [ ] Age tiles are 76×96pt minimum (taller than wide to fit grade sub-labels). Tapping a tile selects it, deselects any other.
- [ ] **Tiles 9 and 10 carry visible grade sub-labels** ("3rd / 4th" and "4th / 5th") in `text-[0.85rem]`. Tiles 5–8 do not.
- [ ] Age section header reads "So Axel knows where to start!" — **never** "How old are you?".
- [ ] Selected age tile is visually distinct in BOTH color (axel-rose fill) AND scale (1.04) — color-blind users have the scale, motion-sensitive users (reduced motion) have the color. Don't drop either.
- [ ] Start CTA is disabled until name has ≥1 non-space char AND an age is selected.
- [ ] Tapping a disabled Start CTA shakes the missing field(s) and (first time only) speaks the relevant prompt. No red X, no toast, no error message.
- [ ] Diagnostic link is always enabled and visually de-emphasised relative to Start.

### PSY-01 age-5 nudge

- [ ] First tap of the age-5 tile in a session swaps the ribbon to "Is a grown-up nearby?" for ~3 s, then returns to L3.
- [ ] The age-5 nudge plays at most once per session — re-tapping the 5 tile after switching to another age does not re-trigger it.
- [ ] Tapping any other age tile (6/7/8/9/10) does NOT trigger the parent-assist nudge.
- [ ] The 5-tile selection is committed regardless of whether the nudge fired (CTA enables, tile is `axel-rose` filled).

### Routing

- [ ] On Start tap with valid input: `Progress` is written with `name`, `age`, `setupCompletedISO = now`, and `defaultsForAge(age)` seeding the skill tree. App routes to Greet.
- [ ] On Diagnostic-link tap: `Progress` is **not** written yet (Diagnostic owns its own commit). App routes to Diagnostic.
- [ ] If a returning user (`loadProgress() !== null`) somehow lands here, the screen does not crash — it renders, but the App router fix is tracked separately.

### Copy / a11y

- [ ] Every spoken line has an on-screen mirror. No spoken line is unscripted.
- [ ] No on-screen text is shown that Axel doesn't also say (excluding the age numerals after the row first introduces).
- [ ] Ribbon body text is ≥28pt (≥37px). Age tile numerals are ≥34pt. Grade sub-labels are ≥11pt (`text-[0.85rem]` ≈ 13.6px ≈ 10.2pt → adjust upward to `text-[0.95rem]` if iPad 1× rendering audits below 11pt).
- [ ] Touch target audit: every interactive element ≥60×60pt (we exceed iOS HIG's 44pt floor on purpose for the kid hand).
- [ ] All interactive elements have an `aria-label` matching what Axel says or what the icon means.
- [ ] No copy contains Tagalog, Danish, or any non-English string.

### Reduced motion

- [ ] With `prefers-reduced-motion: reduce`: Axel does not breathe; ring is a static glow; tile select drops the scale change; CTA does not bob.
- [ ] Disabled CTA shake **still plays** — it's communicating, not decorative.
- [ ] Age-5 ribbon swap (L3 → L3a → L3) **still fires** — communicating, not decorative.

### Performance

- [ ] First-paint to interactive (post-Splash) ≤ 350 ms on iPad mini gen 6 cold.
- [ ] Setup screen JS budget delta ≤ 4 KB gzipped over Greet (most logic is shared via `useAudioUnlockGate`).
- [ ] No layout-shift CLS spikes when ribbon or form mounts (use opacity/scale, not display swaps that re-flow).

## Open questions

Flag for Thomas / orchestrator routing:

1. **Word-by-word caption reveal vs chunk fade?** Greet does word-by-word via TTS boundary events. Setup ribbons are short ("Hi there!", "What's your name?", "So Axel knows where to start!", "Is a grown-up nearby?") — chunk-fade may read better at 4–6 words. **Kyle's recommendation: chunk-fade v1, defer word-by-word to v2.** PSY-01 didn't address this.
2. **Should the diagnostic link be enabled before name + age are filled?** Brief says "secondary link", which I'm reading as always-enabled. Confirm: if enabled before name, the kid never types her name, the diagnostic captures age via probes — but where does her name end up? Two options: (a) prompt for name AFTER diagnostic before Greet, (b) accept that diagnostic-path users get a default-named save until UX-04 introduces a settings sheet. Default to (b) for v1; flag (a) as a UX-01.1 follow-up.
3. **Pronunciation of "Axel" via Web Speech TTS.** Two camps: `AK-suh-lot-ul` (the salamander) vs `Axel` (the name). The kid is meeting Axel-the-axolotl, but the Web Speech English-US voice will likely say "Axel" the name regardless. **Kyle's recommendation: don't fight it — let the engine say "Axel" the name; the visual carries the axolotl read.** Document in UX-04 brief. (Confirmed in `design/axel-character-bible.md` §7.)
4. **Name TTS safety pass.** Once the kid types her name, can we say it back? Web Speech engines garble many names (especially Tagalog ones). **Recommendation: never speak the name in v1** (already baked into L5). Open: do we want a parent-facing "test how Axel says her name" affordance in the Settings sheet (future ticket)? Not Setup-screen-scope.
5. ~~**Age-tile order — 5–10 left-to-right, or 10–5 right-to-left?**~~ **Resolved by PSY-01.** Single ascending row 5/6/7/8/9/10 is fine; the babying risk for older kids is mitigated by the new instrumental header copy + grade sub-labels on 9 and 10, not by row reordering.
6. **What happens if the kid taps an age tile, then the keyboard, then the same tile again?** Should re-tapping deselect (toggle) or hold (radio)? Default: **radio behaviour, no deselect** — once an age is set, you can change it but you can't have _no_ age. Avoids the disabled-CTA-confusion path.
7. **Should the Start CTA still bob in reduced-motion mode while disabled?** Default per spec above: no. But that removes the only "I'm waiting on you" cue for reduced-motion users. **Alternate: keep bob but at 30% reduced amplitude**. Open for the next Dave consult slot.
8. **Grade sub-label phrasing globally.** PSY-01 specifies "3rd / 4th" and "4th / 5th" using US grade labels. Marian (the original target user) is in the Philippines / Danish system. **For Axelot v1 the brief is English-only and US grade labels match the band — keep as spec'd.** v2 i18n ticket can revisit. (Flagging because the grade map is not 1:1 with age in every system.)

---

**Spec version:** v1.1 · **PSY-01 folded in** (Dave 2026-04-25). Open questions remain for Thomas routing.
