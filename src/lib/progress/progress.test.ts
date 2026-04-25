import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CURRENT_SCHEMA_VERSION,
  MAX_SESSION_HISTORY,
  STORAGE_KEY,
  addItem,
  clearProgress,
  defaultProgress,
  demote,
  emptyLeitner,
  findItem,
  isProgressV1,
  isProgressV2,
  loadProgress,
  promote,
  saveProgress,
} from './index'
import { migrate, migrateV1toV2 } from './migrate'
import type {
  MathFact,
  Progress,
  ProgressV1,
  SessionHistoryEntry,
} from './types'

const factKey = (f: MathFact) => `${f.a}${f.op}${f.b}`

/**
 * A canonical, fully-shaped v1 document. Used by migration tests and the
 * loadProgress-routes-through-migrate integration test. Constructed by
 * hand (rather than via `defaultProgress` + downcast) so the v1 contract
 * is pinned in test code — if someone "fixes" the v1 type later, this
 * fixture will fail loudly.
 */
function v1Fixture(overrides: Partial<ProgressV1> = {}): ProgressV1 {
  return {
    schemaVersion: 1,
    profile: {
      childName: 'Sam',
      character: 'axel',
      lastPlayedISO: null,
    },
    skillLevels: {
      'number-recog': 'intro',
      'add-to-10': 'practicing',
      'add-to-20': 'locked',
      'sub-to-10': 'locked',
      'sub-to-20': 'locked',
      'two-digit-addsub': 'locked',
      'skip-counting': 'locked',
      'mult-2-5-10': 'locked',
      'mult-3-4': 'locked',
      'mult-6-9': 'locked',
      'letter-names': 'mastered',
      'letter-sounds': 'practicing',
      'blending-cv': 'locked',
      'cvc-words': 'locked',
      digraphs: 'locked',
      'sight-words': 'locked',
      'simple-sentences': 'locked',
    },
    mathFactsLeitner: { items: [] },
    history: [],
    ...overrides,
  }
}

describe('loadProgress', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns null when nothing is stored', () => {
    expect(loadProgress()).toBeNull()
  })

  it('returns null on corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json,,,')
    expect(loadProgress()).toBeNull()
  })

  it('returns null when JSON is valid but the shape is wrong', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 2, profile: { childName: 42 } }),
    )
    expect(loadProgress()).toBeNull()
  })

  it('round-trips a default Progress through save+load', () => {
    const initial = defaultProgress('Test')
    saveProgress(initial)

    const loaded = loadProgress()
    expect(loaded).not.toBeNull()
    expect(loaded).toEqual(initial)
    expect(loaded?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(isProgressV2(loaded)).toBe(true)
  })

  it('upgrades a stored v1 blob to v2 on load', () => {
    const v1 = v1Fixture({
      profile: {
        childName: 'Riley',
        character: 'axel',
        lastPlayedISO: '2026-04-01T10:00:00.000Z',
      },
    })
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v1))

    const loaded = loadProgress()
    expect(loaded).not.toBeNull()
    expect(loaded?.schemaVersion).toBe(2)
    expect(isProgressV2(loaded)).toBe(true)
    // Identifying data carries through losslessly.
    expect(loaded?.profile.childName).toBe('Riley')
    expect(loaded?.profile.lastPlayedISO).toBe('2026-04-01T10:00:00.000Z')
    // v2-only fields land on documented defaults.
    expect(loaded?.profile.age).toBe(7)
    expect(loaded?.profile.setupCompletedISO).toBeNull()
    expect(loaded?.profile.diagnosticCompletedISO).toBeNull()
    // Skill levels and other domain data preserved verbatim.
    expect(loaded?.skillLevels).toEqual(v1.skillLevels)
  })

  it('returns null when an older blob has no migration step', () => {
    // No v0 step exists; an "old" doc at schemaVersion 0 cannot be brought up.
    const ancient = { schemaVersion: 0, profile: { childName: 'Test' } }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ancient))

    const result = loadProgress()
    expect(result).toBeNull()
    expect(migrate(ancient)).toBeNull()
  })

  it('refuses future schema versions rather than guessing', () => {
    const future = { ...defaultProgress(), schemaVersion: 99 } as unknown
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(future))
    expect(loadProgress()).toBeNull()
  })
})

