// TODO(DEV-05): Replace this stub with the real Diagnostic screen — ~6
// probes (3 math + 3 literacy, age-band-bounded). Each probe nudges its
// target node ±1 level within ['locked','intro','practicing','mastered']
// (clamped). Engine lives in `src/lib/setup/diagnosticEngine.ts` (DEV-04);
// item bank in `src/content/diagnostic.ts` (DEV-04).
//
// This stub exists so DEV-06 can wire the routing path end-to-end (Splash →
// Setup → Diagnostic → Greet) before the real screen ships. It renders a
// marker div so the App-level routing test can assert the route is mounted.
//
// Contract for the eventual real screen:
//   - On completion (or skip): apply nudges to the in-memory Progress doc,
//     persist via saveProgress(), and call onAdvance() (→ Greet).

export interface DiagnosticProps {
  /** Probes done (or skipped) — go to Greet. */
  onAdvance: () => void
}

// Stub: props are defined for the real screen's contract (DEV-05) but
// not consumed here. We `void`-consume the binding so both
// noUnusedParameters (TS) and @typescript-eslint/no-unused-vars (eslint)
// see it as read — preserving the typed contract for DEV-05 to inherit.
export default function Diagnostic(props: DiagnosticProps) {
  void props
  return <div data-testid="diagnostic-stub" />
}
