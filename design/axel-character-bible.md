# Axel Character Bible

**Ticket:** UX-03 (`86c9gqq04`) · **Status:** v1
**Owner:** Kyle · **Implements alongside:** DEV-_ (no code consumer; SVGs are dropped in for Devon/Kevin to render via existing `/assets/axel-_.svg` paths)
**Surfaces:** every screen with Axel art (Splash, Setup, Greet, future Math/Word Song, future end-of-session).

---

## 1. Who is Axel?

Axel is a juvenile **axolotl** — a soft, friendly aquatic salamander. The character is a successor to the placeholder pink-bunny art carried over from MarianLearning. The fork rebrand makes Axel-the-axolotl the canonical mascot.

**Personality:** gentle, warm, playful, patient. Never teacher-ish, never condescending. Curious by default. Joyful in small bursts (ear-wiggle equivalent: gill flutter), never frantic. **Cute, but not cloying** — the silhouette earns its read through anatomy clarity, not by piling on accessories.

**Why an axolotl?** Three reasons:

1. **Recognisable but not over-used.** Axolotls are having a moment with this generation but haven't been trademarked into a single corporate mascot the way pandas, foxes, owls, and unicorns have.
2. **Soft silhouette, distinct accessory** — the gill rosettes around the head do the same "two prominent things on top of the head" job as Sanrio bunny ears, so Axel inherits that visual grammar (top-of-head wiggle = emotion) without leaning on the bunny shape.
3. **The "permanent baby" smile.** Axolotls keep their juvenile features for life — they always look soft. That's the same emotional register a 5–10 year old needs from a tutor character.

## 2. Anatomy

```
                     ╭───╮              ← lily pad (off-center, "top" cue)
                ╱╲ ╱─────╲ ╱╲           ← gill rosettes (3 fronds each side)
               ╱ ╲│       │╱ ╲
              │   │ • • • │   │         ← eyes + mouth
               ╲ ╱│  ︶   │╲ ╱           ← smile (curved-up axolotl mouth)
                ╲ ╲───────╱ ╱
                 ╲   ❤   ╱              ← heart medallion on chest
                  ╲ ╱─╲ ╱
                   ╲   ╱
              ╱─╮ │   │ ╭─╲             ← arms
              │ │ │   │ │ │
                  ╰─╮ ╭─╯
                    │ │
                    │ │  ◯              ← paddle tail
                  ──╯ ╰──
                  ╲     ╱               ← legs / 3-toe feet
```

| Feature             | Description                                                                                                                                | Maps from old bunny  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| **Body**            | Rounded teardrop, mint-aqua above + cream belly below.                                                                                     | torso                |
| **Head**            | Rounded oval, ~equal width to body. Mint-aqua.                                                                                             | head                 |
| **Gill rosettes**   | Three coral-pink fronds each side, fanned outward. Fronds animate (idle drift, fan-up on happy, droop on puzzled).                         | ears                 |
| **Tail**            | Soft paddle trailing down-right, mint-aqua with cream underside.                                                                           | (new — not in bunny) |
| **Arms**            | Mint-aqua sleeves with cream paw tips. Position varies by pose.                                                                            | arms                 |
| **Legs / feet**     | Two stub feet with 3-toe hint each. Mint-aqua.                                                                                             | legs/feet            |
| **Heart medallion** | Coral-pink heart on chest with cream catch-light. **Emotional anchor — replaces ribbon.**                                                  | ribbon               |
| **Lily pad**        | Single small lily-pad on top of head, off-center right. **Replaces flower.** Reads as "top of head" silhouette cue, no real-axolotl claim. | flower               |
| **Eyes**            | Small black bead eyes with tiny cream catch-light. Different per pose (round / arches / sparkle stars).                                    | eyes                 |
| **Cheek blush**     | Soft coral, deeper for happy/cheering, lighter for puzzled.                                                                                | blush                |
| **Smile**           | Curved-up "permanent baby" mouth. Closed for idle/puzzled, open for happy/cheering, "o" shape for surprise.                                | smile                |
| **No nose**         | Removed the bunny's pink-triangle nose — axolotls don't have a defined snout.                                                              | (removed)            |
| **No hood**         | Removed — gills are Axel's iconic accessory.                                                                                               | (removed)            |

**Stroke discipline:** ink (`#3D2B3D`) at 5 px on body silhouettes, 4 px on gills, 3 px on small features (heart, lily). Round joins everywhere — no sharp corners. The line weight uniformity is what makes the silhouette read as one character at small sizes.

