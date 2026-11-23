import {
  spellcastingFeatureLabelForSlotProgression,
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
  const usesPactMagic =
    input.slotProgression?.kind === 'pact' || input.slotProgressionId === 'pact-magic'

  const defaultName =
    input.name ??
    (input.slotProgression
      ? spellcastingFeatureLabelForSlotProgression(input.slotProgression as SlotProgression)
      : usesPactMagic
        ? 'Pact Magic'
        : 'Spellcasting')

  return {
    kind: 'spellcasting',
    id: usesPactMagic ? 'pact-magic' : 'spellcasting',
    name: defaultName,
    level,
    ...(input.intro ? { intro: input.intro } : {}),
  }
}

export function usesPactMagicFromSlotProgression(slotProgressionId: string | undefined): boolean {
  return slotProgressionId === 'pact-magic'
}
