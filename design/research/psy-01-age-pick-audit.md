# PSY-01 — Age-Pick UX Audit (ages 5–10)

> **Reconstruction note (orchestrator).** Dave's subagent process posted the
> canonical comment on ClickUp ticket
> [86c9gqq61](https://app.clickup.com/t/86c9gqq61) but the markdown file
> didn't survive into the main worktree (per-agent worktree isolation in this
> runtime). The content below is taken verbatim from Dave's posted comment
> and report-back; the **canonical record is the ClickUp comment**. Evidence
> tier classification and a counter-evidence section are absent — Dave's
> Format A normally includes them; deferred to a follow-up Dave session.

## Question

Is a six-tile age picker (5/6/7/8/9/10) age-appropriate at *both* ends of
the band? Specifically: can 5-year-olds reliably pick their own age from a
numeral tile, and does an age question feel babyish or surveillance-y to
10-year-olds?

## Bottom line

The six-tile picker has real risk at both ends but **neither end requires a
structural redesign**. Age 5 is the unreliable end: children this age know
their age as a verbal fact but are inconsistent self-reporters on a numeral
tile (Varni et al., 2007; Conijn et al., 2020). Age 10 is the identity-risk
end: preadolescents are grade-aware, resist "little-kid" framing, and read
age questions as surveillance.

## Evidence

- **Varni JW, Limbers CA, Burwinkle TM (2007).** *Health and Quality of
  Life Outcomes* 5:1. **n = 8,591.** Strongest available evidence on child
  self-report reliability across ages 5–18.
- **Conijn et al. (2020).** Self-report reliability in early childhood
  digital assessments. Single-study support for the Varni findings.
- **NNGroup children's UX research.** Practitioner consensus on
  preadolescent UX patterns and self-presentation.
- **Child Mind Institute — tween development.** Clinical reference on
  preadolescent identity and peer-scrutiny dynamics.

## Application to the age band

- **Age 5:** 5-year-olds may tap "6" because they're "almost 6" or because
  the tile looks appealing. The error has low downstream harm — Axelot's
  adaptive engine recovers — but the UX should reduce the chance of a wrong
  pick by adding a parent-assist nudge when age 5 is tapped.
- **Ages 6–9:** Reliable self-reporters; no special handling needed.
- **Age 10:** Risk is *not* misreporting (10-year-olds are accurate); risk
  is *resistance*. Adding small grade-level sub-labels under the 9 and 10
  tiles costs nothing and gives older kids a self-concept hook.

## Recommendations (three concrete changes for UX-01)

1. **Parent-assist confirmation prompt** on the age-5 tile only. Light
   touch — "Is a grown-up nearby? Tap '5' if you're 5." No hard gate.
2. **Small grade-level sub-labels** on tiles 9 and 10 ("3rd / 4th" and
   "4th / 5th grade"). Optional on younger tiles.
3. **Reframe the picker header** as "So Axel knows where to start!" —
   instrumental, not identity-classifying. Removes the surveillance read
   for older kids and gives all ages a "why".

Low cost, fits v1.

## Provenance

- Authored by Dave (sonnet) for ticket [PSY-01 (86c9gqq61)](https://app.clickup.com/t/86c9gqq61).
- Markdown reconstruction by the orchestrator from Dave's ClickUp comment
  after Dave's file-write step did not persist. Canonical record is the
  ClickUp comment.
- Date: 2026-04-25.
