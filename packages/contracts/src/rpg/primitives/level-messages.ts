import { defineMessage } from '../../validation/define-message'

// ---------------------------------------------------------------------------
// Level / level-range-table validation messages (tier 2 domain catalog).
// Consumed by `refineLevelRangeTable` and campaign patch schemas; the copy is
// part of the contract — tests assert through these definitions, not literals.
// ---------------------------------------------------------------------------

export const levelValidationMessages = {
  /** Row min level exceeds its max level. */
  invertedRange: defineMessage(
    'validation.level.invertedRange',
    () => 'Max level must be at least the min level.',
  ),
  /** Row min falls inside the previous row's range. `otherLabel` is the other tier's range label. */
  rangeOverlap: defineMessage<{ otherLabel: string }>(
    'validation.level.rangeOverlap',
    ({ otherLabel }) => `This range overlaps with ${otherLabel}.`,
  ),
  /** Contiguity break — `level` is the first level no tier covers. */
  rangeGap: defineMessage<{ level: number }>(
    'validation.level.rangeGap',
    ({ level }) => `Level ${level} is not covered by any tier.`,
  ),
  /** First row must start at `expected`. */
  rangeStartAt: defineMessage<{ expected: number }>(
    'validation.level.rangeStartAt',
    ({ expected }) => `Tiers must start at level ${expected}.`,
  ),
  /** Last row must cover through `expected`. */
  rangeEndAt: defineMessage<{ expected: number }>(
    'validation.level.rangeEndAt',
    ({ expected }) => `Tiers must cover levels 1–${expected}.`,
  ),
  /** A level lies outside the campaign's 1–max bound. */
  outOfBounds: defineMessage<{ maxLevel: number }>(
    'validation.level.outOfBounds',
    ({ maxLevel }) => `Level must be between 1 and ${maxLevel}.`,
  ),
}
