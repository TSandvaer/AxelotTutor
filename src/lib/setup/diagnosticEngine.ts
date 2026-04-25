/**
 * Diagnostic engine — pure functions for the optional adaptive probe step
 * (Setup → "Want a more accurate start?" → Diagnostic).
 *
 * Three responsibilities:
 *   1. `pickProbes(age)`  — select 4 (age 5) or 6 (ages 6–10) probes from
 *      the bank in `src/content/diagnostic.ts`, honoring the composition
 *      rules from PSY-02 + Kyle's UX-02 contract.
 *   2. `bumpLevel(level, delta)` — clamped traversal of the SkillLevel
 *      ladder. Used directly by tests and by `applyDiagnostic` internally.
 *   3. `applyDiagnostic(progress, outcomes)` — pure: returns a new
 *      Progress doc with skill-level nudges applied per outcome, the
 *      two-consecutive-wrong stop rule honored, and the
 *      `diagnosticCompletedISO` timestamp stamped if `nowISO` is supplied.
 *
 * **No I/O.** No randomness leaks unless explicitly seeded — `pickProbes`
 * accepts an optional `rng` for deterministic tests. No date sources
 * inside the engine; the caller passes `nowISO`.
 *
 * **PSY-02 rules folded in:**
 *   - 4 probes for age 5; 6 for ages 6–10.
 *   - Math probes for age 5 are `dot-array` only; numerals from age 6.
 *   - Letter-name probes precede letter-sound probes in age 5/6 sequencing.
 *   - First probe at every age is `difficulty: 'easy'` (winnable opener).
 *   - Two consecutive wrong answers stop the engine's nudge application;
 *     unanswered remaining probes contribute nothing.
 */

import type { Progress, SkillLevel, SkillNode } from '../progress/types'
import type { Age } from '../progress/types'
import { DIAGNOSTIC_BANK } from '../../content/diagnostic'
import type {
  DiagnosticResult,
  Probe,
  ProbeDomain,
  ProbeOutcome,
  ProbeSet,
  ProbeType,
} from './diagnosticTypes'

// --------------------------------------------------------------------------
// SkillLevel ladder helpers.
// --------------------------------------------------------------------------

const LADDER: readonly SkillLevel[] = [
  'locked',
  'intro',
  'practicing',
  'mastered',
] as const

const LADDER_INDEX: Readonly<Record<SkillLevel, number>> = {
  locked: 0,
  intro: 1,
  practicing: 2,
  mastered: 3,
}

/**
 * Move a SkillLevel one step up (`+1`) or down (`-1`) on the ladder,
 * clamped at `'locked'` and `'mastered'`. Pure.
 *
 * Exported for direct use by tests and by callers that want to apply a
 * one-off nudge without going through the full `applyDiagnostic` flow.
 */
export function bumpLevel(level: SkillLevel, delta: -1 | 1): SkillLevel {
  const next = LADDER_INDEX[level] + delta
  const clamped = Math.max(0, Math.min(LADDER.length - 1, next))
  return LADDER[clamped]
}

// --------------------------------------------------------------------------
// Probe-type domain mapping. Kyle's `Probe` interface doesn't carry a
// `domain` field directly — it's derivable from `probeType`. We surface the
// derivation here so the bank doesn't need to repeat itself.
// --------------------------------------------------------------------------

const PROBE_TYPE_DOMAIN: Readonly<Record<ProbeType, ProbeDomain>> = {
  'dot-array': 'math',
  numeral: 'math',
  'letter-name-audio': 'literacy',
  'letter-sound-audio': 'literacy',
  'cvc-image': 'literacy',
}

function domainOf(probe: Probe): ProbeDomain {
  return PROBE_TYPE_DOMAIN[probe.probeType]
}

// --------------------------------------------------------------------------
// pickProbes
// --------------------------------------------------------------------------

/**
 * Optional RNG seam for deterministic tests. Defaults to `Math.random`.
 * Returns a value in [0, 1).
 */
export type RngFn = () => number

interface PickProbesOptions {
  /** RNG seam. Defaults to `Math.random`. */
  rng?: RngFn
}

