import type { CreateNpcRequestInput } from '@rpg/contracts'

import { minimalStandalonePcInput } from './characters'

const { characterType: _characterType, ...npcFields } = minimalStandalonePcInput

/** Minimal level-1 NPC request body for campaign NPC API integration tests. */
export const minimalNpcRequestInput = {
  ...npcFields,
  name: 'Goblin Scout',
} satisfies CreateNpcRequestInput
