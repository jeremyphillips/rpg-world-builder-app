import { defineMessage } from '../../../../validation/define-message'

import { formatSpellSlotLevelLabel } from './format'

/** Slot and choice progression validation messages (tier 2 domain catalog). */
export const spellcastingProgressionValidationMessages = {
  duplicateSlotLevel: defineMessage<{ level: number }>(
    'validation.spellcastingProgression.duplicateSlotLevel',
    ({ level }) => `Level ${level} appears more than once in the slot progression.`,
  ),
  slotCountDecreased: defineMessage<{
    level: number
    slotLevel: number
    previous: number
    next: number
  }>(
    'validation.spellcastingProgression.slotCountDecreased',
    ({ level, slotLevel, previous, next }) =>
      `Level ${level} · ${formatSpellSlotLevelLabel(slotLevel)} — slot count cannot decrease from ${previous} to ${next}.`,
  ),
  slotLevelDecreased: defineMessage<{ level: number; previous: number; next: number }>(
    'validation.spellcastingProgression.slotLevelDecreased',
    ({ level, previous, next }) =>
      `Level ${level} · pact slot level — slot level cannot decrease from ${formatSpellSlotLevelLabel(previous)} to ${formatSpellSlotLevelLabel(next)}.`,
  ),
  pactSlotCountDecreased: defineMessage<{ level: number; previous: number; next: number }>(
    'validation.spellcastingProgression.pactSlotCountDecreased',
    ({ level, previous, next }) =>
      `Level ${level} · pact slots — slot count cannot decrease from ${previous} to ${next}.`,
  ),
  slotLevelSkipped: defineMessage<{ level: number; slotLevel: number }>(
    'validation.spellcastingProgression.slotLevelSkipped',
    ({ level, slotLevel }) =>
      `Level ${level} · ${formatSpellSlotLevelLabel(slotLevel)} — spell slot levels must unlock in sequence.`,
  ),
  unknownSlotProgression: defineMessage<{ id: string }>(
    'validation.spellcastingProgression.unknownSlotProgression',
    ({ id }) => `Unknown slot progression "${id}".`,
  ),
  unknownSpellcastingProfile: defineMessage<{ id: string }>(
    'validation.spellcastingProgression.unknownSpellcastingProfile',
    ({ id }) => `Unknown spellcasting profile "${id}".`,
  ),
  gainRequiresPersistentDestination: defineMessage<{ destination: string }>(
    'validation.spellcastingProgression.gainRequiresPersistentDestination',
    ({ destination }) =>
      `Gain progressions require a persistent destination (got "${destination}").`,
  ),
}
