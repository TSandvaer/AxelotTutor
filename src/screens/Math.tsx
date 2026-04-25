import { m } from 'motion/react'

/**
 * Screen 3 — Math (Number Garden) STUB.
 *
 * The real math screen is a future ticket. This stub exists so the
 * Greet → Math hand-off (heart tap) has a destination — when the Number
 * Garden ticket lands it'll replace this file without touching App.tsx.
 *
 * Minimal markup, identical safe-area handling, and crucially the
 * `layoutId="axel"` wrapper so the shared-element transition from Greet
 * has somewhere to land.
 */
export default function Math() {
  return (
    <main
      data-testid="math-stub"
      className="
        relative flex h-full w-full flex-col items-center justify-center
        bg-axel-cream text-ink
        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
        pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]
      "
    >
      <m.img
        layoutId="axel"
        src="/assets/axel-idle.svg"
        alt="Axel"
        draggable={false}
        className="h-[40vh] w-auto select-none"
      />
      <p className="mt-8 text-2xl font-medium">Number Garden (TBD)</p>
    </main>
  )
}
