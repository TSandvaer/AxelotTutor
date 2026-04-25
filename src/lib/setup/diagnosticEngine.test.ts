/**
 * Tests for the diagnostic engine.
 *
 * Covers `bumpLevel` (clamp), `pickProbes` (length, composition,
 * winnable-first, PSY-02 sequencing, math-first interleave),
 * `applyDiagnostic` (purity, nudges, clamps, stop rule, ISO stamp), and
 * `shouldEarlyStop`.
 */

import { describe, expect, it } from 'vitest'

import {
  applyDiagnostic,
  bumpLevel,
  pickProbeSet,
  pickProbes,
  shouldEarlyStop,
} from './diagnosticEngine'
import type { Probe, ProbeOutcome } from './diagnosticTypes'
import { defaultProgress } from '../progress/defaults'
import type { Age, Progress, SkillLevel } from '../progress/types'

const ALL_AGES: readonly Age[] = [5, 6, 7, 8, 9, 10] as const

const MATH_TYPES = new Set<Probe['probeType']>(['dot-array', 'numeral'])
const LITERACY_TYPES = new Set<Probe['probeType']>([
  'letter-name-audio',
  'letter-sound-audio',
  'cvc-image',
])

function isMath(p: Probe): boolean {
  return MATH_TYPES.has(p.probeType)
}

function isLiteracy(p: Probe): boolean {
  return LITERACY_TYPES.has(p.probeType)
}

// --------------------------------------------------------------------------
// bumpLevel
// --------------------------------------------------------------------------

describe('bumpLevel', () => {
  it('walks the ladder up one step on +1', () => {
    expect(bumpLevel('locked', 1)).toBe('intro')
    expect(bumpLevel('intro', 1)).toBe('practicing')
    expect(bumpLevel('practicing', 1)).toBe('mastered')
  })

  it('walks the ladder down one step on -1', () => {
    expect(bumpLevel('mastered', -1)).toBe('practicing')
    expect(bumpLevel('practicing', -1)).toBe('intro')
    expect(bumpLevel('intro', -1)).toBe('locked')
  })

  it('clamps at mastered on +1', () => {
    expect(bumpLevel('mastered', 1)).toBe('mastered')
  })

  it('clamps at locked on -1', () => {
    expect(bumpLevel('locked', -1)).toBe('locked')
  })

  it('is pure (no shared state across calls)', () => {
    expect(bumpLevel('intro', 1)).toBe('practicing')
    expect(bumpLevel('intro', 1)).toBe('practicing')
  })
})

// --------------------------------------------------------------------------
// pickProbes — length, composition, winnable-first, sequencing, interleave
// --------------------------------------------------------------------------

describe('pickProbes — length cap', () => {
  it('returns 4 probes for age 5 (PSY-02 cap)', () => {
    expect(pickProbes(5).length).toBe(4)
  })

  for (const age of [6, 7, 8, 9, 10] as const) {
    it(`returns 6 probes for age ${age}`, () => {
      expect(pickProbes(age).length).toBe(6)
    })
  }
})

describe('pickProbes — composition (math + literacy split)', () => {
  it('age 5 returns 2 math + 2 literacy', () => {
    const probes = pickProbes(5)
    expect(probes.filter(isMath).length).toBe(2)
    expect(probes.filter(isLiteracy).length).toBe(2)
  })

  for (const age of [6, 7, 8, 9, 10] as const) {
    it(`age ${age} returns 3 math + 3 literacy`, () => {
      const probes = pickProbes(age)
      expect(probes.filter(isMath).length).toBe(3)
      expect(probes.filter(isLiteracy).length).toBe(3)
    })
  }
})

