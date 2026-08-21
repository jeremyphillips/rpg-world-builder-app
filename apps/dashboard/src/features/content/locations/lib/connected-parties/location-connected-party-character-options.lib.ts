import type {
  CampaignCharacterListItem,
  CampaignNpcListItem,
  CharacterBuildCatalogIndex,
} from '@rpg/contracts'

import { buildCharacterCardViewModel, type CharacterPickerOption } from '@/features/character'

export type { CharacterPickerOption }

/** Connected-party slotting alias — same transport shape as generic character picker options. */
export type LocationConnectedPartyCharacterOption = CharacterPickerOption

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

export {
  buildCharacterPickerOptionEntitySummary as buildConnectedPartyCharacterEntitySummary,
  buildCharacterPickerOptionSearchText as buildConnectedPartyCharacterPickerSearchText,
} from '@/features/character'
