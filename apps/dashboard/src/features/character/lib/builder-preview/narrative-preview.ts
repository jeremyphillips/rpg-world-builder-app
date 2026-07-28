import type { CharacterNarrative } from '@rpg/contracts'

export type NarrativePreviewStatus = 'empty' | 'partial' | 'complete'

const NARRATIVE_SLOT_COUNT = 5

function hasTraitContent(traits: string[] | undefined): boolean {
  return traits?.some((trait) => trait.trim().length > 0) ?? false
}

function hasStringContent(value: string | undefined): boolean {
  return (value?.trim().length ?? 0) > 0
}

export function narrativeFieldCount(narrative: CharacterNarrative | undefined): number {
  if (!narrative) return 0

  let count = 0
  if (hasTraitContent(narrative.personalityTraits)) count++
  if (hasTraitContent(narrative.ideals)) count++
  if (hasTraitContent(narrative.bonds)) count++
  if (hasTraitContent(narrative.flaws)) count++
  if (hasStringContent(narrative.backstory)) count++
  return count
}

export function getNarrativePreviewStatus(
  narrative: CharacterNarrative | undefined,
): NarrativePreviewStatus {
  const count = narrativeFieldCount(narrative)
  if (count === 0) return 'empty'
  if (count === NARRATIVE_SLOT_COUNT) return 'complete'
  return 'partial'
}

export function getNarrativePreviewStatusLabel(count: number): string {
  if (count === 0) return 'Nothing added yet.'
  if (count === 1) return '1 field added.'
  return `${count} fields added.`
}
