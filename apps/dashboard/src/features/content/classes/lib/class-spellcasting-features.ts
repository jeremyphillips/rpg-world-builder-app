import {
  spellcastingGrantingFeatureDefaultName,
  spellcastingGrantingFeatureId,
  type ClassBodyFeature,
  type SlotProgression,
  usesPactMagicSlotProgression,
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
  const usesPactMagic = usesPactMagicSlotProgression(pactProgression)

  return {
    kind: 'spellcasting',
    id: spellcastingGrantingFeatureId(pactProgression),
    name: input.name ?? spellcastingGrantingFeatureDefaultName(pactProgression),
    level,
    ...(input.intro ? { intro: input.intro } : {}),
  }
}

/** @deprecated Prefer `usesPactMagicSlotProgression` from `@rpg/contracts`. */
export function usesPactMagicFromSlotProgression(slotProgressionId: string | undefined): boolean {
  return usesPactMagicSlotProgression({ slotProgressionId })
}
