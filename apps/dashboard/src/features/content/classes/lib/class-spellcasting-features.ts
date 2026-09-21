import type { ClassBodyFeature } from '@rpg/contracts'

export function createSpellcastingFeature(input: {
  level?: number
  usesPactMagic: boolean
  description?: string
}): ClassBodyFeature {
  const level = input.level ?? 1

  return {
    kind: 'custom',
    id: input.usesPactMagic ? 'pact-magic' : 'spellcasting',
    name: input.usesPactMagic ? 'Pact Magic' : 'Spellcasting',
    level,
    ...(input.description ? { description: input.description } : {}),
    grantGroups: [{ grants: [{ kind: 'spellcasting' }] }],
  }
}

export function usesPactMagicFromSlotProgression(slotProgressionId: string | undefined): boolean {
  return slotProgressionId === 'pact-magic'
}
