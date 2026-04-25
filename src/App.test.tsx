import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

// Splash imports tts.cancel — give it a no-op so jsdom doesn't trip over
// the absent speechSynthesis global. Also stub speak() to a never-resolving
// promise so Greet can mount without firing real TTS in jsdom.
// loadVoices / primeVoices are no-ops in tests; Splash calls them on mount
// as part of the iPad TTS warmup.
vi.mock('./lib/tts', () => ({
  speak: vi.fn(() => new Promise<void>(() => {})),
  cancel: vi.fn(),
  loadVoices: vi.fn(() => Promise.resolve([])),
  primeVoices: vi.fn(),
}))

// Greet creates a chime SFX on mount; jsdom has no audio backend. Stub the
// factory so we don't pay an XHR + console.warn on every test render.
vi.mock('./lib/sfx', () => ({
  createSfx: vi.fn(() => ({
    play: vi.fn(() => true),
    unload: vi.fn(),
    missedPlays: 0,
    loadFailed: false,
  })),
}))

// Routing branch under test: App reads loadProgress() once on splash exit.
// Mock the module so each test can dictate the first-run vs returning-user
// branch without touching real localStorage. The vi.fn() identity is
// stable across the suite so we can re-target it per test via
// mockReturnValue.
vi.mock('./lib/progress', () => ({
  loadProgress: vi.fn(() => null),
}))
import { loadProgress } from './lib/progress'

const ORIGINAL_LOCATION = window.location

function setSearch(search: string): void {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...ORIGINAL_LOCATION, search },
  })
}

function restoreSearch(): void {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: ORIGINAL_LOCATION,
  })
}

/**
 * Advance through the splash auto-advance + AnimatePresence exit. Splash
 * caps at 3000 ms cold; the extra 500 ms covers the AnimatePresence exit
 * transition so the next screen is fully mounted by the time we assert.
 */
async function advancePastSplash(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000)
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500)
  })
}

describe('App routing skeleton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.sessionStorage.clear()
    // Default: first-run (no progress). Individual tests override.
    vi.mocked(loadProgress).mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
    restoreSearch()
    vi.mocked(loadProgress).mockReset()
  })

  it('starts on Splash and routes to Setup on first run', async () => {
    vi.mocked(loadProgress).mockReturnValue(null)

    render(<App />)
    expect(screen.getByTestId('splash')).toBeInTheDocument()
    expect(screen.queryByTestId('setup-stub')).toBeNull()
    expect(screen.queryByTestId('greet')).toBeNull()

    await advancePastSplash()

    // First-run: Splash → Setup, NOT Greet.
    expect(screen.getByTestId('setup-stub')).toBeInTheDocument()
    expect(screen.queryByTestId('greet')).toBeNull()
  })

  it('routes returning users (existing progress) straight to Greet', async () => {
    // Returning-user branch: any non-null Progress shape is enough — App
    // only checks `=== null`, it doesn't introspect the doc. We use a
    // minimal object cast so the test doesn't depend on the v1/v2 schema
    // shape that DEV-01 is bumping in parallel.
    vi.mocked(loadProgress).mockReturnValue(
      {} as ReturnType<typeof loadProgress>,
    )

    render(<App />)
    expect(screen.getByTestId('splash')).toBeInTheDocument()

    await advancePastSplash()
    // Greet mounts speak() / sfx / gate effects on mount; let them settle
    // before asserting. The mocks above keep them all no-op, but the
    // useAudioUnlockGate's internal effects still pump a microtask or two.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
    })

    expect(screen.getByTestId('greet')).toBeInTheDocument()
    expect(screen.queryByTestId('setup-stub')).toBeNull()
  })

  it('only consults loadProgress once, on splash exit', async () => {
    vi.mocked(loadProgress).mockReturnValue(null)

    render(<App />)
    // Pre-splash-exit: should not have been called yet.
    expect(vi.mocked(loadProgress)).not.toHaveBeenCalled()

    await advancePastSplash()

    // Exactly one read on the splash-exit branch.
    expect(vi.mocked(loadProgress)).toHaveBeenCalledTimes(1)
  })

  describe('debug overlay', () => {
    // The overlay is gated on `?debug=1`. Without it, normal sessions never
    // see (or pay for) the panel — critical because we ship debug to prod and
    // rely on the URL flag as the only opt-in.
    it('does NOT mount the debug overlay without ?debug=1', () => {
      setSearch('')
      render(<App />)
      expect(screen.queryByTestId('debug-overlay')).toBeNull()
    })

    it('mounts the debug overlay when ?debug=1 is present', () => {
      setSearch('?debug=1')
      render(<App />)
      expect(screen.getByTestId('debug-overlay')).toBeInTheDocument()
    })

    it('does NOT mount the overlay for any other debug value', () => {
      setSearch('?debug=true')
      render(<App />)
      expect(screen.queryByTestId('debug-overlay')).toBeNull()
    })
  })
})