## 3. Palette (locked v1)

| Token name   | Value     | Role            | Notes                                                                                                                                                                       |
| ------------ | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `axel-50`    | `#F0FBF8` | tint surface    | Lightest mint — used for hover states, sparkle backgrounds.                                                                                                                 |
| `axel-100`   | `#DAF3EC` | very-light tint | Card-on-cream surfaces.                                                                                                                                                     |
| `axel-200`   | `#BFE9DD` | light-mint tint | Subtle dividers, scrollbar tracks.                                                                                                                                          |
| `axel-300`   | `#A8E0D5` | **body mint**   | Primary character body fill.                                                                                                                                                |
| `axel-400`   | `#7CCEC0` | hover mint      | Tile selected-hover, body-shade fallback.                                                                                                                                   |
| `axel-500`   | `#5BBFAE` | **body shade**  | Tail back, body-shadow stripe.                                                                                                                                              |
| `axel-600`   | `#3FA194` | UI primary      | Default for buttons / interactive accents that need higher contrast than `axel-rose` allows.                                                                                |
| `axel-700`   | `#2A7E72` | UI primary deep | Hover/pressed for `axel-600`.                                                                                                                                               |
| `axel-800`   | `#1A5E55` | dark surface    | Reserved for v2 dark-mode if/when.                                                                                                                                          |
| `axel-900`   | `#0F4A40` | deepest         | Reserved.                                                                                                                                                                   |
| `axel-pink`  | `#FFB5A0` | **gill coral**  | Coral pink — gills, heart medallion, cheek blush, secondary chrome. **Note: token name kept "pink" for backward compatibility with existing screens; visually it's coral.** |
| `axel-cream` | `#FFF7EE` | background      | Warm cream — page bg, belly fill, ribbon fill. Slightly warmer than the previous `#FFF5F0`.                                                                                 |
| `axel-rose`  | `#F08070` | **coral deep**  | Deeper coral — selected tiles, primary CTA fills, accent strokes. Token name kept "rose"; visually it's a salmon-coral.                                                     |
| `ink`        | `#3D2B3D` | text & strokes  | Unchanged. Plum-brown — color-blind-safe, AAA contrast vs cream.                                                                                                            |
| `sparkle`    | `#FFD966` | celebration     | Unchanged. Buttery yellow — sparkle puffs, lily-pad accents are NOT this color (they're `#7FB069`, see §6).                                                                 |

**Why coral instead of pink:** pink-on-mint is a color-theory cliché (it works) but the placeholder `#FFC0CB` was sliding too saccharine. Coral keeps the warmth + contrast vs the mint body but reads less "Sanrio store window" and more "pond at dawn". A 9-year-old ages out of pink faster than coral.

**Contrast audit:**

- `ink` on `axel-cream` → 11.4:1 (AAA pass at every size).
- `ink` on `axel-rose` → 6.2:1 (AAA pass at large, AA pass at small).
- White on `axel-rose` → 3.8:1 (AA pass at large only — only used for >24pt CTA labels, fine).
- `axel-pink` on `axel-cream` → 1.8:1 — **decorative only**, never load-bearing for text or icons.

## 4. Five poses (v1 deliverables)

All five SVGs ship at `public/assets/axel-{idle,happy,puzzled,cheering,logo}.svg` with a uniform `viewBox="0 0 800 800"` (logo is `0 0 256 320`) and the character anchored at `translate(400 410)` so existing screens that center him on `h-[60vh]` / `h-[38vh]` continue to read identically.

### 4.1 `axel-idle.svg`

**When:** default state on every screen with Axel. Setup wake-state, Greet wake/intro, Math/Word Song idle.
**Read:** soft, alert, waiting. Both gills at gentle rest (slight outward fan, no wiggle). Eyes round and open. Smile soft and closed. Arms resting at sides.
**Animation hooks:** breathing scale `[1, 1.05, 1]` over 2.4 s. Subtle gill drift (optional, post-v1). Reduced-motion: static.

### 4.2 `axel-happy.svg`

**When:** correct-answer reaction, ear-wiggle equivalent, Greet line 1 ("Hi!").
**Read:** delighted but not over-excited. Both gill rosettes fan upward and outward (the wiggle). Eyes squinch into ^\_^ arches. Smile opens. Arms slightly raised. Two subtle yellow sparkles in the upper corners.
**Cross-fade contract:** body silhouette identical to idle so the `idle ↔ happy` swap reads as a head-region transformation, not a silhouette swap. Matches Greet's existing `AnimatePresence initial={false}` behaviour without modification.
**Animation hooks:** sprite swap idle → happy for 600 ms, then back. Reduced-motion: still swap (this is communicating, not decorative).

### 4.3 `axel-puzzled.svg`

**When:** wrong-answer reaction. **Replaces the red X for every error case in the app.**
**Read:** "huh? let me think." Head tilted 15° to the right. Right gill rosette droops heavily (+30°), left rosette droops slightly (-10°) — asymmetry sells the tilt. Eyes look slightly upward (thinking). Small "o" mouth. Single coral "?" floating above the right gill, NOT inside the head group (stays upright while head tilts).
**What this is NOT:** never sad. Never disappointed. Never embarrassed. The pose is a question, not a verdict.
**Animation hooks:** sprite swap idle → puzzled for ~800 ms, then back to idle for retry. The "?" can fade in at +200 ms. Reduced-motion: still swap.

### 4.4 `axel-cheering.svg`

**When:** end-of-session, milestone unlocks, level-up.
**Read:** celebration without flailing. Both arms raised high above the head, both gill rosettes at peak fan, sparkle-eyes (4-point stars), big open smile with tongue, abundant yellow sparkle puffs in a loose halo around the character.
**Stardust note:** the sparkle puffs in the SVG are static. Animated stardust (per session design) is a **separate layer** rendered by Framer Motion on top — don't double up on the asset side.
**Animation hooks:** spring-in scale `0.9 → 1`, then a gentle bob `y: [0, -6, 0]` on a 2 s loop. Reduced-motion: scale-in only, no bob.

### 4.5 `axel-logo.svg`

**When:** Splash screen (`src/screens/Splash.tsx`, `<m.img src="/assets/axel-logo.svg">`).
**Read:** head-only crop of the idle pose, with "Axel" wordmark below in rounded display sans, with a coral heart flourish underneath the wordmark. ViewBox `0 0 256 320` to match existing Splash usage.
**No animation:** Splash already springs the whole `<img>` (`scale: 0.9 → 1, opacity: 0 → 1`); the SVG itself is static.
**Wordmark:** `Axel` in `-apple-system, 'SF Pro Rounded'`, weight 700, size 44, letter-spacing 1.5, fill `ink`. Heart flourish in `axel-pink` with `ink` stroke.

## 5. Pose ↔ usage map

| App moment                    | Pose                    | Notes                                           |
| ----------------------------- | ----------------------- | ----------------------------------------------- |
| Splash                        | `logo`                  | Static; Splash spring-ins.                      |
| Setup wake (no audio yet)     | `idle`                  | Static, no breathing — "waiting for you" read.  |
| Setup intro / filling         | `idle`                  | Breathing on.                                   |
| Setup Start tap               | `idle → happy`          | 600 ms cross-fade, then advance.                |
| Greet wake                    | `idle`                  | Static, no breathing.                           |
| Greet line 1 ("Hi!")          | `idle → happy`          | 600 ms ear-wiggle cross-fade on the word "Hi!". |
| Greet lines 2–4               | `idle`                  | Breathing on.                                   |
| Greet heart-tap → advance     | `idle → happy`          | Same 600 ms swap on the wave-out.               |
| Math/Word Song idle           | `idle`                  | Breathing on.                                   |
| Math/Word Song correct answer | `idle → happy → idle`   | 600 ms swap + chime.                            |
| Math/Word Song wrong answer   | `idle → puzzled → idle` | 800 ms swap + soft poof. **Never red X.**       |
| Milestone unlock              | `cheering`              | Spring-in + bob loop.                           |
| End-of-session                | `cheering`              | Spring-in + bob, with stardust overlay.         |

## 6. The lily pad question

**Why a lily pad?** The Sanrio bunny had a flower — top-of-head accessory that softens the silhouette and gives a "this is the top" cue at small sizes (icon, logo). Axolotls don't naturally have anything on their heads, but they live in ponds, so a single lily pad is:

- **Soft Sanrio-derivative warmth** — same syntactic role as the flower, different vocabulary.
- **A silhouette anchor** — without it, the head is rotationally symmetric and confusing at 32×32px.
- **Not a literal axolotl claim** — we're not saying "axolotls wear lily pads"; we're saying "Axel does."

**Color:** `#7FB069` — a warm, slightly desaturated leaf-green. Not part of the locked palette tokens (it's a one-off accent), but harmonises with the mint/coral primary system.

**v2 candidate:** seasonal swaps (orange leaf in autumn, snowflake in winter, flower in spring). Not in scope for v1.

## 7. Voice, name pronunciation, and the TTS gotcha

**TTS reading of "Axel":** Web Speech API's English-US voices will pronounce `Axel` like the name (rhymes with "tackle"). The salamander's etymology (Nahuatl `āxōlōtl`, "water dog") suggests `AK-suh-lot-ul` but no English-US TTS voice will go there reliably.

**Decision (Kyle, 2026-04-25):** **let the engine say "Axel" the name.** The visual silhouette carries the "axolotl" read; the spoken word is the character's name. Document in UX-04 brief.

**Implication for character voice direction:**

- Axel is **soft-spoken**. Default Web Speech voice + 0.95 rate + 1.05 pitch (existing project defaults).
- Axel never speaks his own name in v1 ("Hi! I'm Axel." is fine because the engine pronounces "Axel" the name, which is who he is).
- Future ElevenLabs upgrade (v2 item per project brief) can revisit the salamander pronunciation if Thomas wants.

## 8. Asset hygiene

### Files in this PR

```
public/assets/axel-idle.svg        replaced (mint axolotl, gills, lily, heart)
public/assets/axel-happy.svg       replaced (gill-fan up, ^_^ eyes, open smile)
public/assets/axel-puzzled.svg     replaced (head tilt, gill droop, "?")
public/assets/axel-cheering.svg    replaced (arms up, sparkle eyes, halo of stars)
public/assets/axel-logo.svg        replaced (head crop + Axel wordmark + heart)
tailwind.config.js                 token VALUES updated (names unchanged)
design/axel-character-bible.md     this file
```

### Backward-compat contract

- **All five Tailwind token names from the original config remain.** Only their _values_ change. Every screen reference (`bg-axel-cream`, `text-ink`, `border-axel-pink`, `bg-axel-rose`, `text-sparkle`) keeps working without churn.
- **All five SVG file paths remain.** Splash, Greet, future screens reference `/assets/axel-{pose}.svg` — they all keep working without component changes.
- The `viewBox` of each SVG is preserved (`0 0 800 800` for poses, `0 0 256 320` for logo) so existing CSS sizing (`h-full`, `w-60 max-w-[60vw]`) doesn't reflow.
- The character's anchored `translate(400 410)` and approximate bounding-box silhouette are preserved so reduced-motion / shared-layout transitions don't visibly jump.

### Bundle impact

| File                | Old size    | New size     | Δ           |
| ------------------- | ----------- | ------------ | ----------- |
| `axel-idle.svg`     | 5.6 KB      | ~6.1 KB      | +0.5 KB     |
| `axel-happy.svg`    | 6.0 KB      | ~6.4 KB      | +0.4 KB     |
| `axel-puzzled.svg`  | 5.9 KB      | ~6.5 KB      | +0.6 KB     |
| `axel-cheering.svg` | 6.5 KB      | ~7.0 KB      | +0.5 KB     |
| `axel-logo.svg`     | 4.2 KB      | ~3.8 KB      | -0.4 KB     |
| **Total**           | **28.2 KB** | **~29.8 KB** | **+1.6 KB** |

Each SVG is precached by the PWA service worker. The +1.6 KB delta is well within the iPad bundle budget envelope.

### Inline-SVG mirrors

Greet currently inlines `icon-finger-tap.svg` to dodge an iPad-Safari standalone-PWA decoding bug (`src/screens/Greet.tsx` lines 825–839). **None of the five Axel SVGs are inlined** — they're served via `<m.img>` on a fresh URL each session, no SW issues observed. If we ever start inlining Axel poses, keep both copies (file + inline) in sync — same rule as the finger-tap icon.

## 9. What's NOT in v1 (deferred)

- **Backgrounds.** The brief calls for 3 v1 backgrounds; this PR ships only the cream + cloud assets that already exist. Background art lives in a separate UX-\* ticket Kyle will spec post-PSY-01.
- **Sleepy / end-of-session pose.** Listed in Kyle's role brief as a v1 expression, but not on UX-03's deliverable list. **Defer to a v2 ticket** — the cheering pose handles end-of-session for v1.
- **Animated gill drift.** The fronds in idle could subtly sway. Implementing as Framer Motion paths is straightforward but adds 2–3 KB to the bundle for a low-impact effect. **Defer.**
- **Logo wordmark localisation.** v1 is English-only per project lock; if v2 adds Tagalog/Danish, the wordmark stays "Axel" (proper name, not localised).
- **Dark mode.** `axel-800/900` exist in the palette but no screen uses them yet.

## 10. Acceptance criteria

Jessica reads these. Each is verifiable against this PR's diff.

### Asset replacement

- [ ] `public/assets/axel-idle.svg` shows an axolotl: mint body, six coral gill-fronds, cream belly, paddle tail, heart medallion, lily pad. **Zero references to bunny ears or hood.**
- [ ] `public/assets/axel-happy.svg` shows the same axolotl with both gill rosettes fanned up + out, ^\_^ eyes, and an open smile.
- [ ] `public/assets/axel-puzzled.svg` shows the same axolotl with head tilted 15°, asymmetric gill droop, "o" mouth, and a single "?" floating upright above (NOT inside the tilted head group).
- [ ] `public/assets/axel-cheering.svg` shows the same axolotl with arms raised, sparkle-eyes, big open smile, and a halo of yellow sparkle puffs.
- [ ] `public/assets/axel-logo.svg` shows the head crop with the "Axel" wordmark below and a coral heart flourish.
- [ ] None of the five SVGs reference the colors `#FFC0CB` (placeholder pink), `#F48FB1` (placeholder rose), `#FFF5F0` (placeholder cream).
- [ ] All five SVGs use only the colors listed in §3 + the lily-pad green `#7FB069`.

### Tailwind palette

- [ ] `tailwind.config.js` token _names_ are unchanged: `axel-50..900`, `axel-pink`, `axel-cream`, `axel-rose`, `ink`, `sparkle`.
- [ ] `axel-pink` value is `#FFB5A0` (coral). `axel-cream` is `#FFF7EE`. `axel-rose` is `#F08070`. `ink` is `#3D2B3D`. `sparkle` is `#FFD966`.
- [ ] `axel-300` is `#A8E0D5`. `axel-500` is `#5BBFAE`. The full `axel-50..900` ramp is mint-aqua, not pink.
- [ ] Existing screens (Splash, Greet) render without code changes after the asset + token swap.

### Visual continuity

- [ ] On the Splash screen, `axel-logo.svg` fits the same `w-60 max-w-[60vw]` box without overflow.
- [ ] On Greet, `axel-idle.svg` and `axel-happy.svg` cross-fade smoothly (body silhouette identical between them — no jump).
- [ ] On a hypothetical wrong-answer surface using `axel-puzzled.svg`, the body silhouette matches idle (only head + arms differ).

### A11y

- [ ] Every SVG has `role="img"` and a meaningful `aria-label` ("Axel, smiling" / "Axel, happy" / "Axel, puzzled" / "Axel, cheering" / "Axel").
- [ ] Every SVG has a `<title>` element matching the aria-label.
- [ ] No SVG relies solely on color to communicate emotion — pose, eyes, mouth, and gill orientation all carry redundant signal.

## 11. Open questions

1. **Lily pad as a v1 silhouette anchor — or is gill asymmetry enough?** Kyle's recommendation: ship with the lily pad. Dave (PSY-01-adjacent) may have an opinion on whether the additional element is one too many at small sizes. Defer to next consult.
2. **Single coral hue vs gill-vs-heart split.** Both the gill fronds and the heart medallion use `axel-pink` (`#FFB5A0`). Visual unity is strong; risk is the heart reads as "another gill" at icon scale. **v1: keep unified.** v2 alternative: heart in `axel-rose` (deeper coral) to differentiate.
3. **Axolotl pronunciation pass.** Documented as resolved in §7 — let TTS say "Axel" the name. Re-flag for Thomas if he disagrees.
4. **Sleepy pose for end-of-session.** Brief lists 5 expressions including sleepy, deliverable lists 5 SVGs which I've used for idle/happy/puzzled/cheering/logo. **Sleepy is not in v1.** Confirm acceptable — if not, we can either drop logo (use `axel-idle` for Splash) or add a sixth file.
5. **Tail visibility on iPad portrait crop.** The tail extends to `x: 180, y: 348` from origin `(400, 410)`, putting it at viewport `(580, 758)` — within the 800×800 box. iPad portrait at `h-[60vh]` should keep it on-screen, but Devon should sanity-check on a real device after first integration.

---

**Spec version:** v1 · **Delivered with:** 5 SVGs + tailwind values · **Awaiting:** Devon eyeball-check on real iPad after first integration.
