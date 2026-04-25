# Greet — Copy & TTS Pronunciation Spec

**Ticket:** UX-04 (`86c9gqq0g`) · **Status:** v1
**Owner:** Kyle · **Implements:** confirms current `src/screens/greetSequence.ts` (no code change required)
**Surfaces:** Greet (Screen 2) — runs after Splash for returning users, and after Setup → (optional Diagnostic) → Greet for first-run users.

> **Scope.** UX-04 is a copy-and-pronunciation confirmation, not a redesign. The four greet lines for Axel already shipped in `src/screens/greetSequence.ts` as part of the rebrand. This spec **confirms** those lines, locks the TTS pronunciation of "Axel", and clarifies how Greet's wake-tap behaves now that **Setup is the audio-unlock surface for first-run users** (per UX-01) — which makes Greet's wake-tap a returning-user primary unlock and a first-run safety net.

---

## Goal

Lock the four-line first-greeting copy as canonical for Axel and resolve the only open question that remained from the rebrand: how the Web Speech API will pronounce "Axel" in line 2 ("I'm Axel.").

## The four lines (confirmed)

```ts
// src/screens/greetSequence.ts — current production code, lines 34–39
export const GREET_LINES = [
  'Hi!',
  "I'm Axel.",
  "It's so nice to meet you.",
  "Tap the heart when you're ready.",
] as const
```

**Verdict: keep verbatim.** No copy changes.

| Line | Spoken                          | On-screen mirror                | Notes                                                                                                                                                                                |
| ---- | ------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L1   | "Hi!"                           | "Hi!"                           | First word; the audio-unlock-watchdog target for returning users (see _Audio-unlock contract_). Triggers the `idle → happy` ear-wiggle cross-fade on the word "Hi!".                  |
| L2   | "I'm Axel."                     | "I'm Axel."                     | The pronunciation question lives here. See _TTS pronunciation of "Axel"_ below.                                                                                                       |
| L3   | "It's so nice to meet you."     | "It's so nice to meet you."     | After this line ends, the heart CTA reveals (`HEART_REVEAL_AFTER_LINE_INDEX = 2`).                                                                                                    |
| L4   | "Tap the heart when you're ready." | "Tap the heart when you're ready." | Last line. Re-played after 20 s of no-tap as the re-prompt (`REPROMPT_LINE_INDEX = 3`).                                                                                              |

**Vocabulary used (English only, no Tagalog bridging):** _hi, i, am, axel, it, is, so, nice, to, meet, you, tap, the, heart, when, ready_ — 16 unique words. Combined with Setup's 21 words and Diagnostic's 11 screen-owned words, the first-run flow uses ~45 unique words, well inside the ~200-word cap (full budget remaining for actual lessons).

**Strict rules:**

- **No new lines vs MarianLearning's first-greeting structure.** The four-line, ~400-ms-gap, heart-reveal-after-line-3 contract is preserved unchanged. Only the character name changes ("I'm Melody" → "I'm Axel").
- **No name mention before the child has typed her name.** Greet runs **before** the child has done any speaking; Axel introduces himself but does not greet the child by name. This is intentional and matches UX-01 L5 — name TTS-pronunciation safety has not been validated for arbitrary inputs in v1.
- **No Tagalog, no Danish, no other languages.** Strict English-only per project lock.
- **L4 is also the re-prompt.** No fresh string is generated; we replay the same line via `speakReprompt()` (current code). This was a deliberate choice during the MarianLearning version of this spec — preserved here.

## TTS pronunciation of "Axel"

**The question.** Axel is an axolotl (`āxōlōtl`, Nahuatl, "water dog"). The character's name shares the first two letters but is shortened. Web Speech API's English-US voices will produce different reads:

- "Axel" the **name** — rhymes with "tackle" (German / Scandinavian masculine name).
- "Axolotl" the **animal** — `AK-suh-LOT-ul` (4 syllables).
- The voice may also cough up a literal letter-by-letter spelling on rare engines.

**Decision (locked):** **Web Speech API speaks "Axel" the name.** The visual silhouette (mint axolotl, gills, heart medallion) carries the "axolotl" read; the spoken word is the character's first name. This decision was already documented in `design/axel-character-bible.md` §7 and is restated here as the canonical UX-04 contract.

**Why this is fine for Marian's audience (and ages 5–10 generally):**

