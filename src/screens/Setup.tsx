// TODO(DEV-03): Replace this stub with the real Setup screen — name + age
// picker, "Start" CTA, and a secondary "Want a more accurate start?" link
// that routes to Diagnostic. See `design/setup-screen.md` for the UX spec.
//
// This stub exists so DEV-06 can wire the routing path end-to-end (Splash →
// Setup → Greet, and Splash → Setup → Diagnostic → Greet) before the real
// screen ships. It renders a marker div so the App-level routing test can
// assert the route is mounted.
//
// Contract for the eventual real screen (locked by CLAUDE.md "Setup-phase
// contract"):
//   - On Start: write a v2 Progress doc seeded with defaultsForAge(age) and
//     call onAdvance() (→ Greet).
//   - On the secondary link: call onWantDiagnostic() (→ Diagnostic).

export interface SetupProps {
  /** Direct path: name+age captured, write Progress, go to Greet. */
  onAdvance: () => void
  /** Secondary path: "Want a more accurate start?" → Diagnostic. */
  onWantDiagnostic: () => void
}

export default function Setup(_: SetupProps) {
  return <div data-testid="setup-stub" />
}
