import { getSlotProgressionKindLabel } from '../../../vocab/spell/slot-progression-kind'

import type { SpellcastingProgressionSeed } from './patch'
import { indexSpellcastingProgressionRecords } from './patch'

/** Minimal slot seed for contract/runtime tests (fixture class slugs). */
export const spellcastingProgressionTestSeed: SpellcastingProgressionSeed = {
  slotProgressions: [
    {
      id: 'full-caster',
      label: getSlotProgressionKindLabel('full-caster'),
      kind: 'leveled',
      extension: 'carryForward',
      rows: [
        { level: 1, slots: [2] },
        { level: 2, slots: [3] },
        { level: 3, slots: [4, 2] },
        { level: 5, slots: [4, 3, 2] },
      ],
    },
    {
      id: 'half-caster',
      label: getSlotProgressionKindLabel('half-caster'),
      kind: 'leveled',
      extension: 'carryForward',
      rows: [
        { level: 1, slots: [2] },
        { level: 5, slots: [4, 2] },
      ],
    },
    {
      id: 'pact-magic',
      label: getSlotProgressionKindLabel('pact-magic'),
      kind: 'pact',
      extension: 'carryForward',
      rows: [
        { level: 1, slotCount: 1, slotLevel: 1 },
        { level: 2, slotCount: 2, slotLevel: 1 },
      ],
    },
  ],
}

export const spellcastingProgressionTestConfig = indexSpellcastingProgressionRecords(
  spellcastingProgressionTestSeed,
)
