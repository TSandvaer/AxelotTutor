/**
 * Diagnostic probe item bank.
 *
 * Hand-curated bank of probe items used by the optional diagnostic step
 * (Setup → "Want a more accurate start?" → Diagnostic). The engine in
 * `src/lib/setup/diagnosticEngine.ts` selects from this bank by age band
 * and domain.
 *
 * **Schema source of truth.** The `Probe` interface lives in
 * `src/lib/setup/diagnosticTypes.ts` per Kyle's UX-02 spec
 * (`design/diagnostic-screen.md`); this bank is the production data feeding
 * his screen. PSY-02 audit at `design/research/psy-02-diagnostic-audit.md`
 * is folded into the schema (probe-type taxonomy, ageBand, difficulty,
 * winnable-first rule).
 *
 * ## Compositional rules respected here
 *
 * - **Per-age coverage.** Every age 5..10 has at least 3 in-band math
 *   probes and 3 in-band literacy probes — and at least 2 in each domain
 *   tagged `difficulty: 'easy'` — so `pickProbes` can satisfy the
 *   composition + winnable-first contracts without a fallback.
 * - **Probe-type by age (PSY-02).** Age 5 math is `dot-array` only
 *   (subitizable 1–4), shifting to `numeral` from age 6. Age 5/6 literacy
 *   is audio-prompt + image/letter choice (`letter-name-audio`,
 *   `letter-sound-audio`, `cvc-image`); no text-based foils.
 * - **Letter sequencing.** `letter-name-audio` items lead `letter-sound-audio`
 *   items in the age-5/6 bank ordering; the engine's literacy-bucket sort
 *   relies on probeType identity, not bank position, so this is
 *   defence-in-depth.
 * - **Choice arity.** Every probe carries exactly 2 or 3 choices (Kyle's
 *   spec; `Probe.choices` is typed as a 2- or 3-tuple). Never 4+.
 *
 * The bank is intentionally compact (~3 items per band per domain). It's
 * not a question pool the kid drills through — it's the candidate set the
 * engine samples 6 (or 4) probes from on first run.
 */

import type { Probe } from '../lib/setup/diagnosticTypes'