describe('saveProgress', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('writes under the documented key', () => {
    const p = defaultProgress()
    saveProgress(p)
    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('trims session history to MAX_SESSION_HISTORY', () => {
    const base = defaultProgress()
    const overflow = MAX_SESSION_HISTORY + 7
    const history: SessionHistoryEntry[] = Array.from(
      { length: overflow },
      (_, i) => ({
        dateISO: new Date(2026, 3, 1 + i).toISOString(),
        skillFocus: ['add-to-10'],
        successRate: 0.5,
      }),
    )

    saveProgress({ ...base, history })

    const loaded = loadProgress()
    expect(loaded?.history.length).toBe(MAX_SESSION_HISTORY)
    // We keep the most recent entries, not the oldest.
    expect(loaded?.history[0].dateISO).toBe(
      history[overflow - MAX_SESSION_HISTORY].dateISO,
    )
  })

  it('does not throw if localStorage.setItem throws (quota etc.)', () => {
    const spy = vi
      .spyOn(window.localStorage.__proto__, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

    expect(() => saveProgress(defaultProgress())).not.toThrow()
    expect(spy).toHaveBeenCalled()
  })
})

describe('clearProgress', () => {
  it('removes the stored doc', () => {
    saveProgress(defaultProgress())
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    clearProgress()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('migrate', () => {
  it('is identity for v2 input', () => {
    const p = defaultProgress()
    expect(migrate(p)).toEqual(p)
  })

  it('promotes v1 to v2 with documented defaults', () => {
    const v1 = v1Fixture()
    const result = migrate(v1)

    expect(result).not.toBeNull()
    expect(result?.schemaVersion).toBe(2)
    expect(isProgressV2(result)).toBe(true)
    expect(result?.profile.age).toBe(7)
    expect(result?.profile.setupCompletedISO).toBeNull()
    expect(result?.profile.diagnosticCompletedISO).toBeNull()
    expect(result?.profile.character).toBe('axel')
    expect(result?.profile.childName).toBe(v1.profile.childName)
    expect(result?.profile.lastPlayedISO).toBe(v1.profile.lastPlayedISO)
  })

  it('returns null when schemaVersion is missing', () => {
    expect(migrate({})).toBeNull()
    expect(migrate(null)).toBeNull()
    expect(migrate('nope')).toBeNull()
  })

  it('returns null when no migration step exists for an older version', () => {
    expect(migrate({ schemaVersion: 0 })).toBeNull()
  })

  it('returns null for future versions', () => {
    const future = { ...defaultProgress(), schemaVersion: 99 }
    expect(migrate(future)).toBeNull()
  })

  it('returns null when v1-shaped data fails validation', () => {
    // childName as a non-string fails the v1 guard at the input gate of
    // the v1→v2 step.
    const bad = {
      ...v1Fixture(),
      profile: { childName: 42, character: 'axel', lastPlayedISO: null },
    }
    expect(migrate(bad)).toBeNull()
  })

  it('returns null when v2-shaped data fails validation post-migration', () => {
    // A v2 doc with an out-of-band age must be rejected even if the rest
    // is well-formed — the runtime guard is the safety net.
    const base = defaultProgress()
    const bad = { ...base, profile: { ...base.profile, age: 4 } }
    expect(migrate(bad)).toBeNull()
  })
})

describe('Leitner box', () => {
  const fact: MathFact = { a: 3, b: 4, op: '+' }
  const otherFact: MathFact = { a: 7, b: 2, op: '-' }

  it('starts empty', () => {
    const box = emptyLeitner<MathFact>()
    expect(box.items).toEqual([])
  })

  it('addItem is idempotent on the same key', () => {
    let box = emptyLeitner<MathFact>()
    box = addItem(box, factKey, fact)
    box = addItem(box, factKey, fact)
    expect(box.items.length).toBe(1)
    expect(box.items[0].box).toBe(1)
    expect(box.items[0].lastSeen).toBe(0)
  })

  it('promote moves item one box and caps at 5', () => {
    let box = emptyLeitner<MathFact>()
    box = addItem(box, factKey, fact)
    for (let i = 0; i < 10; i++) {
      box = promote(box, factKey, fact, 1000 + i)
    }
    const found = findItem(box, factKey, fact)
    expect(found?.box).toBe(5)
    expect(found?.lastSeen).toBe(1009)
  })

  it('demote drops the item back to box 1', () => {
    let box = emptyLeitner<MathFact>()
    box = addItem(box, factKey, fact)
    box = promote(box, factKey, fact, 1)
    box = promote(box, factKey, fact, 2)
    expect(findItem(box, factKey, fact)?.box).toBe(3)
    box = demote(box, factKey, fact, 99)
    const found = findItem(box, factKey, fact)
    expect(found?.box).toBe(1)
    expect(found?.lastSeen).toBe(99)
  })

  it('promote / demote are no-ops when item is missing', () => {
    const box = emptyLeitner<MathFact>()
    expect(promote(box, factKey, fact, 1)).toBe(box)
    expect(demote(box, factKey, fact, 1)).toBe(box)
  })

  it('only mutates the matching item', () => {
    let box = emptyLeitner<MathFact>()
    box = addItem(box, factKey, fact)
    box = addItem(box, factKey, otherFact)
    box = promote(box, factKey, fact, 5)
    expect(findItem(box, factKey, fact)?.box).toBe(2)
    expect(findItem(box, factKey, otherFact)?.box).toBe(1)
    expect(findItem(box, factKey, otherFact)?.lastSeen).toBe(0)
  })
})

describe('isProgressV1', () => {
  it('accepts a well-formed v1 fixture', () => {
    expect(isProgressV1(v1Fixture())).toBe(true)
  })

  it('rejects v2 documents (schemaVersion 2)', () => {
    expect(isProgressV1(defaultProgress())).toBe(false)
  })

  it('rejects missing skill nodes', () => {
    const v1 = v1Fixture()
    const broken = {
      ...v1,
      skillLevels: { ...v1.skillLevels, 'add-to-10': undefined },
    }
    expect(isProgressV1(broken)).toBe(false)
  })

  it('rejects unknown character', () => {
    const v1 = v1Fixture()
    const broken = { ...v1, profile: { ...v1.profile, character: 'kitty' } }
    expect(isProgressV1(broken)).toBe(false)
  })
})

describe('isProgressV2', () => {
  it('accepts default progress', () => {
    expect(isProgressV2(defaultProgress())).toBe(true)
  })

  it('rejects v1-shaped documents', () => {
    expect(isProgressV2(v1Fixture())).toBe(false)
  })

  it('rejects missing skill nodes', () => {
    const p = defaultProgress() as unknown as Progress
    const broken = {
      ...p,
      skillLevels: { ...p.skillLevels, 'add-to-10': undefined },
    }
    expect(isProgressV2(broken)).toBe(false)
  })

  it('rejects unknown character', () => {
    const p = defaultProgress()
    const broken = { ...p, profile: { ...p.profile, character: 'kitty' } }
    expect(isProgressV2(broken)).toBe(false)
  })

  it('rejects ages outside the 5..10 band', () => {
    const p = defaultProgress()
    for (const age of [4, 11, 0, -1, 7.5, NaN, Infinity]) {
      const broken = { ...p, profile: { ...p.profile, age } }
      expect(isProgressV2(broken)).toBe(false)
    }
  })

  it('rejects non-numeric ages', () => {
    const p = defaultProgress()
    const broken = { ...p, profile: { ...p.profile, age: '7' } }
    expect(isProgressV2(broken)).toBe(false)
  })

  it('rejects setupCompletedISO of the wrong type', () => {
    const p = defaultProgress()
    const broken = { ...p, profile: { ...p.profile, setupCompletedISO: 0 } }
    expect(isProgressV2(broken)).toBe(false)
  })

  it('rejects diagnosticCompletedISO of the wrong type', () => {
    const p = defaultProgress()
    const broken = {
      ...p,
      profile: { ...p.profile, diagnosticCompletedISO: 0 },
    }
    expect(isProgressV2(broken)).toBe(false)
  })

  it('accepts non-null ISO strings on completion fields', () => {
    const p = defaultProgress()
    const stamped: Progress = {
      ...p,
      profile: {
        ...p.profile,
        setupCompletedISO: '2026-04-25T12:00:00.000Z',
        diagnosticCompletedISO: '2026-04-25T12:05:00.000Z',
      },
    }
    expect(isProgressV2(stamped)).toBe(true)
  })

  it('rejects out-of-range Leitner box index', () => {
    const p = defaultProgress()
    const broken: Progress = {
      ...p,
      mathFactsLeitner: {
        items: [{ item: { a: 1, b: 1, op: '+' }, box: 9 as 5, lastSeen: 0 }],
      },
    }
    expect(isProgressV2(broken)).toBe(false)
  })
})

describe('migrateV1toV2', () => {
  it('is a pure function (does not mutate input)', () => {
    const v1 = v1Fixture()
    const snapshot = JSON.parse(JSON.stringify(v1))
    migrateV1toV2(v1)
    expect(v1).toEqual(snapshot)
  })

  it('produces a doc that passes isProgressV2', () => {
    expect(isProgressV2(migrateV1toV2(v1Fixture()))).toBe(true)
  })

  it('preserves childName, character, lastPlayedISO, history, skillLevels, leitner', () => {
    const v1 = v1Fixture({
      profile: {
        childName: 'Jamie',
        character: 'axel',
        lastPlayedISO: '2026-03-15T08:30:00.000Z',
      },
      history: [
        {
          dateISO: '2026-03-15T08:30:00.000Z',
          skillFocus: ['add-to-10'],
          successRate: 0.75,
        },
      ],
      mathFactsLeitner: {
        items: [{ item: { a: 2, b: 3, op: '+' }, box: 2, lastSeen: 12345 }],
      },
    })

    const v2 = migrateV1toV2(v1)

    expect(v2.profile.childName).toBe('Jamie')
    expect(v2.profile.character).toBe('axel')
    expect(v2.profile.lastPlayedISO).toBe('2026-03-15T08:30:00.000Z')
    expect(v2.skillLevels).toEqual(v1.skillLevels)
    expect(v2.mathFactsLeitner).toEqual(v1.mathFactsLeitner)
    expect(v2.history).toEqual(v1.history)
  })

  it('seeds new v2 fields with documented defaults', () => {
    const v2 = migrateV1toV2(v1Fixture())
    expect(v2.profile.age).toBe(7)
    expect(v2.profile.setupCompletedISO).toBeNull()
    expect(v2.profile.diagnosticCompletedISO).toBeNull()
    expect(v2.schemaVersion).toBe(2)
  })
})
