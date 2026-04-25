# PSY-02 — Diagnostic-Question UX Audit (six-probe adaptive diagnostic, ages 5–10)

> **Reconstruction note (orchestrator).** Dave's subagent process posted the
> canonical comment on ClickUp ticket
> [86c9gqq7m](https://app.clickup.com/t/86c9gqq7m). The full Format A
> markdown file existed briefly in Dave's worktree but did not survive into
> the main worktree (per-agent worktree isolation in this runtime). Content
> below is taken verbatim from Dave's posted comment and report-back; the
> **canonical record is the ClickUp comment**. Evidence-tier classification
> and a counter-evidence section are absent — Dave's Format A normally
> includes them; deferred to a follow-up Dave session.

## Question

Is a six-question diagnostic probe appropriate for a 5-year-old?
Specifically: does it risk demotivation or failure-framing at the youngest
end? What probe wording is safe for pre-decoders? At what point does "still
wrong" become harmful framing? Should the diagnostic branch or shorten for
younger children? Which item types — count-the-dots vs. numeral,
letter-name vs. letter-sound — are reliable at each age band?

## Bottom line

Six probes are **fine for ages 6–10 but too many for an unassisted
5-year-old**, and the **item types matter as much as the count**. The fix
is a branching rule that caps at 4 probes for age 5, guarantees a winnable
item first regardless of age, replaces text-based literacy probes with
audio-plus-image formats for age 5, and stops early on two consecutive
wrong answers at any age. These changes affect both the UX-02 screen spec
and the DEV-04 item-bank schema.

## Key findings

### Length

- **Cap at 4 probes for age 5** (Purpura & Lonigan, 2015 preschool numeracy
  scales; practitioner attention-span consensus).
- **Stop early if two consecutive wrong answers occur at any age** —
  prevents floor-effect pile-up.

### Literacy probes at age 5

- **No text-dependent items.** Replace with audio-prompt + picture-choice
  (Axel says a sound; child picks the matching image).
- **Letter-name must precede letter-sound** in probe sequencing. Probing
  sounds before names creates false floor effects (Scarborough
  meta-analysis of 61 studies; DIBELS norming data).

### Math probes at age 5

- **Use dot arrays in the subitizable range (1–4), not numerals.**
  Set-to-numeral tasks have higher validity than numeral-only for pre-K
  age (Purpura & Lonigan).
- Numerals become primary at age 6.

### Motivation framing

- **Guarantee a winnable first item.** Frame the diagnostic as "help Axel
  learn about you," not a test.
- Wrong-answer feedback in the diagnostic must be the **mildest Axel
  reaction** — no retry, no accumulating visual failure signal (Cambridge
  YL Assessment, 2020; Dweck / Haimovitz failure-framing research).

## DEV-04 item-bank schema implications

The probe item bank needs:

- A `probeType` field with values: `dot-array | numeral | letter-name-audio | letter-sound-audio | cvc-image`.
- `ageMin` / `ageMax` per item (already in the orchestrator's plan as
  `ageBand: [min, max]` — confirmed by this audit).
- A two-consecutive-wrong **stop rule** built into the engine, not the
  screen.

Kevin (DEV-04) and Kyle (UX-02) jointly absorb these requirements.

## Evidence

- **Scarborough HS (2001).** *Handbook of Early Literacy Research*.
  Meta-analysis of 61 studies. **Strongest evidence** in the audit for the
  letter-name-before-letter-sound sequencing rule.
- **Purpura DJ, Lonigan CJ (2015).** Preschool numeracy scales —
  set-to-numeral validity over numeral-only at pre-K age.
- **DIBELS norming data.** Supports Scarborough on early literacy
  sequencing.
- **Cambridge Young Learners Assessment (2020).** Failure-framing risk in
  diagnostic contexts.
- **Dweck / Haimovitz failure-framing research.** Mindset literature on
  visible-failure signals in young children.

## Recommendations (UX-02 + DEV-04 + screen-level changes)

1. **Cap at 4 probes for age 5** (UX-02 + DEV-04 engine rule).
2. **Stop early on two consecutive wrong answers, any age** (DEV-04 engine
   rule).
3. **Audio-prompt + picture-choice** for literacy probes at age 5 (UX-02
   spec; DEV-04 item bank `probeType: letter-sound-audio` /
   `cvc-image`).
4. **Letter-name probes before letter-sound probes** in the age-5/6
   sequence.
5. **Dot-array math probes** for age 5 (subitizable range 1–4); numerals
   from age 6 onward.
6. **Guarantee a winnable first item** at every age (DEV-04 engine).
7. **Mildest Axel wrong-answer reaction** in diagnostic mode, no retry
   (UX-02 spec).
8. **Frame the diagnostic** as "help Axel learn about you," not a test
   (UX-02 copy).

## Provenance

- Authored by Dave (sonnet) for ticket [PSY-02 (86c9gqq7m)](https://app.clickup.com/t/86c9gqq7m).
- Markdown reconstruction by the orchestrator from Dave's ClickUp comment
  after Dave's file-write step did not persist. Canonical record is the
  ClickUp comment.
- Date: 2026-04-25.
