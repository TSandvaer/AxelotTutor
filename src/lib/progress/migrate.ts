/**
 * Schema migration framework.
 *
 * Each step takes the previous shape (typed as `unknown` at the registry
 * boundary) and returns the next; failed migrations return `null`, which
 * the adapter treats as corrupt data.
 *
 * Migration steps are pure: no localStorage, no Date.now(), no randomness.
 * That makes them testable in isolation and replayable on a snapshot.
 *
 * Add new steps to `STEPS` keyed by the *source* version. The runner loops
 * through them until `version === CURRENT_SCHEMA_VERSION`.
 */

import { isProgressV1, isProgressV2, readSchemaVersion } from './guards'
import type { Progress, ProgressV1 } from './types'
import { CURRENT_SCHEMA_VERSION } from './types'

/**
 * Step from version N to N+1. Return null on unrecoverable input.
 * Add new entries to `STEPS` in order when bumping the schema.
 */
type MigrationStep = (input: unknown) => unknown | null

const STEPS: Record<number, MigrationStep> = {
  1: (input) => {
    if (!isProgressV1(input)) return null
    return migrateV1toV2(input)
  },
}

/**
 * Pure v1 → v2 promotion.
 *
 * Defaults (documented in the DEV-01 ticket):
 *   - `age = 7`               — median of the 5..10 band; the child can
 *                               correct it on next launch via a settings
 *                               screen once one ships. We pick median
 *                               rather than the lowest so the child
 *                               doesn't get demoted to easier content.
 *   - `setupCompletedISO = null`     — the setup screen is new in v2; we do
 *                                     not retro-stamp pre-v2 sessions as
 *                                     "completed setup" because the data
 *                                     it would have collected (age tile)
 *                                     was never asked.
 *   - `diagnosticCompletedISO = null` — same reasoning; the diagnostic is
 *                                       opt-in in v2 and never ran in v1.
 *
 * `character` carries through unchanged (always `'axel'` in v1).
 * Skill levels, Leitner box and history copy through verbatim.
 */
export function migrateV1toV2(v1: ProgressV1): Progress {
  return {
    schemaVersion: 2,
    profile: {
      childName: v1.profile.childName,
      age: 7,
      character: v1.profile.character,
      lastPlayedISO: v1.profile.lastPlayedISO,
      setupCompletedISO: null,
      diagnosticCompletedISO: null,
    },
    skillLevels: v1.skillLevels,
    mathFactsLeitner: v1.mathFactsLeitner,
    history: v1.history,
  }
}

/**
 * Run any required migrations, then validate against the current shape.
 * Returns `null` when input cannot be brought up to the current version.
 *
 * Future-version data: refuse rather than guess.
 */
export function migrate(oldData: unknown): Progress | null {
  let version = readSchemaVersion(oldData)
  if (version === null) return null

  let data: unknown = oldData

  while (version < CURRENT_SCHEMA_VERSION) {
    const step = STEPS[version]
    if (!step) return null
    const next = step(data)
    if (next === null || next === undefined) return null
    data = next
    const nextVersion = readSchemaVersion(data)
    if (nextVersion === null || nextVersion <= version) return null
    version = nextVersion
  }

  // Future-version data: refuse rather than guess.
  if (version > CURRENT_SCHEMA_VERSION) return null

  return isProgressV2(data) ? data : null
}