- A 5-year-old hearing "Axel" attaches the sound to whatever is on screen. The visual is unambiguous; sound and visual fuse.
- A 10-year-old who knows the word "axolotl" registers "Axel" as a nickname or a friendly shortened form. (Real axolotl naming conventions in pet contexts use exactly this pattern — owners shorten "axolotl" to "axo", "lotl", or invent a name like "Axel".)
- Forcing the engine to attempt `AK-suh-LOT-ul` would require either custom phonetic markup (SSML, which Web Speech ignores in iPad Safari) or a per-name audio clip. Both are v2-scope and add bundle weight.

**No code change required.** `greetSequence.ts` already uses the literal string `"I'm Axel."`. The default Web Speech voice on iPad Safari (Samantha en-US) reads this as the name. Verified by Devon during DEV-06 routing wiring.

**Voice direction (reused from character bible §7):**

- Default Web Speech voice + `rate: 0.95` + `pitch: 1.05` (existing project defaults — `src/lib/tts.ts`).
- Soft-spoken register. Axel never speaks his own full Nahuatl name in v1.
- L1 ("Hi!") is short on purpose — it's the audio-unlock-test utterance for returning users. If the engine swallows L1 silently, the watchdog at 2 s fires and the wake-tap retries. (See _Audio-unlock contract_.)

**v2 escape hatch.** When ElevenLabs (or another higher-fidelity voice service) lands per the project tech-stack note, we can revisit and either (a) keep "Axel" the name (likely — the visual + name fusion has stuck by then) or (b) record a custom take that nods to "axolotl". UX-04 v2 ticket should re-poll Thomas at that point.

## Audio-unlock contract — Greet's role after UX-01

**Critical clarification.** Pre-Axelot (i.e. in MarianLearning), Greet was the audio-unlock surface — the wake-tap on Greet was where iPad Safari's `speechSynthesis` got its first user-gesture'd `speak()` call.

**Post-UX-01, that role moved.** **Setup is now the audio-unlock surface for first-run users** (per `design/setup-screen.md` §"Audio-unlock contract"). This changes Greet's wake-tap behaviour subtly:

| User type                       | How they reach Greet                                            | Audio context state on Greet mount                               | Greet's wake-tap role                                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **First-run, no diagnostic**    | Splash → Setup (wake-tap here) → Greet                          | `unlocked` (Setup's wake-tap unlocked it)                        | **Safety net.** A wake-tap is no longer strictly required, but Greet still renders one because of iPadOS PWA backgrounding edge cases (see below).                       |
| **First-run, with diagnostic**  | Splash → Setup (wake-tap) → Diagnostic → Greet                  | `unlocked` (still unlocked across screens)                       | **Safety net** — same as above.                                                                                                                                         |
| **Returning user**              | Splash → Greet directly (no Setup, no Diagnostic)               | `locked` (no prior user gesture in this session)                 | **Primary unlock.** Greet's wake-tap is the very first user gesture in the session and therefore the audio-unlock surface for returning users.                          |

**Implication: Greet keeps its wake-tap unchanged.** No code change to `Greet.tsx` is in UX-04 scope; the existing `useAudioUnlockGate` + Wake-tap handler covers both cases. The watchdog correctly handles the case where the audio context is *already* unlocked (it observes `onstart` from the in-progress `speak()` and clears immediately).

**Why we don't auto-skip the wake-tap for first-run users.** Two reasons:

1. **iPadOS PWA backgrounding.** If the user backgrounds the app between Setup-completion and Greet-mount (e.g. a notification interrupts), iPadOS may re-suspend the audio context. The wake-tap re-establishes the gesture context cheaply.
2. **Visual consistency.** A first-run user sees Axel sit still on Setup wake (waiting for tap), then transitions to Greet where Axel also sits still until tapped. Same gesture grammar across the app. Auto-playing L1 on Greet mount would feel jarring next to Setup's tap-to-start contract.

**One adjustment for first-run users (optional, v1.1 if needed):** the Greet wake-tap nudge ("8 s no-tap → finger-tap icon") could fire **earlier** for first-run users (e.g. 4 s instead of 8 s) since they've just finished tapping Start on Setup and may be expecting the next thing immediately. **Kyle's recommendation: keep at 8 s for v1**, monitor via QA whether first-run users stall longer than returning users.

## Acceptance criteria

Jessica reads these. Each is testable on iPad Safari + the installed PWA.

### Copy

