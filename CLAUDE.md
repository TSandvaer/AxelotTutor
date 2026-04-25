# Axelot Tutor — Project Brief

## Mission

A friendly, ad-free, dark-pattern-free **PWA tutor for kids ages 5–10**, themed
around **Axel the axolotl**. Math (number sense → low multiplication) and
literacy (letter names → simple sentences). Audio-first, iPad-first,
home-screen-installable. The mascot speaks every instruction; on-screen text
mirrors what's spoken so kids get passive reading exposure without the
interface demanding fluent reading.

Forked from MarianLearning (a one-child variant). The big shift in Axelot:
**no offline-baked diagnostic** — every kid lands on an **in-app setup phase**
(name + age picker + optional adaptive diagnostic) on first run. Returning
users skip setup.

## Locked decisions

1. **Bootstrap by forking MarianLearning** — repo at
   `https://github.com/TSandvaer/AxelotTutor.git`, local at
   `C:\Trunk\PRIVATE\Axelot-tutor`. No carried git history.
2. **Setup flow** — age picker first; diagnostic optional ("Want a more
   accurate start?" affordance).
3. **Age range** — **5–10** out of the box (K through ~G5).
4. **Skill tree** — reuse Marian's 10 math + 7 literacy nodes verbatim;
   replace the hardcoded defaults with an age→levels mapping.
5. **English-only v1.**

## Scope budget

A small part-time team (orchestrator + Matt + Kyle + Kevin + Devon + Jessica
plus Dave on consult). Treat the budget as ruthless: bias toward shipping the
smallest useful slice, ask before scope-creeping a ticket, and protect
against patterns that don't ship.

## Tech stack (locked)

- **React 19 + TypeScript + Vite 7 + Tailwind 3.4**
- **Framer Motion** (`motion` v12) for animation; `LazyMotion` + `m.*`
  components — iPad bundle budget matters
- **Web Speech API** (TTS) for Axel's voice in v1; ElevenLabs is a v2 item
- **Howler.js** for SFX
- **Claude API via Vercel Function** (`api/claude.ts`); the API key lives
  server-side only (`ANTHROPIC_API_KEY`), never in the bundle
- **localStorage** for progress (`axelot-tutor:progress:v1`); no database
- **PWA** (Workbox via `vite-plugin-pwa`, injectManifest strategy)
- **Vitest** + Testing Library; Husky pre-commit runs `yarn typecheck` +
  `lint-staged`

## Two skill trees

### Number Garden (math) — 10 nodes

`number-recog`, `add-to-10`, `add-to-20`, `sub-to-10`, `sub-to-20`,
`two-digit-addsub`, `skip-counting`, `mult-2-5-10`, `mult-3-4`, `mult-6-9`.

### Word Song (literacy) — 7 nodes

`letter-names`, `letter-sounds`, `blending-cv`, `cvc-words`, `digraphs`,
`sight-words`, `simple-sentences`.

Each node carries a `SkillLevel`: `'locked' | 'intro' | 'practicing' | 'mastered'`.
Mastered facts roll into a 5-box Leitner spaced-repetition rotation.

## Setup-phase contract (v2 schema target)

On first run (`loadProgress() === null`):

1. **Splash** auto-advances → **Setup** (the audio-unlock surface).
2. **Setup** asks for `childName` (24-char cap) and `age` (one of 5/6/7/8/9/10
   tappable tiles), plus a "Start" CTA and a secondary "Want a more accurate
   start?" link.
3. On Start: write a v2 `Progress` doc seeded with `defaultsForAge(age)` and
   navigate to **Greet**.
4. On the secondary link: navigate to **Diagnostic** (~6 probes, 3 math + 3
   literacy, age-band-bounded). Each probe nudges its target node ±1 level
   within `['locked','intro','practicing','mastered']` (clamped). Then go
   to Greet.

Returning users (`loadProgress() !== null`): Splash → Greet directly.

The full design lives in the implementation plan: see
`C:\Users\538252\.claude\plans\glittery-imagining-pine.md` (kept locally;
not in repo) and the per-ticket UX/dev specs Kyle and Kevin/Devon produce
under `design/`.

## Non-negotiables (UX rules)

- **No red X.** Wrong answers get a puzzled Axel, a gentle sound, and a
  retry. Correct answers get a happy reaction + chime + sparkles.
- **Audio-first, text-mirror.** Axel speaks every instruction; on-screen
  text mirrors his words.
- **No dark patterns.** No variable-ratio rewards, no fake urgency, no
  social pressure, no streak-shame. Stardust and unlocks are generous and
  predictable.
- **Age-appropriate at both ends.** A pattern that works at 8 may overwhelm
  at 5 or feel babyish at 10. Spec for the band, not a single age. Dave
  audits the extremes (PSY-01 / PSY-02).
- **iPad-native touch targets.** 44pt minimum per iOS HIG. Thumb-reachable
  primary actions. Portrait-first.
- **No secrets in the bundle.** Claude API key on Vercel side only.
- **No persistent identifiers / analytics** beyond the local progress file.

## Team

Six agents: **Matt** (lead), **Kyle** (UX), **Kevin** + **Devon** (devs),
**Jessica** (QA), **Dave** (child-psych consultant). The orchestrator is
the single fan-out / fan-in point — see `.claude/agents/TEAM.md` for the
full topology and per-agent role.

ClickUp list: `901523009984` (workspace `90151646138`,
space `90156932495`).

## Path-of-work (high-level)

Phase 0 (orchestrator-driven bootstrap) is complete: source forked from
MarianLearning, branding and identifiers updated, team agents rebranded.
Phase 1 (Matt seeds the ClickUp board with UX-01..04, DEV-01..07,
QA-01..03, PSY-01..02) starts after the initial commits land.
Phases 2+ follow the standard topology (Kyle → Kevin/Devon → Jessica →
Thomas).

## What lives where

- `src/screens/` — Splash, Greet, Math (stub). Setup/Diagnostic screens
  arrive in DEV-03 / DEV-05.
- `src/lib/progress/` — Persisted document model. Schema bumps to v2 in
  DEV-01 (adds `age`, `setupCompletedISO`, `diagnosticCompletedISO`).
- `src/lib/setup/` — Will hold `ageDefaults.ts` (DEV-02) and
  `diagnosticEngine.ts` (DEV-04).
- `src/content/diagnostic.ts` — Probe item bank (DEV-04).
- `src/lib/{tts,audio,sfx}/` — Reusable from MarianLearning; Axel-agnostic.
- `api/claude.ts` — Vercel function (stub).
- `public/assets/axel-*.svg` — Placeholder pink-bunny art carried from the
  fork. Kyle replaces in UX-03.
- `design/` — Empty after rebrand; Kyle (UX specs, character bible) and
  Dave (research notes under `design/research/`) repopulate.
- `qa/` — Empty after rebrand; Jessica repopulates as features ship.
