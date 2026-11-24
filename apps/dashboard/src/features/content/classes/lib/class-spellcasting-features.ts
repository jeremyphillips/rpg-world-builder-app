import {
  spellcastingGrantingFeatureDefaultName,
  spellcastingGrantingFeatureId,
  type ClassBodyFeature,
  type SlotProgression,
} from '@rpg/contracts'

export function createSpellcastingFeature(input: {
  level?: number
  slotProgressionId?: string
  slotProgression?: Pick<SlotProgression, 'kind'>
  name?: string
  intro?: string
}): ClassBodyFeature {
  const level = input.level ?? 1
  const pactProgression = {
    slotProgression: input.slotProgression,
    slotProgressionId: input.slotProgressionId,
  }
  return {
    kind: 'spellcasting',
    id: spellcastingGrantingFeatureId(pactProgression),
    name: input.name ?? spellcastingGrantingFeatureDefaultName(pactProgression),
    level,
    ...(input.intro ? { intro: input.intro } : {}),
  }
}
