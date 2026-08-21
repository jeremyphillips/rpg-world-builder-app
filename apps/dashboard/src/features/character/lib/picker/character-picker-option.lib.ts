import {
  buildCharacterEntitySummarySearchText,
  buildCharacterEntitySummaryVmFromTransport,
} from '../display/character-entity-summary.lib'

/** Transport shape for a campaign character row in catalog pickers. */
export type CharacterPickerOption = {
  id: string
  name: string
  summary: string
  characterType: 'pc' | 'npc'
  classIds: readonly string[]
  speciesId?: string
}

export function buildCharacterPickerOptionEntitySummary(option: CharacterPickerOption) {
  return buildCharacterEntitySummaryVmFromTransport({
    id: option.id,
    name: option.name,
    summary: option.summary,
    characterType: option.characterType,
  })
}

export function buildCharacterPickerOptionSearchText(option: CharacterPickerOption): string {
  return buildCharacterEntitySummarySearchText(buildCharacterPickerOptionEntitySummary(option))
}
