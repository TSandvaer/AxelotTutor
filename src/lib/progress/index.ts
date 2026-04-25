/**
 * Public surface of the progress module. App code imports from here
 * (`@/lib/progress` once we add the alias) — never reach inside.
 */

export type {
  Age,
  Character,
  LeitnerBox,
  LeitnerBoxIndex,
  LeitnerItem,
  MathFact,
  NumberGardenNode,
  Profile,
  ProfileV1,
  Progress,
  ProgressV1,
  SessionHistory,
  SessionHistoryEntry,
  SkillLevel,
  SkillLevels,
  SkillNode,
  WordSongNode,
} from './types'

export { CURRENT_SCHEMA_VERSION, VALID_AGES } from './types'

export { addItem, demote, emptyLeitner, findItem, promote } from './leitner'

export { defaultProgress } from './defaults'
export { migrate, migrateV1toV2 } from './migrate'
export { isAge, isProgressV1, isProgressV2 } from './guards'
export {
  MAX_SESSION_HISTORY,
  STORAGE_KEY,
  clearProgress,
  loadProgress,
  saveProgress,
} from './storage'