/**
 * Pick the probe set for a given age.
 *
 *   - Age 5 → 4 probes (2 math + 2 literacy).
 *   - Ages 6..10 → 6 probes (3 math + 3 literacy).
 *
 * Composition rules:
 *   1. Filter the bank to items in-band for `age`.
 *   2. Split into math + literacy buckets via `probeType`.
 *   3. Sort each bucket so `difficulty: 'easy'` items lead, and within
 *      literacy at age 5/6, `letter-name-audio` precedes `letter-sound-audio`
 *      regardless of difficulty (PSY-02 sequencing trumps difficulty for
 *      the literacy bucket at those ages).
 *   4. Take the leading N items per bucket (N = 2 for age 5, 3 otherwise).
 *      The first item in each bucket is the easiest in-band item; the
 *      first probe overall is the math bucket's leader.
 *   5. Interleave the two buckets so the child sees alternating domains
 *      (math, lit, math, lit, ...). Probe 1 is math (the typically-most
 *      winnable opener at every age).
 *
 * **Determinism.** No randomness is introduced inside the bucket selection
 * itself — the bank is hand-curated and ordering is total. `rng` is
 * accepted for forward compatibility (e.g. a future v2 might shuffle
 * remaining slots), but is currently unused. Tests can pass `() => 0` to
 * pin behavior.
 *
 * **Throws** if the bank is malformed for an age (i.e. fewer than the
 * required number of in-band items per domain). The bank's hand-curation
 * is the safety net; a throw here means the bank itself is broken and the
 * test suite must catch it before shipping.
 */
export function pickProbes(age: Age, options: PickProbesOptions = {}): Probe[] {
  // RNG is reserved for future use; currently the engine is fully
  // deterministic over the curated bank. Acknowledge the parameter so it
  // doesn't read as dead code in future PRs.
  void options.rng

  const inBand = DIAGNOSTIC_BANK.filter(
    (p) => age >= p.ageBand[0] && age <= p.ageBand[1],
  )

  const mathBucket = inBand.filter((p) => domainOf(p) === 'math')
  const litBucket = inBand.filter((p) => domainOf(p) === 'literacy')

  const sortedMath = sortMathBucket(mathBucket)
  const sortedLit = sortLiteracyBucket(litBucket, age)

  const perBucket = age === 5 ? 2 : 3

  if (sortedMath.length < perBucket) {
    throw new Error(
      `diagnostic bank: not enough in-band math probes for age ${age} ` +
        `(have ${sortedMath.length}, need ${perBucket})`,
    )
  }
  if (sortedLit.length < perBucket) {
    throw new Error(
      `diagnostic bank: not enough in-band literacy probes for age ${age} ` +
        `(have ${sortedLit.length}, need ${perBucket})`,
    )
  }

  const mathPicks = sortedMath.slice(0, perBucket)
  const litPicks = sortedLit.slice(0, perBucket)

  // Interleave math, literacy, math, literacy, ... starting with math.
  // PSY-02 §6 ("guarantee a winnable first item") + observation: the
  // easiest math probe at every age is `'easy'` and at the child's
  // typical exposure level — so opening with math gives the strongest
  // win at the moment the child needs it most.
  const probes: Probe[] = []
  for (let i = 0; i < perBucket; i++) {
    probes.push(mathPicks[i])
    probes.push(litPicks[i])
  }

  return probes
}

/**
 * Convenience wrapper returning a `ProbeSet` envelope. Same selection
 * logic as `pickProbes`; differs only in the return shape.
 */
export function pickProbeSet(
  age: Age,
  options: PickProbesOptions = {},
): ProbeSet {
  return { probes: pickProbes(age, options), forAge: age }
}

const DIFFICULTY_RANK: Readonly<
  Record<NonNullable<Probe['difficulty']>, number>
> = {
  easy: 0,
  medium: 1,
  hard: 2,
}

function difficultyRank(p: Probe): number {
  return p.difficulty === undefined ? 1 : DIFFICULTY_RANK[p.difficulty]
}

function sortMathBucket(bucket: readonly Probe[]): Probe[] {
  // Difficulty ascending, then preserve bank order for ties.
  return [...bucket].sort((a, b) => difficultyRank(a) - difficultyRank(b))
}

