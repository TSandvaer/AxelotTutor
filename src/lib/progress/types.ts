/**
 * Progress model types for Axelot Tutor.
 *
 * Source of truth for the persisted shape stored in localStorage under
 * `axelot-tutor:progress:v1`. Changes here are schema changes — bump
 * `CURRENT_SCHEMA_VERSION` and add a migration step in `migrate.ts` rather
 * than mutating an existing version's contract.
 *
 * Shape history:
 *   - v1: pre-setup-phase. No `age`, no setup/diagnostic timestamps.
 *   - v2 (current): adds `age` (5..10) and `setupCompletedISO` /
 *     `diagnosticCompletedISO` to `Profile`. See CLAUDE.md
 *     "Setup-phase contract".
 *
 * Older shapes stay exported (`ProgressV1`) so migration steps have a real
 * signature to refer to. Always migrate, never read v1 directly anywhere
 * outside `migrate.ts`.
 */

// --------------------------------------------------------------------------
// Skill nodes — names mirror CLAUDE.md `## Two skill trees` exactly.
// String-literal unions keep the type system honest about which nodes exist.
// --------------------------------------------------------------------------

export type NumberGardenNode =
  | 'number-recog'
  | 'add-to-10'
  | 'add-to-20'
  | 'sub-to-10'
  | 'sub-to-20'
  | 'two-digit-addsub'
  | 'skip-counting'
  | 'mult-2-5-10'
  | 'mult-3-4'
  | 'mult-6-9'

export type WordSongNode =
  | 'letter-names'
  | 'letter-sounds'
  | 'blending-cv'
  | 'cvc-words'
  | 'digraphs'
  | 'sight-words'
  | 'simple-sentences'

export type SkillNode = NumberGardenNode | WordSongNode

/**
 * Coarse mastery level on a skill node. We deliberately keep this small —
 * the adaptive engine reads it as a hint, not a grade.
 *
 * - `locked`: not yet unlocked in the tree
 * - `intro`: unlocked, first exposure, heavy scaffolding
 * - `practicing`: in active rotation, accuracy below mastery threshold
 * - `mastered`: above threshold; goes into Leitner spaced review
 */
export type SkillLevel = 'locked' | 'intro' | 'practicing' | 'mastered'

export type SkillLevels = Record<SkillNode, SkillLevel>

// --------------------------------------------------------------------------
// Leitner box — five-box spaced repetition over math facts (or anything).
// Pure data; helpers live in `leitner.ts`.
// --------------------------------------------------------------------------

/** Leitner box index, 1..5. Box 1 = seen most often, Box 5 = long review. */
export type LeitnerBoxIndex = 1 | 2 | 3 | 4 | 5

export interface LeitnerItem<T> {
  /** Domain payload — e.g. a math fact `{ a: 3, b: 4, op: '+' }`. */
  item: T
  /** Current box, 1..5. */
  box: LeitnerBoxIndex
  /** ms since epoch the item was last shown. 0 = never shown. */
  lastSeen: number
}

export interface LeitnerBox<T> {
  items: LeitnerItem<T>[]
}

// --------------------------------------------------------------------------
// Session history — rolling list of recent sessions for the adaptive model.
// We cap it (see `MAX_SESSION_HISTORY` in adapter) so localStorage stays small.
// --------------------------------------------------------------------------

export interface SessionHistoryEntry {
  /** ISO 8601 date-time the session started. */
  dateISO: string
  /** Skill nodes this session focused on. */
  skillFocus: SkillNode[]
  /**
   * Success rate over the session, 0..1.
   * `correct / attempts`. Sessions with zero attempts are not recorded.
   */
  successRate: number
}

export type SessionHistory = SessionHistoryEntry[]

// --------------------------------------------------------------------------
// Profile + top-level Progress envelope.
// --------------------------------------------------------------------------

/** Character is fixed to Axel for v1; future skins bump the schema. */
export type Character = 'axel'

/**
 * Supported child age band: K through ~G5. Out-of-band values are rejected
 * by the v2 type guard. The setup screen offers exactly these tiles
 * (CLAUDE.md "Setup-phase contract"); `defaultsForAge` (DEV-02) keys off
 * the same set, so a literal union is the right shape — `number` would
 * silently accept NaN, 3.14, -7, etc. on a corrupted blob.
 */
export type Age = 5 | 6 | 7 | 8 | 9 | 10

/** All valid `Age` values, for runtime validation. */
export const VALID_AGES: ReadonlySet<Age> = new Set<Age>([5, 6, 7, 8, 9, 10])

// --------------------------------------------------------------------------
// v1 (legacy) shape. Retained so `migrateV1toV2` has a real input type.
// Nothing outside `migrate.ts` should read v1 directly.
// --------------------------------------------------------------------------

export interface ProfileV1 {
  childName: string
  character: Character
  lastPlayedISO: string | null
}

export interface ProgressV1 {
  schemaVersion: 1
  profile: ProfileV1
  skillLevels: SkillLevels
  mathFactsLeitner: LeitnerBox<MathFact>
  history: SessionHistory
}

// --------------------------------------------------------------------------
// v2 (current) shape.
// --------------------------------------------------------------------------

export interface Profile {
  /** Display name, child-controlled. Capped to 24 chars at write time. */
  childName: string
  /**
   * Picked on the setup screen (5..10 tile). Drives `defaultsForAge` and
   * the diagnostic probe band.
   */
  age: Age
  character: Character
  /** ISO 8601 timestamp of the last completed session, or null if never. */
  lastPlayedISO: string | null
  /**
   * ISO 8601 timestamp the setup screen was completed. Null until the
   * child finishes setup. Migrated v1 docs land here as `null` even
   * though they'd previously implicitly "completed" pre-setup play —
   * the setup phase is new in v2 and we do not retro-stamp.
   */
  setupCompletedISO: string | null
  /**
   * ISO 8601 timestamp the optional diagnostic finished, or null if the
   * child skipped it (or hasn't reached it yet).
   */
  diagnosticCompletedISO: string | null
}

/**
 * Math-fact payload type kept open for now; the adaptive engine will
 * narrow it. Stored as an opaque object so the schema doesn't need to
 * bump every time a fact shape changes.
 */
export interface MathFact {
  a: number
  b: number
  op: '+' | '-' | '*'
}

/** Top-level persisted document. Always carries `schemaVersion`. */
export interface Progress {
  schemaVersion: 2
  profile: Profile
  skillLevels: SkillLevels
  /** Leitner box for math facts only (literacy uses sight-word lists later). */
  mathFactsLeitner: LeitnerBox<MathFact>
  history: SessionHistory
}

export const CURRENT_SCHEMA_VERSION = 2 as const