describe('pickProbes — winnable-first rule (PSY-02 §6)', () => {
  for (const age of ALL_AGES) {
    it(`age ${age}: probe[0] is difficulty: 'easy'`, () => {
      const probes = pickProbes(age)
      expect(probes[0].difficulty).toBe('easy')
    })

    it(`age ${age}: probe[0] is in-band for the age`, () => {
      const [min, max] = pickProbes(age)[0].ageBand
      expect(age).toBeGreaterThanOrEqual(min)
      expect(age).toBeLessThanOrEqual(max)
    })
  }

  // The math leader is the first probe overall (math-first interleave) and
  // should be the easiest in-band math item — concretely the lowest-rank
  // 'easy' item.
  it('age 5: probe[0] is a dot-array (no numerals at age 5, PSY-02)', () => {
    expect(pickProbes(5)[0].probeType).toBe('dot-array')
  })

  it('age 6+: probe[0] is a numeral math probe', () => {
    for (const age of [6, 7, 8, 9, 10] as const) {
      expect(pickProbes(age)[0].probeType).toBe('numeral')
    }
  })
})

describe('pickProbes — math-first interleave', () => {
  for (const age of ALL_AGES) {
    it(`age ${age}: probes alternate math, literacy, math, literacy, ...`, () => {
      const probes = pickProbes(age)
      probes.forEach((p, i) => {
        if (i % 2 === 0) {
          expect(isMath(p)).toBe(true)
        } else {
          expect(isLiteracy(p)).toBe(true)
        }
      })
    })
  }
})

describe('pickProbes — PSY-02 age-5 / age-6 literacy sequencing', () => {
  it('age 5 literacy probes: letter-name precedes letter-sound', () => {
    const literacy = pickProbes(5).filter(isLiteracy)
    const nameIdx = literacy.findIndex(
      (p) => p.probeType === 'letter-name-audio',
    )
    const soundIdx = literacy.findIndex(
      (p) => p.probeType === 'letter-sound-audio',
    )
    if (nameIdx !== -1 && soundIdx !== -1) {
      expect(nameIdx).toBeLessThan(soundIdx)
    }
  })

  it('age 6 literacy probes: letter-name precedes letter-sound', () => {
    const literacy = pickProbes(6).filter(isLiteracy)
    const nameIdx = literacy.findIndex(
      (p) => p.probeType === 'letter-name-audio',
    )
    const soundIdx = literacy.findIndex(
      (p) => p.probeType === 'letter-sound-audio',
    )
    if (nameIdx !== -1 && soundIdx !== -1) {
      expect(nameIdx).toBeLessThan(soundIdx)
    }
  })

  it('age 5 math probes are dot-array only (no numerals)', () => {
    const math = pickProbes(5).filter(isMath)
    expect(math.every((p) => p.probeType === 'dot-array')).toBe(true)
  })

  it('age 6+ math probes are numeral only (no dot-array; pre-K only)', () => {
    for (const age of [6, 7, 8, 9, 10] as const) {
      const math = pickProbes(age).filter(isMath)
      expect(math.every((p) => p.probeType === 'numeral')).toBe(true)
    }
  })
})

describe('pickProbes — output integrity', () => {
  it('returns a fresh array per call (caller may mutate)', () => {
    const a = pickProbes(7)
    const b = pickProbes(7)
    expect(a).not.toBe(b)
    a.length = 0
    expect(b.length).toBe(6)
  })

  it('every returned probe is in-band for the requested age', () => {
    for (const age of ALL_AGES) {
      const probes = pickProbes(age)
      for (const p of probes) {
        expect(age).toBeGreaterThanOrEqual(p.ageBand[0])
        expect(age).toBeLessThanOrEqual(p.ageBand[1])
      }
    }
  })

  it('every returned probe has 2 or 3 choices, never 4+', () => {
    for (const age of ALL_AGES) {
      for (const p of pickProbes(age)) {
        expect(p.choices.length === 2 || p.choices.length === 3).toBe(true)
      }
    }
  })

  it('every returned probe has a valid correctIndex', () => {
    for (const age of ALL_AGES) {
      for (const p of pickProbes(age)) {
        expect(p.correctIndex).toBeGreaterThanOrEqual(0)
        expect(p.correctIndex).toBeLessThan(p.choices.length)
      }
    }
  })

  it('determinism: same age returns identical probe ids', () => {
    for (const age of ALL_AGES) {
      const a = pickProbes(age).map((p) => p.id)
      const b = pickProbes(age).map((p) => p.id)
      expect(a).toEqual(b)
    }
  })
})

