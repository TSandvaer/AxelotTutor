/**
 * Diagnostic engine + screen interface contract.
 *
 * Source of truth for the `Probe` shape Kyle's UX-02 screen
 * (`design/diagnostic-screen.md`) renders directly off. The shape is
 * fixed by Kyle's spec — keep this file aligned with that spec, not the
 * other way around. Any change here is a UX-02 ↔ DEV-04 negotiation,
 * routed through Matt.
 *
 * PSY-02 (`design/research/psy-02-diagnostic-audit.md`) shaped the
 * `probeType` taxonomy, the `ageBand` field, the `difficulty` flag (used
 * by the engine's winnable-first rule), and the early-stop signal in
 * `DiagnosticResult`.
 */

import type { Age, SkillLevel, SkillNode } from '../progress/types'

// --------------------------------------------------------------------------
// Probe shape — Kyle UX-02 contract.
// --------------------------------------------------------------------------

/** What kind of stem/answer interaction the screen renders. */
export type ProbeType =
  | 'dot-array' // math, age 5: dot cluster stem, numeral choices
  | 'numeral' // math, ages 6–10: numeral / expression stem, numeral choices
  | 'letter-name-audio' // literacy, ages 5–6: speaker stem, letter choices
  | 'letter-sound-audio' // literacy, ages 5–6: speaker stem (phoneme), letter choices
  | 'cvc-image' // literacy: speaker stem, image choices

/**
 * Logical domain — math vs literacy. Not on Kyle's `Probe` interface
 * directly (he derives it from `probeType`), but the engine's composition
 * rule "3 math + 3 literacy" needs an explicit grouping. We expose a
 * helper rather than carry a redundant field on every probe.
 */
export type ProbeDomain = 'math' | 'literacy'

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
   * Path convention: `/assets/diagnostic/cvc/<word>.svg`. Asset folder
   * lands with DEV-05; v1 illustrations are a Kyle follow-up if Thomas
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
   * `'easy'` probe for slot 0 within each domain bucket. Slots 1+ may use
   * any difficulty.
   */
  difficulty?: 'easy' | 'medium' | 'hard'
}

// --------------------------------------------------------------------------
// Engine input/output types.
// --------------------------------------------------------------------------

/** Per-call probe set produced by the engine. Cap differs by age. */
export interface ProbeSet {
  /** Length is 4 if `forAge === 5`, else 6. */
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
