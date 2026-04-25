/**
 * Smoke test pinning the post-rebrand storage-key contract.
 *
 * Authored by Jessica during QA-01 (ClickUp 86c9gqq51) — "post-rebrand
 * baseline regression". The MarianLearning fork stored progress under
 * `marian-tutor:progress:v1`. The Axelot rebrand renamed the key to
 * `axelot-tutor:progress:v1`. There is no migration from the old key —
 * Axelot Tutor is a fresh-install variant — so a leaked Marian key in
 * production storage would silently shadow real progress (or vice versa
 * if someone re-introduced the old constant during a refactor).
 *
 * This test fails loudly if either:
 *   - `STORAGE_KEY` ever drifts from the documented Axelot value, or
 *   - The legacy Marian key pattern ever appears as a localStorage write
 *     during a save round-trip.
 *
 * It is intentionally narrow: a single load-bearing assertion + a paired
 * negative assertion. Anything heavier belongs in `progress.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, defaultProgress, saveProgress } from './index'

const LEGACY_MARIAN_KEY = 'marian-tutor:progress:v1'

describe('storage key — post-Axelot-rebrand contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('uses the Axelot-namespaced key, not the legacy Marian key', () => {
    // Pin the exact string. If a refactor renames it, this catches the
    // change at code-review time, not at runtime when an actual user
    // loses their progress on upgrade.
    expect(STORAGE_KEY).toBe('axelot-tutor:progress:v1')
    expect(STORAGE_KEY).not.toBe(LEGACY_MARIAN_KEY)
    expect(STORAGE_KEY.startsWith('axelot-tutor:')).toBe(true)
    expect(STORAGE_KEY.includes('marian')).toBe(false)
  })

  it('writes only the Axelot key and never the legacy Marian key', () => {
    // Round-trip a default save, then enumerate every localStorage entry.
    // The Axelot key is the only one we expect to see; the Marian key is
    // the one we explicitly forbid.
    saveProgress(defaultProgress('Test', 7))

    const allKeys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k !== null) allKeys.push(k)
    }

    expect(allKeys).toContain('axelot-tutor:progress:v1')
    expect(allKeys).not.toContain(LEGACY_MARIAN_KEY)
    // Belt-and-braces: no key may even pattern-match the legacy namespace,
    // covering the case where a future refactor adds a sibling key
    // (e.g. `marian-tutor:profile`) and we'd want the smoke to scream.
    for (const k of allKeys) {
      expect(k.startsWith('marian-')).toBe(false)
      expect(k.includes(':marian:')).toBe(false)
    }
  })
})