describe('pickProbeSet', () => {
  it('wraps pickProbes with the forAge envelope', () => {
    const set = pickProbeSet(8)
    expect(set.forAge).toBe(8)
    expect(set.probes.length).toBe(6)
  })
})

// --------------------------------------------------------------------------
// applyDiagnostic
// --------------------------------------------------------------------------

function progressFor(age: Age): Progress {
  return defaultProgress('Tester', age)
}

function outcomeFor(probe: Probe, isCorrect: boolean): ProbeOutcome {
  return {
    probeId: probe.id,
    pickedIndex: isCorrect
      ? probe.correctIndex
      : (((probe.correctIndex + 1) % probe.choices.length) as 0 | 1 | 2),
    isCorrect,
    responseMs: 1234,
  }
}

describe('applyDiagnostic — purity', () => {
  it('does not mutate the input progress', () => {
    const before = progressFor(7)
    const snapshot = JSON.parse(JSON.stringify(before)) as Progress
    const probes = pickProbes(7)
    const outcomes = probes.map((p) => outcomeFor(p, true))
    applyDiagnostic(before, outcomes, probes)
    expect(before).toEqual(snapshot)
  })

  it('does not mutate the input outcomes', () => {
    const probes = pickProbes(7)
    const outcomes = probes.map((p) => outcomeFor(p, true))
    const snapshot = JSON.parse(JSON.stringify(outcomes)) as ProbeOutcome[]
    applyDiagnostic(progressFor(7), outcomes, probes)
    expect(outcomes).toEqual(snapshot)
  })

  it('returns a new skillLevels object (not aliased to input)', () => {
    const p = progressFor(7)
    const probes = pickProbes(7)
    const { progress: next } = applyDiagnostic(p, [], probes)
    expect(next.skillLevels).not.toBe(p.skillLevels)
  })
})

describe('applyDiagnostic — nudge mechanics', () => {
  it('correct answer nudges the target node up by one', () => {
    const probes = pickProbes(7)
    const probe = probes[0]
    const before = progressFor(7)
    const beforeLevel = before.skillLevels[probe.nodeId]
    const { progress: after } = applyDiagnostic(
      before,
      [outcomeFor(probe, true)],
      probes,
    )
    expect(after.skillLevels[probe.nodeId]).toBe(
      bumpLevelExpected(beforeLevel, 1),
    )
  })

  it('wrong answer nudges the target node down by one', () => {
    const probes = pickProbes(7)
    const probe = probes[0]
    const before = progressFor(7)
    const beforeLevel = before.skillLevels[probe.nodeId]
    const { progress: after } = applyDiagnostic(
      before,
      [outcomeFor(probe, false)],
      probes,
    )
    expect(after.skillLevels[probe.nodeId]).toBe(
      bumpLevelExpected(beforeLevel, -1),
    )
  })

  it('correct nudge clamps at mastered', () => {
    const before = progressFor(10)
    // Force the targeted node to 'mastered' so a correct answer cannot rise.
    const probes = pickProbes(10)
    const probe = probes[0]
    const masteredBefore: Progress = {
      ...before,
      skillLevels: { ...before.skillLevels, [probe.nodeId]: 'mastered' },
    }
    const { progress: after } = applyDiagnostic(
      masteredBefore,
      [outcomeFor(probe, true)],
      probes,
    )
    expect(after.skillLevels[probe.nodeId]).toBe('mastered')
  })

  it('wrong nudge clamps at locked', () => {
    const before = progressFor(7)
    const probes = pickProbes(7)
    const probe = probes[0]
    const lockedBefore: Progress = {
      ...before,
      skillLevels: { ...before.skillLevels, [probe.nodeId]: 'locked' },
    }
    const { progress: after } = applyDiagnostic(
      lockedBefore,
      [outcomeFor(probe, false)],
      probes,
    )
    expect(after.skillLevels[probe.nodeId]).toBe('locked')
  })

  it('only the targeted nodes are touched; siblings unchanged', () => {
    const before = progressFor(8)
    const probes = pickProbes(8)
    const probe = probes[0]
    const targets = new Set([probe.nodeId])
    const { progress: after } = applyDiagnostic(
      before,
      [outcomeFor(probe, true)],
      probes,
    )
    for (const node of Object.keys(
      after.skillLevels,
    ) as (keyof typeof after.skillLevels)[]) {
      if (targets.has(node)) continue
      expect(after.skillLevels[node]).toBe(before.skillLevels[node])
    }
  })

  it('multiple outcomes apply nudges in order', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const outcomes = [outcomeFor(probes[0], true), outcomeFor(probes[1], true)]
    const { progress: after, result } = applyDiagnostic(
      before,
      outcomes,
      probes,
    )
    expect(result.appliedNudges).toHaveLength(2)
    expect(result.appliedNudges[0].node).toBe(probes[0].nodeId)
    expect(result.appliedNudges[1].node).toBe(probes[1].nodeId)
    expect(after.skillLevels[probes[0].nodeId]).toBe(
      bumpLevelExpected(before.skillLevels[probes[0].nodeId], 1),
    )
  })

  it('ignores outcomes for unknown probe ids', () => {
    const before = progressFor(7)
    const probes = pickProbes(7)
    const ghost: ProbeOutcome = {
      probeId: 'does-not-exist',
      pickedIndex: 0,
      isCorrect: false,
      responseMs: 100,
    }
    const { progress: after, result } = applyDiagnostic(before, [ghost], probes)
    expect(after.skillLevels).toEqual(before.skillLevels)
    expect(result.appliedNudges).toHaveLength(0)
    expect(result.outcomes).toHaveLength(0)
  })
})

