/**
 * Age → SkillLevels matrix for Axelot Tutor's first-run setup phase.
 *
 * The setup screen always provides an age (5..10 tile picker, see CLAUDE.md
 * "Setup-phase contract"). `defaultsForAge(age)` returns the seed
 * `SkillLevels` map for a brand-new profile at that age — no fallback
 * default; callers must pass an `Age`.
 *
 * The matrix below is the anchor for first-run pacing. The optional
 * diagnostic (DEV-04) only nudges levels ±1 around these defaults, so
 * getting these cells right matters more than the diagnostic step does.
 *
 * Design principles
 * -----------------
 * - **Monotonic across ages.** For any node, level(age+1) >= level(age) on
 *   the `locked < intro < practicing < mastered` ladder. A 6-year-old
 *   never starts behind a 5-year-old on the same node.
 * - **K through ~G5 calibration.** Age 5 = kindergarten entry, age 10 =
 *   end of Grade 5. Cells track typical US standards so the seed isn't
 *   inventing curriculum.
 * - **PSY-02 sequencing for age 5/6.** Letter-names lead letter-sounds
 *   (Scarborough 2001 meta-analysis surfaced in Dave's audit). Math at
 *   age 5 anchors on number recognition rather than addition fluency.
 * - **Top of the ladder reserved for review.** A "mastered" seed means
 *   "drop straight into the Leitner rotation" — we only stamp it where
 *   the typical kid for that age has the fact at automaticity, not just
 *   exposure.
 *
 * Pure function. No side effects, no I/O. Full unit-test coverage of every
 * cell lives in `ageDefaults.test.ts` — 102 cells (17 nodes × 6 ages).
 */

import type { Age, SkillLevels } from '../progress/types'

// --------------------------------------------------------------------------
// The matrix. Frozen at module load so accidental mutation by a caller
// (`defaults['add-to-10'] = 'mastered'`) becomes a runtime throw in dev.
// `defaultsForAge` returns a fresh copy so callers can mutate freely.
// --------------------------------------------------------------------------

const AGE_MATRIX: Readonly<Record<Age, Readonly<SkillLevels>>> = Object.freeze({
  5: Object.freeze({
    // Math — number recognition is the K anchor; addition is just intro.
    'number-recog': 'practicing',
    'add-to-10': 'intro',
    'add-to-20': 'locked',
    'sub-to-10': 'locked',
    'sub-to-20': 'locked',
    'two-digit-addsub': 'locked',
    'skip-counting': 'locked',
    'mult-2-5-10': 'locked',
    'mult-3-4': 'locked',
    'mult-6-9': 'locked',
    // Literacy — letter-names lead letter-sounds (PSY-02 §Letter sequencing).
    'letter-names': 'practicing',
    'letter-sounds': 'intro',
    'blending-cv': 'locked',
    'cvc-words': 'locked',
    digraphs: 'locked',
    'sight-words': 'locked',
    'simple-sentences': 'locked',
  }),
  6: Object.freeze({
    // Math — addition opens up; sub-to-10 enters practice; mult still off.
    'number-recog': 'mastered',
    'add-to-10': 'practicing',
    'add-to-20': 'intro',
    'sub-to-10': 'practicing',
    'sub-to-20': 'intro',
    'two-digit-addsub': 'locked',
    'skip-counting': 'locked',
    'mult-2-5-10': 'locked',
    'mult-3-4': 'locked',
    'mult-6-9': 'locked',
    // Literacy — sounds and blending are the G1 push; CVC + sight-words intro.
    'letter-names': 'mastered',
    'letter-sounds': 'practicing',
    'blending-cv': 'practicing',
    'cvc-words': 'intro',
    digraphs: 'locked',
    'sight-words': 'intro',
    'simple-sentences': 'locked',
  }),
  7: Object.freeze({
    // Math — single-digit add/sub mastered; two-digit + skip-counting intro.
    'number-recog': 'mastered',
    'add-to-10': 'mastered',
    'add-to-20': 'practicing',
    'sub-to-10': 'mastered',
    'sub-to-20': 'practicing',
    'two-digit-addsub': 'intro',
    'skip-counting': 'intro',
    'mult-2-5-10': 'locked',
    'mult-3-4': 'locked',
    'mult-6-9': 'locked',
    // Literacy — decoding solid; digraphs + sentences come online.
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'practicing',
    digraphs: 'intro',
    'sight-words': 'practicing',
    'simple-sentences': 'intro',
  }),
  8: Object.freeze({
    // Math — add/sub mastered; two-digit + skip-counting in practice; mult intro.
    'number-recog': 'mastered',
    'add-to-10': 'mastered',
    'add-to-20': 'mastered',
    'sub-to-10': 'mastered',
    'sub-to-20': 'mastered',
    'two-digit-addsub': 'practicing',
    'skip-counting': 'practicing',
    'mult-2-5-10': 'intro',
    'mult-3-4': 'locked',
    'mult-6-9': 'locked',
    // Literacy — CVC mastered; digraphs + sight + sentences in practice.
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'mastered',
    digraphs: 'practicing',
    'sight-words': 'practicing',
    'simple-sentences': 'practicing',
  }),
  9: Object.freeze({
    // Math — two-digit + skip-counting mastered; mult-2-5-10 in practice; 3/4 intro.
    'number-recog': 'mastered',
    'add-to-10': 'mastered',
    'add-to-20': 'mastered',
    'sub-to-10': 'mastered',
    'sub-to-20': 'mastered',
    'two-digit-addsub': 'mastered',
    'skip-counting': 'mastered',
    'mult-2-5-10': 'practicing',
    'mult-3-4': 'intro',
    'mult-6-9': 'locked',
    // Literacy — digraphs/sight mastered; sentences still consolidating.
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'mastered',
    digraphs: 'mastered',
    'sight-words': 'mastered',
    'simple-sentences': 'practicing',
  }),
  10: Object.freeze({
    // Math — mult-2-5-10 mastered; 3/4 in practice; 6-9 intro.
    'number-recog': 'mastered',
    'add-to-10': 'mastered',
    'add-to-20': 'mastered',
    'sub-to-10': 'mastered',
    'sub-to-20': 'mastered',
    'two-digit-addsub': 'mastered',
    'skip-counting': 'mastered',
    'mult-2-5-10': 'mastered',
    'mult-3-4': 'practicing',
    'mult-6-9': 'intro',
    // Literacy — full literacy stack mastered.
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'mastered',
    digraphs: 'mastered',
    'sight-words': 'mastered',
    'simple-sentences': 'mastered',
  }),
})

/**
 * Returns the seed `SkillLevels` map for a fresh profile at `age`.
 *
 * The result is a shallow copy — callers may freely mutate it (e.g. the
 * diagnostic engine in DEV-04 nudges individual nodes ±1).
 *
 * Pure: same input always returns an equivalent (but freshly allocated)
 * object.
 */
export function defaultsForAge(age: Age): SkillLevels {
  return { ...AGE_MATRIX[age] }
}
