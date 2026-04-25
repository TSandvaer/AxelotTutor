import { useCallback, useMemo, useState } from 'react'
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
} from 'motion/react'
import Splash from './screens/Splash'
import Setup from './screens/Setup'
import Diagnostic from './screens/Diagnostic'
import Greet from './screens/Greet'
import Math from './screens/Math'
import { DebugOverlay, isDebugEnabled } from './lib/debug'
import { loadProgress } from './lib/progress'
import type { Route } from './router/route'
import { FIRST_ROUTE } from './router/route'

/**
 * App shell.
 *
 * Routing is intentionally a tiny piece of local state — see
 * `src/router/route.ts` for the rationale. The session is a fixed sequence
 * with one branch on splash-exit (first-run vs returning-user); we don't
 * pay the bundle cost of react-router until URLs become a real requirement
 * (parental dashboard / return-user flow).
 *
 * Setup-phase contract (DEV-06)
 * -----------------------------
 * On Splash auto-advance we branch on `loadProgress() === null`:
 *
 *   - First run (no stored Progress doc):  Splash → Setup
 *       - direct path:     Setup → Greet
 *       - diagnostic path: Setup → Diagnostic → Greet
 *   - Returning user:                       Splash → Greet
 *
 * The branch decision happens once, synchronously, inside `goAfterSplash`.
 * We do NOT re-check `loadProgress()` after Setup completes: by then the
 * Setup screen has written the v2 Progress doc itself (per CLAUDE.md
 * "Setup-phase contract" — DEV-03 owns the write). If we re-checked, a
 * mid-setup tab close + reload would skip Setup (correctly) the second
 * time, but a misbehaving Setup screen that completed without writing
 * could trap the kid in a Setup → Greet → Setup loop on next launch.
 * The branch-once contract keeps that failure mode contained to DEV-03.
 *
 * Note: Setup and Diagnostic are stubbed (DEV-03 / DEV-05 ship the real
 * screens). The routing wiring here is the contract those tickets pick up.
 *
 * Motion is wrapped here so every screen can use `<m.*>` without each one
 * paying the LazyMotion init cost. Reduce-motion is honoured globally:
 * iPad's "Reduce Motion" accessibility toggle collapses springs to fades
 * and freezes infinite-repeat pulses. Each screen still gets the same
 * markup — no per-screen branching for the a11y path.
 */
export default function App() {
  const [route, setRoute] = useState<Route>(FIRST_ROUTE)

  /**
   * Splash-exit branch: first-run → Setup, returning-user → Greet.
   *
   * `loadProgress()` is the sole source of truth: the storage adapter
   * already returns `null` for missing-blob, parse-failure, and
   * unmigratable-version cases (see `src/lib/progress/storage.ts`). That
   * means a corrupted Progress doc fails forward into Setup rather than
   * trapping the kid in a half-broken Greet — the right default for an
   * audio-first iPad app where "show the friendly setup screen again" is
   * always safer than "show a stuck Axel".
   */
  const goAfterSplash = useCallback(() => {
    setRoute(loadProgress() === null ? 'setup' : 'greet')
  }, [])

  const goSetupDiagnostic = useCallback(() => setRoute('diagnostic'), [])
  const goGreet = useCallback(() => setRoute('greet'), [])
  const goMath = useCallback(() => setRoute('math'), [])

  // Capture once on mount — flipping debug mid-session would tear the
  // overlay in/out and isn't worth the complexity. To enable, append
  // `?debug=1` to the URL (works in Safari tab and PWA install both).
  const debugOn = useMemo(() => isDebugEnabled(), [])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {route === 'splash' && (
            <Splash key="splash" onAdvance={goAfterSplash} />
          )}
          {route === 'setup' && (
            <Setup
              key="setup"
              onAdvance={goGreet}
              onWantDiagnostic={goSetupDiagnostic}
            />
          )}
          {route === 'diagnostic' && (
            <Diagnostic key="diagnostic" onAdvance={goGreet} />
          )}
          {route === 'greet' && <Greet key="greet" onAdvance={goMath} />}
          {route === 'math' && <Math key="math" />}
        </AnimatePresence>
        {/* Debug overlay sits outside AnimatePresence so it persists across
            screen transitions. Gated on `?debug=1` so it never ships visibly
            in normal sessions. See lib/debug/DebugOverlay.tsx for the iPad
            QA usage notes. */}
        {debugOn && <DebugOverlay />}
      </MotionConfig>
    </LazyMotion>
  )
}
