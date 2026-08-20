import type {
  CampaignCharacterListItem,
  CampaignNpcListItem,
  CharacterBuildCatalogIndex,
} from '@rpg/contracts'

import {
  buildCharacterCardViewModel,
  buildCharacterEntitySummaryVmFromTransport,
  buildCharacterEntitySummarySearchText,
} from '@/features/character'

export type LocationConnectedPartyCharacterOption = {
  id: string
  name: string
  summary: string
  characterType: 'pc' | 'npc'
  classIds: readonly string[]
  speciesId?: string
}

/** Merges open campaign PCs and NPCs into a sorted lookup for connected-party rows. */
export function buildLocationConnectedPartyCharactersById(
  campaignCharacters: readonly Pick<CampaignCharacterListItem, 'character'>[],
  npcs: readonly Pick<CampaignNpcListItem, 'character'>[],
  catalogIndex: CharacterBuildCatalogIndex | null | undefined,
): Map<string, LocationConnectedPartyCharacterOption> {
  const entries: LocationConnectedPartyCharacterOption[] = [
    ...campaignCharacters.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: character.summary,
      characterType: 'pc' as const,
      classIds: character.classIds ?? [],
      ...(character.speciesId !== undefined ? { speciesId: character.speciesId } : {}),
    })),
    ...npcs.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: catalogIndex ? buildCharacterCardViewModel(character, catalogIndex).summary : '',
      characterType: 'npc' as const,
      classIds: character.classes.map((entry) => entry.classId),
      speciesId: character.species.id,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name))

  return new Map(entries.map((entry) => [entry.id, entry]))
}

export function buildConnectedPartyCharacterEntitySummary(
  option: LocationConnectedPartyCharacterOption,
) {
  return buildCharacterEntitySummaryVmFromTransport({
    id: option.id,
    name: option.name,
    summary: option.summary,
    characterType: option.characterType,
  })
}

export function buildConnectedPartyCharacterPickerSearchText(
  option: LocationConnectedPartyCharacterOption,
): string {
  return buildCharacterEntitySummarySearchText(buildConnectedPartyCharacterEntitySummary(option))
}
