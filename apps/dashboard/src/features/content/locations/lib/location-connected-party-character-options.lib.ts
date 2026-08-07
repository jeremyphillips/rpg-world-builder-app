import type {
  CampaignCharacterListItem,
  CampaignNpcListItem,
  CharacterBuildCatalogIndex,
} from '@rpg/contracts'

import { buildCharacterCardViewModel } from '@/features/character'

export type LocationConnectedPartyCharacterOption = {
  id: string
  name: string
  summary: string
  characterType: 'pc' | 'npc'
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
    })),
    ...npcs.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: catalogIndex ? buildCharacterCardViewModel(character, catalogIndex).summary : '',
      characterType: 'npc' as const,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name))

  return new Map(entries.map((entry) => [entry.id, entry]))
}