function sortLiteracyBucket(bucket: readonly Probe[], age: Age): Probe[] {
  // Age 5/6: letter-name probes first, then letter-sound, then everything
  // else (cvc-image), each sub-bucket sorted by difficulty. PSY-02 §
  // "Letter sequencing" — letter-name precedes letter-sound regardless
  // of difficulty for these two ages.
  // Ages 7+: difficulty ascending, preserve bank order for ties.
  if (age <= 6) {
    const phase = (p: Probe): number => {
      switch (p.probeType) {
        case 'letter-name-audio':
          return 0
        case 'letter-sound-audio':
          return 1
        default:
          return 2
      }
    }
    return [...bucket].sort((a, b) => {
      const dp = phase(a) - phase(b)
      if (dp !== 0) return dp
      return difficultyRank(a) - difficultyRank(b)
    })
  }
  return [...bucket].sort((a, b) => difficultyRank(a) - difficultyRank(b))
}

// --------------------------------------------------------------------------
// applyDiagnostic
// --------------------------------------------------------------------------

interface ApplyDiagnosticOptions {
  /**
   * ISO 8601 timestamp to stamp into `profile.diagnosticCompletedISO`.
   * If omitted, the field on the input progress is preserved unchanged.
   * Caller-supplied so the engine stays pure (no `Date.now()`).
   */
  nowISO?: string
}

/**
 * Apply diagnostic outcomes to a Progress doc.
 *
 * Pure: returns a new Progress doc; never mutates the input.
 *
 * For each outcome in order:
 *   - Look up the probe by `probeId` in the supplied probe set (or in
 *     the bank if not). If the probe can't be found, the outcome is
 *     ignored (defensive — the screen shouldn't emit an outcome for a
 *     probe that wasn't part of the run).
 *   - If the outcome is correct, nudge the target `nodeId` up by 1
 *     (clamped at `'mastered'`).
 *   - If wrong, nudge it down by 1 (clamped at `'locked'`).
 *   - Track consecutive wrongs. Once two-in-a-row are seen, mark the
 *     run as `earlyStopped` and stop applying further outcomes —
 *     even if they exist in the array.
 *
 * Returns a `{ progress, result }` pair: the new Progress doc and the
 * `DiagnosticResult` envelope (mostly for QA logs / debug overlay).
 *
 * **Why both signatures?** The engine has two natural callers: (a) the
 * Diagnostic screen at completion, which wants the new Progress doc to
 * persist; and (b) tests / debug surfaces that want the nudge log.
 * Returning both is cheaper than computing them in two places.
 */
export function applyDiagnostic(
  progress: Progress,
  outcomes: readonly ProbeOutcome[],
  probes: readonly Probe[] = DIAGNOSTIC_BANK,
  options: ApplyDiagnosticOptions = {},
): { progress: Progress; result: DiagnosticResult } {
  const probeById = new Map<string, Probe>()
  for (const p of probes) probeById.set(p.id, p)

  const nextLevels = { ...progress.skillLevels }
  const appliedNudges: DiagnosticResult['appliedNudges'] = []
  let consecutiveWrong = 0
  let earlyStopped = false
  const consumedOutcomes: ProbeOutcome[] = []

  for (const outcome of outcomes) {
    if (earlyStopped) break

    const probe = probeById.get(outcome.probeId)
    if (probe === undefined) continue

    const node: SkillNode = probe.nodeId
    const before = nextLevels[node]
    const after = bumpLevel(before, outcome.isCorrect ? 1 : -1)

    nextLevels[node] = after
    appliedNudges.push({ node, from: before, to: after })
    consumedOutcomes.push(outcome)

    if (outcome.isCorrect) {
      consecutiveWrong = 0
    } else {
      consecutiveWrong += 1
      if (consecutiveWrong >= 2) {
        earlyStopped = true
      }
    }
  }

  const nextProgress: Progress = {
    ...progress,
    skillLevels: nextLevels,
    profile: {
      ...progress.profile,
      diagnosticCompletedISO:
        options.nowISO ?? progress.profile.diagnosticCompletedISO,
    },
  }

  const result: DiagnosticResult = {
    outcomes: consumedOutcomes,
    earlyStopped,
    appliedNudges,
  }

  return { progress: nextProgress, result }
}

/**
 * Lower-level helper exposed for tests / future integrations: returns
 * `true` if the supplied outcomes hit the two-consecutive-wrong stop
 * rule, taking into account ordering. Pure.
 */
export function shouldEarlyStop(outcomes: readonly ProbeOutcome[]): boolean {
  let streak = 0
  for (const o of outcomes) {
    streak = o.isCorrect ? 0 : streak + 1
    if (streak >= 2) return true
  }
  return false
}
