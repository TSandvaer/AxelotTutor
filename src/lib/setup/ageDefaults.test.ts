/**
 * Cell-by-cell coverage of the age → SkillLevels matrix.
 *
 * 17 nodes × 6 ages = 102 expected cells. Every cell is asserted, plus
 * structural invariants (monotonic across ages, returns a fresh copy,
 * one cell per node).
 */

import { describe, expect, it } from 'vitest'

import type { Age, SkillLevel, SkillLevels, SkillNode } from '../progress/types'
import { defaultsForAge } from './ageDefaults'

const ALL_NODES: readonly SkillNode[] = [
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
] as const

const ALL_AGES: readonly Age[] = [5, 6, 7, 8, 9, 10] as const

const LEVEL_RANK: Record<SkillLevel, number> = {
  locked: 0,
  intro: 1,
  practicing: 2,
  mastered: 3,
}

// --------------------------------------------------------------------------
// The expected matrix, kept here in the test instead of imported from the
// source. Duplication is the point: the test acts as a second-source check
// that the production map agrees with the spec, so a fat-finger edit in
// either file shows up immediately.
// --------------------------------------------------------------------------

type Matrix = Record<Age, SkillLevels>

const EXPECTED: Matrix = {
  5: {
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
    'letter-names': 'practicing',
    'letter-sounds': 'intro',
    'blending-cv': 'locked',
    'cvc-words': 'locked',
    digraphs: 'locked',
    'sight-words': 'locked',
    'simple-sentences': 'locked',
  },
  6: {
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
    'letter-names': 'mastered',
    'letter-sounds': 'practicing',
    'blending-cv': 'practicing',
    'cvc-words': 'intro',
    digraphs: 'locked',
    'sight-words': 'intro',
    'simple-sentences': 'locked',
  },
  7: {
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
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'practicing',
    digraphs: 'intro',
    'sight-words': 'practicing',
    'simple-sentences': 'intro',
  },
  8: {
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
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'mastered',
    digraphs: 'practicing',
    'sight-words': 'practicing',
    'simple-sentences': 'practicing',
  },
  9: {
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
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'mastered',
    digraphs: 'mastered',
    'sight-words': 'mastered',
    'simple-sentences': 'practicing',
  },
  10: {
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
    'letter-names': 'mastered',
    'letter-sounds': 'mastered',
    'blending-cv': 'mastered',
    'cvc-words': 'mastered',
    digraphs: 'mastered',
    'sight-words': 'mastered',
    'simple-sentences': 'mastered',
  },
}

describe('defaultsForAge — every cell of the 17×6 matrix', () => {
  // Parametrized loop — one assertion per cell, 102 total.
  for (const age of ALL_AGES) {
    for (const node of ALL_NODES) {
      it(`age ${age} × ${node} = ${EXPECTED[age][node]}`, () => {
        const result = defaultsForAge(age)
        expect(result[node]).toBe(EXPECTED[age][node])
      })
    }
  }
})

describe('defaultsForAge — structural invariants', () => {
  it('returns exactly the 17 expected nodes for every age (no extras, no missing)', () => {
    for (const age of ALL_AGES) {
      const keys = Object.keys(defaultsForAge(age)).sort()
      expect(keys).toEqual([...ALL_NODES].sort())
    }
  })

  it('returns a fresh object per call (callers may mutate)', () => {
    const a = defaultsForAge(7)
    const b = defaultsForAge(7)
    expect(a).not.toBe(b)
    a['add-to-10'] = 'locked'
    expect(b['add-to-10']).toBe('mastered')
  })

  it('mutating the returned object does not bleed into the next call', () => {
    const a = defaultsForAge(8)
    a['mult-2-5-10'] = 'mastered'
    const b = defaultsForAge(8)
    expect(b['mult-2-5-10']).toBe('intro')
  })

  it('is monotonic across ages on every node (level never decreases)', () => {
    // For each node, level(age+1) >= level(age) on the locked < intro <
    // practicing < mastered ladder. Catches any future regression that
    // would have, say, age 10 starting "behind" age 9 on a node.
    for (const node of ALL_NODES) {
      let prevRank = -1
      for (const age of ALL_AGES) {
        const rank = LEVEL_RANK[defaultsForAge(age)[node]]
        expect(
          rank,
          `${node}: level at age ${age} regressed from age ${age - 1}`,
        ).toBeGreaterThanOrEqual(prevRank)
        prevRank = rank
      }
    }
  })
})

describe('defaultsForAge — PSY-02 sequencing rules', () => {
  it('age 5: letter-names is at least as advanced as letter-sounds', () => {
    const m = defaultsForAge(5)
    expect(LEVEL_RANK[m['letter-names']]).toBeGreaterThanOrEqual(
      LEVEL_RANK[m['letter-sounds']],
    )
  })

  it('age 6: letter-names is at least as advanced as letter-sounds', () => {
    const m = defaultsForAge(6)
    expect(LEVEL_RANK[m['letter-names']]).toBeGreaterThanOrEqual(
      LEVEL_RANK[m['letter-sounds']],
    )
  })

  it('age 5: number-recog is at least as advanced as add-to-10', () => {
    const m = defaultsForAge(5)
    expect(LEVEL_RANK[m['number-recog']]).toBeGreaterThanOrEqual(
      LEVEL_RANK[m['add-to-10']],
    )
  })
})
