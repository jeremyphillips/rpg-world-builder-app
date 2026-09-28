import { defineMessage } from '../../validation/define-message'

/** XP progression validation messages (tier 2 domain catalog). */
export const xpProgressionValidationMessages = {
  /** Entry rows must run 1, 2, 3, … — `expected` is the level the row should hold. */
  contiguousLevels: defineMessage<{ expected: number }>(
    'validation.xpProgression.contiguousLevels',
    ({ expected }) => `Levels must be contiguous from level 1; expected level ${expected}.`,
  ),
  levelOneZeroXp: defineMessage(
    'validation.xpProgression.levelOneZeroXp',
    () => 'Level 1 must require 0 XP.',
  ),
  increasingXp: defineMessage(
    'validation.xpProgression.increasingXp',
    () => 'XP required must increase with each level.',
  ),
}
