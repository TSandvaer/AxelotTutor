/**
 * Hand-rolled type guards for the persisted Progress document.
 *
 * No runtime schema dep (zod/valibot/etc) — this module is on the hot path
 * for app boot and the bundle budget says "earn every kilobyte". A targeted
 * guard set is plenty for our shape.
 *
 * One guard per schema version. Each guard fully validates that version's
 * shape; nothing is shared between them so a future v3 can change the
 * envelope without quietly invalidating v2 readers.
 */

import type {
  Age,
  LeitnerBox,
  LeitnerItem,
  Progress,
  ProgressV1,
  SessionHistoryEntry,
  SkillLevel,
  SkillLevels,
  SkillNode,
} from './types'
import { VALID_AGES } from './types'

const SKILL_NODES: ReadonlySet<SkillNode> = new Set<SkillNode>([
  // Number Garden
  'number-recog',
  'add-to-10',
  'add-to-20',
  'sub-to-10',
  'sub-to-20',
  'two-digit-addsub',
  'skip-counting',
  'mult-2-5-10',
  'mult-3-4',
  'mult-6-9',
  // Word Song
  'letter-names',
  'letter-sounds',
  'blending-cv',
  'cvc-words',
  'digraphs',
  'sight-words',
  'simple-sentences',
])

const SKILL_LEVELS: ReadonlySet<SkillLevel> = new Set<SkillLevel>([
  'locked',
  'intro',
  'practicing',
  'mastered',
])

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isSkillLevels(v: unknown): v is SkillLevels {
  if (!isObject(v)) return false
  for (const node of SKILL_NODES) {
    const lvl = v[node]
    if (typeof lvl !== 'string' || !SKILL_LEVELS.has(lvl as SkillLevel)) {
      return false
    }
  }
  return true
}

function isLeitnerItem(v: unknown): v is LeitnerItem<unknown> {
  if (!isObject(v)) return false
  if (!('item' in v)) return false
  const box = v.box
  if (typeof box !== 'number' || box < 1 || box > 5 || !Number.isInteger(box)) {
    return false
  }
  if (typeof v.lastSeen !== 'number' || !Number.isFinite(v.lastSeen)) {
    return false
  }
  return true
}

function isLeitnerBox(v: unknown): v is LeitnerBox<unknown> {
  if (!isObject(v)) return false
  return Array.isArray(v.items) && v.items.every(isLeitnerItem)
}

function isHistoryEntry(v: unknown): v is SessionHistoryEntry {
  if (!isObject(v)) return false
  if (typeof v.dateISO !== 'string') return false
  if (
    typeof v.successRate !== 'number' ||
    !Number.isFinite(v.successRate) ||
    v.successRate < 0 ||
    v.successRate > 1
  ) {
    return false
  }
  if (!Array.isArray(v.skillFocus)) return false
  return v.skillFocus.every(
    (n) => typeof n === 'string' && SKILL_NODES.has(n as SkillNode),
  )
}

/** True iff `n` is one of `5 | 6 | 7 | 8 | 9 | 10`. */
export function isAge(n: unknown): n is Age {
  return typeof n === 'number' && VALID_AGES.has(n as Age)
}

/**
 * True iff `v` matches the v1 Progress shape exactly. Retained for
 * `migrateV1toV2`'s input validation; app code outside `migrate.ts`
 * should not need to call this.
 */
export function isProgressV1(v: unknown): v is ProgressV1 {
  if (!isObject(v)) return false
  if (v.schemaVersion !== 1) return false
  if (!isObject(v.profile)) return false
  if (typeof v.profile.childName !== 'string') return false
  if (v.profile.character !== 'axel') return false
  const last = v.profile.lastPlayedISO
  if (last !== null && typeof last !== 'string') return false
  if (!isSkillLevels(v.skillLevels)) return false
  if (!isLeitnerBox(v.mathFactsLeitner)) return false
  if (!Array.isArray(v.history)) return false
  if (!v.history.every(isHistoryEntry)) return false
  return true
}

/** True iff `v` matches the v2 Progress shape (current) exactly. */
export function isProgressV2(v: unknown): v is Progress {
  if (!isObject(v)) return false
  if (v.schemaVersion !== 2) return false
  if (!isObject(v.profile)) return false
  if (typeof v.profile.childName !== 'string') return false
  if (!isAge(v.profile.age)) return false
  if (v.profile.character !== 'axel') return false
  const last = v.profile.lastPlayedISO
  if (last !== null && typeof last !== 'string') return false
  const setup = v.profile.setupCompletedISO
  if (setup !== null && typeof setup !== 'string') return false
  const diag = v.profile.diagnosticCompletedISO
  if (diag !== null && typeof diag !== 'string') return false
  if (!isSkillLevels(v.skillLevels)) return false
  if (!isLeitnerBox(v.mathFactsLeitner)) return false
  if (!Array.isArray(v.history)) return false
  if (!v.history.every(isHistoryEntry)) return false
  return true
}

/** Reads schemaVersion off any plausibly-shaped object, else null. */
export function readSchemaVersion(v: unknown): number | null {
  if (!isObject(v)) return null
  const sv = v.schemaVersion
  return typeof sv === 'number' && Number.isInteger(sv) ? sv : null
}
