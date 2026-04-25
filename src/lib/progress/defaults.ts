/**
 * Default Progress document for a brand-new profile.
 *
 * Setup-phase contract: the Setup screen always provides an `age` (5..10
 * tile picker, see CLAUDE.md "Setup-phase contract"). The age then drives
 * the seed `SkillLevels` map via `defaultsForAge` — there is no fallback
 * default here, because no caller in the live setup flow has reason to
 * skip the age picker.
 *
 * Tests / migrations that need a Progress shell without a meaningful age
 * pass one explicitly (7 is the v1→v2 migration default; that's the
 * convention).
 */

import { defaultsForAge } from '../setup/ageDefaults'
import { emptyLeitner } from './leitner'
import type { Age, Progress } from './types'
import { CURRENT_SCHEMA_VERSION } from './types'

export function defaultProgress(childName: string, age: Age): Progress {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: {
      childName,
      age,
      character: 'axel',
      lastPlayedISO: null,
      setupCompletedISO: null,
      diagnosticCompletedISO: null,
    },
    skillLevels: defaultsForAge(age),
    mathFactsLeitner: emptyLeitner(),
    history: [],
  }
}