describe('applyDiagnostic — two-consecutive-wrong stop rule', () => {
  it('stops applying nudges after two consecutive wrong answers', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const outcomes = [
      outcomeFor(probes[0], false), // wrong (1)
      outcomeFor(probes[1], false), // wrong (2 -> stop)
      outcomeFor(probes[2], true), // would-be applied if not stopped
      outcomeFor(probes[3], true),
    ]
    const { progress: after, result } = applyDiagnostic(
      before,
      outcomes,
      probes,
    )
    expect(result.earlyStopped).toBe(true)
    expect(result.appliedNudges).toHaveLength(2)
    // Probes 2 and 3 must be untouched.
    expect(after.skillLevels[probes[2].nodeId]).toBe(
      before.skillLevels[probes[2].nodeId],
    )
    expect(after.skillLevels[probes[3].nodeId]).toBe(
      before.skillLevels[probes[3].nodeId],
    )
  })

  it('does NOT stop on two non-consecutive wrong answers', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const outcomes = [
      outcomeFor(probes[0], false),
      outcomeFor(probes[1], true), // resets the streak
      outcomeFor(probes[2], false),
      outcomeFor(probes[3], true),
    ]
    const { result } = applyDiagnostic(before, outcomes, probes)
    expect(result.earlyStopped).toBe(false)
    expect(result.appliedNudges).toHaveLength(4)
  })

  it('stops at exactly the second consecutive wrong, not later', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const outcomes = [
      outcomeFor(probes[0], false),
      outcomeFor(probes[1], false), // stop here
      outcomeFor(probes[2], false),
    ]
    const { result } = applyDiagnostic(before, outcomes, probes)
    expect(result.earlyStopped).toBe(true)
    expect(result.appliedNudges).toHaveLength(2)
    expect(result.outcomes).toHaveLength(2)
  })

  it('reports earlyStopped: false when the run finishes cleanly', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const outcomes = probes.map((p) => outcomeFor(p, true))
    const { result } = applyDiagnostic(before, outcomes, probes)
    expect(result.earlyStopped).toBe(false)
  })
})

