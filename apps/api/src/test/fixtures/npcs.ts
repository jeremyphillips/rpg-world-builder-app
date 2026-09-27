import type { CreateNpcRequestInput } from '@rpg/contracts'

import { minimalStandalonePcInput } from './characters'

const { characterType: _characterType, ...npcFields } = minimalStandalonePcInput

/** Minimal level-1 NPC request body for campaign NPC API integration tests. */
export const minimalNpcRequestInput = {
  ...npcFields,
  name: 'Goblin Scout',
} satisfies CreateNpcRequestInput

/** Wizard NPC with spell access object — regression for empty access persistence. */
export const wizardSpellcasterNpcRequestInput = {
  ...minimalNpcRequestInput,
  name: 'Arcane Apprentice',
  classes: [{ classId: 'srd-cc-5.2.1:wizard', level: 1 }],
  hitPoints: { base: 6, current: 6, temporary: 0 },
  spells: [
    {
      spellId: 'srd-cc-5.2.1:fire-bolt',
      sources: [{ kind: 'manual' as const }],
      access: {},
    },
  ],
} satisfies CreateNpcRequestInput