- [ ] `src/screens/greetSequence.ts` `GREET_LINES` array is exactly:
  - `'Hi!'`
  - `"I'm Axel."`
  - `"It's so nice to meet you."`
  - `"Tap the heart when you're ready."`
- [ ] No additional lines, no removed lines, no changed punctuation.
- [ ] On-screen ribbon text matches each spoken line word-for-word.
- [ ] No spoken line includes the child's `name` (it has not been TTS-pronunciation-validated in v1).

### TTS pronunciation

- [ ] On iPad Safari with the default English-US voice (Samantha en-US), L2 reads as "Axel" the name (rhymes with "tackle") — **not** as "axolotl" and not letter-by-letter.
- [ ] No SSML / phonetic markup is added to any greet line. (Web Speech in iPad Safari ignores SSML; markup would only add complexity for no benefit.)
- [ ] Voice settings remain `rate: 0.95`, `pitch: 1.05` (existing `src/lib/tts.ts` defaults — confirm unchanged).

### Audio-unlock behaviour

- [ ] **Returning user path:** Splash → Greet. Audio context starts `locked`. Greet's wake-tap is the audio-unlock; L1 plays within 250 ms of the first tap.
- [ ] **First-run-no-diagnostic path:** Splash → Setup → Greet. Audio context arrives at Greet `unlocked`. Greet still renders the wake-tap (visual consistency + iPadOS-suspension safety net). After the wake-tap, L1 plays as normal.
- [ ] **First-run-with-diagnostic path:** Splash → Setup → Diagnostic → Greet. Audio context still `unlocked`. Same wake-tap behaviour as above.
- [ ] If the audio context re-suspends between Setup and Greet (iPadOS edge case), the watchdog at 2 s re-prompts via the same ring + finger-tap-icon nudge.

### Re-prompt

- [ ] After 20 s of no heart-tap (`REPROMPT_AFTER_MS = 20_000`), L4 ("Tap the heart when you're ready.") re-plays exactly once.
- [ ] No fresh re-prompt copy is generated — the spec uses the same string as L4.

### Heart reveal

- [ ] The heart CTA reveals after L3 ends (`HEART_REVEAL_AFTER_LINE_INDEX = 2`, 0-based, so the third line).
- [ ] On heart-tap, `idle → happy` cross-fade (600 ms) plays before navigation advances.

### A11y / reduced motion

- [ ] Reduced-motion users still hear all four lines and see the on-screen mirror; only ear-wiggle / breathing animations are reduced.
- [ ] Each line has a corresponding on-screen text ribbon (mirror contract).
- [ ] No copy contains Tagalog, Danish, or any non-English string.

## Open questions

Flag for Thomas / orchestrator routing:

1. **Should the wake-tap nudge fire earlier (4 s) for first-run users, since they just tapped Start on Setup?** Kyle's recommendation: **no, keep 8 s for v1**, revisit if QA shows first-run stall behaviour.
2. **Future name-aware copy.** The strict no-name rule is a v1 concession (TTS pronunciation safety). When we land a name-pronunciation safety pass (separate ticket — likely under Settings sheet work), Greet could become "Hi! I'm Axel. It's so nice to meet you, [Name]. Tap the heart when you're ready." — but that's out of UX-04 scope. **Defer.**
3. **L1 "Hi!" as audio-unlock test utterance.** A single-syllable line is the right shape for the watchdog (small failure window if the engine swallows it). Confirm Thomas is happy with the brevity for returning users (who only see Greet) — alternative is "Hi there!" matching Setup's L1, which is one more word but reads warmer. **Kyle's recommendation: keep `'Hi!'` as-is** to preserve the existing tested code path; switching would mean Devon re-validating the boundary-event WPM math for word-by-word reveal. Re-flag if Thomas wants warmth parity with Setup.
4. **v2 ElevenLabs voice.** When ElevenLabs lands, do we re-record Axel saying his own name with the salamander pronunciation, or stick with "Axel"? **Kyle's recommendation: stick with "Axel"** — by the time ElevenLabs ships, the visual + name fusion is set and changing the spoken name would disrupt the character read. Flag as a UX-04 v2 ticket prompt for Thomas.

---

**Spec version:** v1 · **Locks:** four-line greet copy, "Axel" pronunciation as the name, Greet's wake-tap role split between primary-unlock (returning) and safety-net (first-run). **No code change required**; this spec confirms current production code in `src/screens/greetSequence.ts`.