export const DIAGNOSTIC_BANK: readonly Probe[] = [
  // ============================================================ Age 5 — Math
  // Dot arrays only. Subitizable 1..4 per PSY-02. Choices are numerals 1..4.
  {
    id: 'm5-dots-2',
    probeType: 'dot-array',
    ageBand: [5, 5],
    nodeId: 'number-recog',
    stem: { text: '2', spoken: 'How many?' },
    choices: [{ label: '1' }, { label: '2' }, { label: '3' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm5-dots-3',
    probeType: 'dot-array',
    ageBand: [5, 5],
    nodeId: 'number-recog',
    stem: { text: '3', spoken: 'How many?' },
    choices: [{ label: '2' }, { label: '3' }, { label: '4' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm5-dots-4',
    probeType: 'dot-array',
    ageBand: [5, 5],
    nodeId: 'add-to-10',
    stem: { text: '4', spoken: 'How many?' },
    choices: [{ label: '2' }, { label: '3' }, { label: '4' }],
    correctIndex: 2,
    difficulty: 'medium',
  },
  // ======================================================== Age 5 — Literacy
  // Letter-name leads letter-sound; one cvc-image as a stretch item.
  {
    id: 'l5-name-m',
    probeType: 'letter-name-audio',
    ageBand: [5, 5],
    nodeId: 'letter-names',
    stem: { text: '', spoken: 'Tap the letter M.' },
    choices: [{ label: 'M' }, { label: 'N' }, { label: 'W' }],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l5-name-s',
    probeType: 'letter-name-audio',
    ageBand: [5, 5],
    nodeId: 'letter-names',
    stem: { text: '', spoken: 'Tap the letter S.' },
    choices: [{ label: 'S' }, { label: 'Z' }, { label: 'C' }],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l5-sound-m',
    probeType: 'letter-sound-audio',
    ageBand: [5, 5],
    nodeId: 'letter-sounds',
    stem: { text: '', spoken: 'Which letter says /m/?' },
    choices: [{ label: 'M' }, { label: 'N' }, { label: 'P' }],
    correctIndex: 0,
    difficulty: 'medium',
  },
  // ============================================================ Age 6 — Math
  // Numerals from age 6 (PSY-02). Includes one number-recog easy opener.
  {
    id: 'm6-numeral-7',
    probeType: 'numeral',
    ageBand: [6, 6],
    nodeId: 'number-recog',
    stem: { text: '7', spoken: 'What number is this?' },
    choices: [{ label: '5' }, { label: '7' }, { label: '9' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm6-add-2-3',
    probeType: 'numeral',
    ageBand: [6, 7],
    nodeId: 'add-to-10',
    stem: { text: '2 + 3', spoken: 'Two plus three?' },
    choices: [{ label: '4' }, { label: '5' }, { label: '6' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm6-sub-5-2',
    probeType: 'numeral',
    ageBand: [6, 7],
    nodeId: 'sub-to-10',
    stem: { text: '5 − 2', spoken: 'Five take away two?' },
    choices: [{ label: '2' }, { label: '3' }, { label: '4' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  // ======================================================== Age 6 — Literacy
  {
    id: 'l6-name-r',
    probeType: 'letter-name-audio',
    ageBand: [6, 6],
    nodeId: 'letter-names',
    stem: { text: '', spoken: 'Tap the letter R.' },
    choices: [{ label: 'R' }, { label: 'B' }, { label: 'P' }],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l6-sound-s',
    probeType: 'letter-sound-audio',
    ageBand: [6, 7],
    nodeId: 'letter-sounds',
    stem: { text: '', spoken: 'Which letter says /s/?' },
    choices: [{ label: 'S' }, { label: 'Z' }, { label: 'C' }],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l6-cvc-cat',
    probeType: 'cvc-image',
    ageBand: [6, 7],
    nodeId: 'cvc-words',
    stem: { text: '', spoken: 'Find the cat.' },
    choices: [
      { label: 'cat', imageSrc: '/assets/diagnostic/cvc/cat.svg' },
      { label: 'cap', imageSrc: '/assets/diagnostic/cvc/cap.svg' },
      { label: 'cup', imageSrc: '/assets/diagnostic/cvc/cup.svg' },
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
  // ============================================================ Age 7 — Math
  {
    id: 'm7-add-4-5',
    probeType: 'numeral',
    ageBand: [7, 8],
    nodeId: 'add-to-10',
    stem: { text: '4 + 5', spoken: 'Four plus five?' },
    choices: [{ label: '8' }, { label: '9' }, { label: '10' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm7-add-8-7',
    probeType: 'numeral',
    ageBand: [7, 8],
    nodeId: 'add-to-20',
    stem: { text: '8 + 7', spoken: 'Eight plus seven?' },
    choices: [{ label: '14' }, { label: '15' }, { label: '16' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'm7-sub-13-5',
    probeType: 'numeral',
    ageBand: [7, 8],
    nodeId: 'sub-to-20',
    stem: { text: '13 − 5', spoken: 'Thirteen take away five?' },
    choices: [{ label: '7' }, { label: '8' }, { label: '9' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  // ======================================================== Age 7 — Literacy
  {
    id: 'l7-cvc-sun',
    probeType: 'cvc-image',
    ageBand: [7, 8],
    nodeId: 'cvc-words',
    stem: { text: '', spoken: 'Find the sun.' },
    choices: [
      { label: 'sun', imageSrc: '/assets/diagnostic/cvc/sun.svg' },
      { label: 'sub', imageSrc: '/assets/diagnostic/cvc/sub.svg' },
      { label: 'son', imageSrc: '/assets/diagnostic/cvc/son.svg' },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l7-cvc-fish',
    probeType: 'cvc-image',
    ageBand: [7, 8],
    nodeId: 'digraphs',
    stem: { text: '', spoken: 'Find the fish.' },
    choices: [
      { label: 'fish', imageSrc: '/assets/diagnostic/cvc/fish.svg' },
      { label: 'fist', imageSrc: '/assets/diagnostic/cvc/fist.svg' },
      { label: 'dish', imageSrc: '/assets/diagnostic/cvc/dish.svg' },
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    id: 'l7-sight-the',
    probeType: 'cvc-image',
    ageBand: [7, 9],
    nodeId: 'sight-words',
    stem: { text: '', spoken: 'Find the word "the".' },
    choices: [
      { label: 'the', imageSrc: '/assets/diagnostic/sight/the.svg' },
      { label: 'they', imageSrc: '/assets/diagnostic/sight/they.svg' },
      { label: 'this', imageSrc: '/assets/diagnostic/sight/this.svg' },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  // ============================================================ Age 8 — Math
  {
    id: 'm8-twodig-23-15',
    probeType: 'numeral',
    ageBand: [8, 9],
    nodeId: 'two-digit-addsub',
    stem: { text: '23 + 15', spoken: 'Twenty-three plus fifteen?' },
    choices: [{ label: '37' }, { label: '38' }, { label: '48' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm8-skip-5s',
    probeType: 'numeral',
    ageBand: [8, 9],
    nodeId: 'skip-counting',
    stem: {
      text: '5, 10, 15, ?',
      spoken: 'Counting by fives. What comes next?',
    },
    choices: [{ label: '16' }, { label: '20' }, { label: '25' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'm8-mult-2-3',
    probeType: 'numeral',
    ageBand: [8, 9],
    nodeId: 'mult-2-5-10',
    stem: { text: '2 × 3', spoken: 'Two times three?' },
    choices: [{ label: '5' }, { label: '6' }, { label: '8' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  // ======================================================== Age 8 — Literacy
  {
    id: 'l8-digraph-ship',
    probeType: 'cvc-image',
    ageBand: [8, 9],
    nodeId: 'digraphs',
    stem: { text: '', spoken: 'Find the ship.' },
    choices: [
      { label: 'ship', imageSrc: '/assets/diagnostic/cvc/ship.svg' },
      { label: 'chip', imageSrc: '/assets/diagnostic/cvc/chip.svg' },
      { label: 'sip', imageSrc: '/assets/diagnostic/cvc/sip.svg' },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l8-sight-because',
    probeType: 'cvc-image',
    ageBand: [8, 10],
    nodeId: 'sight-words',
    stem: { text: '', spoken: 'Find the word "because".' },
    choices: [
      { label: 'because', imageSrc: '/assets/diagnostic/sight/because.svg' },
      { label: 'before', imageSrc: '/assets/diagnostic/sight/before.svg' },
      { label: 'become', imageSrc: '/assets/diagnostic/sight/become.svg' },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l8-sentence-cat-mat',
    probeType: 'cvc-image',
    ageBand: [8, 10],
    nodeId: 'simple-sentences',
    stem: { text: '', spoken: 'Find the sentence that fits the picture.' },
    choices: [
      {
        label: 'The cat sat on the mat.',
        imageSrc: '/assets/diagnostic/sentence/cat-mat.svg',
      },
      {
        label: 'The cat sat on the bat.',
        imageSrc: '/assets/diagnostic/sentence/cat-bat.svg',
      },
      {
        label: 'The cat ran on the mat.',
        imageSrc: '/assets/diagnostic/sentence/cat-ran-mat.svg',
      },
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
  // ============================================================ Age 9 — Math
  {
    id: 'm9-mult-5-6',
    probeType: 'numeral',
    ageBand: [9, 10],
    nodeId: 'mult-2-5-10',
    stem: { text: '5 × 6', spoken: 'Five times six?' },
    choices: [{ label: '25' }, { label: '30' }, { label: '35' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm9-mult-3-7',
    probeType: 'numeral',
    ageBand: [9, 10],
    nodeId: 'mult-3-4',
    stem: { text: '3 × 7', spoken: 'Three times seven?' },
    choices: [{ label: '18' }, { label: '21' }, { label: '24' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'm9-twodig-47-29',
    probeType: 'numeral',
    ageBand: [9, 10],
    nodeId: 'two-digit-addsub',
    stem: { text: '47 − 29', spoken: 'Forty-seven take away twenty-nine?' },
    choices: [{ label: '17' }, { label: '18' }, { label: '22' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  // ======================================================== Age 9 — Literacy
  {
    id: 'l9-sentence-1',
    probeType: 'cvc-image',
    ageBand: [9, 10],
    nodeId: 'simple-sentences',
    stem: { text: '', spoken: 'Find the sentence that fits the picture.' },
    choices: [
      {
        label: 'The dog ran to the park.',
        imageSrc: '/assets/diagnostic/sentence/dog-ran-park.svg',
      },
      {
        label: 'The dog sat in the park.',
        imageSrc: '/assets/diagnostic/sentence/dog-sat-park.svg',
      },
      {
        label: 'The cat ran to the park.',
        imageSrc: '/assets/diagnostic/sentence/cat-ran-park.svg',
      },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l9-sight-they',
    probeType: 'cvc-image',
    ageBand: [9, 10],
    nodeId: 'sight-words',
    stem: { text: '', spoken: 'Find the word "they".' },
    choices: [
      { label: 'they', imageSrc: '/assets/diagnostic/sight/they.svg' },
      { label: 'then', imageSrc: '/assets/diagnostic/sight/then.svg' },
      { label: 'them', imageSrc: '/assets/diagnostic/sight/them.svg' },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l9-digraph-thumb',
    probeType: 'cvc-image',
    ageBand: [9, 10],
    nodeId: 'digraphs',
    stem: { text: '', spoken: 'Find the thumb.' },
    choices: [
      { label: 'thumb', imageSrc: '/assets/diagnostic/cvc/thumb.svg' },
      { label: 'thump', imageSrc: '/assets/diagnostic/cvc/thump.svg' },
      { label: 'tomb', imageSrc: '/assets/diagnostic/cvc/tomb.svg' },
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
  // =========================================================== Age 10 — Math
  {
    id: 'm10-mult-7-8',
    probeType: 'numeral',
    ageBand: [10, 10],
    nodeId: 'mult-6-9',
    stem: { text: '7 × 8', spoken: 'Seven times eight?' },
    choices: [{ label: '54' }, { label: '56' }, { label: '64' }],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'm10-mult-9-6',
    probeType: 'numeral',
    ageBand: [10, 10],
    nodeId: 'mult-6-9',
    stem: { text: '9 × 6', spoken: 'Nine times six?' },
    choices: [{ label: '48' }, { label: '54' }, { label: '63' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'm10-mult-4-9',
    probeType: 'numeral',
    ageBand: [10, 10],
    nodeId: 'mult-3-4',
    stem: { text: '4 × 9', spoken: 'Four times nine?' },
    choices: [{ label: '32' }, { label: '36' }, { label: '40' }],
    correctIndex: 1,
    difficulty: 'medium',
  },
  // ======================================================= Age 10 — Literacy
  {
    id: 'l10-sentence-1',
    probeType: 'cvc-image',
    ageBand: [10, 10],
    nodeId: 'simple-sentences',
    stem: { text: '', spoken: 'Find the sentence that fits the picture.' },
    choices: [
      {
        label: 'The hiker climbed the steep hill before lunch.',
        imageSrc: '/assets/diagnostic/sentence/hiker-climb.svg',
      },
      {
        label: 'The hiker walked the flat path after lunch.',
        imageSrc: '/assets/diagnostic/sentence/hiker-walk.svg',
      },
      {
        label: 'The runner climbed the steep hill before lunch.',
        imageSrc: '/assets/diagnostic/sentence/runner-climb.svg',
      },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l10-sight-friend',
    probeType: 'cvc-image',
    ageBand: [10, 10],
    nodeId: 'sight-words',
    stem: { text: '', spoken: 'Find the word "friend".' },
    choices: [
      { label: 'friend', imageSrc: '/assets/diagnostic/sight/friend.svg' },
      { label: 'fierce', imageSrc: '/assets/diagnostic/sight/fierce.svg' },
      { label: 'fried', imageSrc: '/assets/diagnostic/sight/fried.svg' },
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'l10-digraph-thrill',
    probeType: 'cvc-image',
    ageBand: [10, 10],
    nodeId: 'digraphs',
    stem: { text: '', spoken: 'Find the thrill.' },
    choices: [
      { label: 'thrill', imageSrc: '/assets/diagnostic/cvc/thrill.svg' },
      { label: 'trill', imageSrc: '/assets/diagnostic/cvc/trill.svg' },
      { label: 'shrill', imageSrc: '/assets/diagnostic/cvc/shrill.svg' },
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
] as const