describe('applyDiagnostic — diagnosticCompletedISO stamp', () => {
  it('stamps when nowISO is supplied', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const { progress: after } = applyDiagnostic(
      before,
      [outcomeFor(probes[0], true)],
      probes,
      { nowISO: '2026-04-25T19:00:00.000Z' },
    )
    expect(after.profile.diagnosticCompletedISO).toBe(
      '2026-04-25T19:00:00.000Z',
    )
  })

  it('preserves the existing value when nowISO is omitted', () => {
    const probes = pickProbes(7)
    const before: Progress = {
      ...progressFor(7),
      profile: {
        ...progressFor(7).profile,
        diagnosticCompletedISO: '2026-01-01T00:00:00.000Z',
      },
    }
    const { progress: after } = applyDiagnostic(
      before,
      [outcomeFor(probes[0], true)],
      probes,
    )
    expect(after.profile.diagnosticCompletedISO).toBe(
      '2026-01-01T00:00:00.000Z',
    )
  })

  it('does not stamp setupCompletedISO', () => {
    const probes = pickProbes(7)
    const before = progressFor(7)
    const { progress: after } = applyDiagnostic(
      before,
      [outcomeFor(probes[0], true)],
      probes,
      { nowISO: '2026-04-25T19:00:00.000Z' },
    )
    expect(after.profile.setupCompletedISO).toBe(
      before.profile.setupCompletedISO,
    )
  })
})

describe('applyDiagnostic — defaults bank fallback', () => {
  it('uses DIAGNOSTIC_BANK if probes argument is omitted', () => {
    const before = progressFor(7)
    const probes = pickProbes(7)
    const probe = probes[0]
    const { progress: after } = applyDiagnostic(before, [
      outcomeFor(probe, true),
    ])
    // The probe id should still resolve via the bank.
    expect(after.skillLevels[probe.nodeId]).toBe(
      bumpLevelExpected(before.skillLevels[probe.nodeId], 1),
    )
  })
})

// --------------------------------------------------------------------------
// shouldEarlyStop
// --------------------------------------------------------------------------

describe('shouldEarlyStop', () => {
  const o = (isCorrect: boolean): ProbeOutcome => ({
    probeId: 'x',
    pickedIndex: 0,
    isCorrect,
    responseMs: 0,
  })

  it('returns false on an empty run', () => {
    expect(shouldEarlyStop([])).toBe(false)
  })

  it('returns false on all correct', () => {
    expect(shouldEarlyStop([o(true), o(true), o(true)])).toBe(false)
  })

  it('returns false on isolated wrongs separated by a correct', () => {
    expect(shouldEarlyStop([o(false), o(true), o(false), o(true)])).toBe(false)
  })

  it('returns true on two consecutive wrongs', () => {
    expect(shouldEarlyStop([o(false), o(false)])).toBe(true)
  })

  it('returns true even if first answer is correct', () => {
    expect(shouldEarlyStop([o(true), o(false), o(false)])).toBe(true)
  })

  it('returns true on three consecutive wrongs (covered by two)', () => {
    expect(shouldEarlyStop([o(false), o(false), o(false)])).toBe(true)
  })
})

// --------------------------------------------------------------------------
// Integration sanity — engine produces a v2-shape doc on every age
// --------------------------------------------------------------------------

describe('integration: engine + defaultProgress shell', () => {
  it('every age: applying all-correct outcomes leaves the doc in v2 shape', () => {
    for (const age of ALL_AGES) {
      const before = defaultProgress('Tester', age)
      const probes = pickProbes(age)
      const outcomes = probes.map((p) => outcomeFor(p, true))
      const { progress: after } = applyDiagnostic(before, outcomes, probes)
      expect(after.schemaVersion).toBe(2)
      expect(after.profile.age).toBe(age)
      // Skill levels for nodes never touched by probes match the seed.
      const touched = new Set(probes.map((p) => p.nodeId))
      for (const node of Object.keys(
        before.skillLevels,
      ) as (keyof typeof before.skillLevels)[]) {
        if (touched.has(node)) continue
        expect(after.skillLevels[node]).toBe(before.skillLevels[node])
      }
    }
  })
})

// --------------------------------------------------------------------------
// Helper — replicate bumpLevel inline (kept independent of the engine impl
// so test failures point at the engine, not at a shared helper).
// --------------------------------------------------------------------------

function bumpLevelExpected(level: SkillLevel, delta: -1 | 1): SkillLevel {
  const ladder: SkillLevel[] = ['locked', 'intro', 'practicing', 'mastered']
  const i = ladder.indexOf(level)
  const next = Math.max(0, Math.min(ladder.length - 1, i + delta))
  return ladder[next]
}
