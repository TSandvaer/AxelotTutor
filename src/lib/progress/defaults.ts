/**
 * Default Progress document for a brand-new profile.
 *
 * Phase 0 placeholder: every skill node is `locked`. The age-based defaults
 * (DEV-02) replace this map with `defaultsForAge(age)` once the in-app setup
 * phase ships, so a fresh user lands with sensible non-zero levels keyed off
 * the age they pick on the first screen.
 *
 * `defaultProgress` accepts an optional `age` so callers (tests, the future
 * Setup screen scaffold) can seed the v2 envelope without reaching into
 * `Profile` directly. The default of 7 mirrors the v1→v2 migration default
 * and keeps the function call site cheap during scaffolding.
 *
 * TODO(DEV-02): replace DEFAULT_SKILL_LEVELS with `defaultsForAge(age)` from
 * `src/lib/setup/ageDefaults.ts`. See plan §C (age → SkillLevels matrix).
 */

import { emptyLeitner } from './leitner'
import type { Age, Progress, SkillLevels } from './types'
import { CURRENT_SCHEMA_VERSION } from './types'

const DEFAULT_SKILL_LEVELS: SkillLevels = {
  // Number Garden — math
  'number-recog': 'locked',
  'add-to-10': 'locked',
  'add-to-20': 'locked',
  'sub-to-10': 'locked',
  'sub-to-20': 'locked',
  'two-digit-addsub': 'locked',
  'skip-counting': 'locked',
  'mult-2-5-10': 'locked',
  'mult-3-4': 'locked',
  'mult-6-9': 'locked',

  // Word Song — literacy
  'letter-names': 'locked',
  'letter-sounds': 'locked',
  'blending-cv': 'locked',
  'cvc-words': 'locked',
  digraphs: 'locked',
  'sight-words': 'locked',
  'simple-sentences': 'locked',
}

export function defaultProgress(childName = 'Friend', age: Age = 7): Progress {
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
    skillLevels: { ...DEFAULT_SKILL_LEVELS },
    mathFactsLeitner: emptyLeitner(),
    history: [],
  }
}
