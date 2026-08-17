import type {
  CampaignContentEligibilityEntry,
  CampaignContentEligibilityIndex,
  Character,
  CharacterCardSummaryDto,
  CharacterSummaryLabelLookup,
} from '@rpg/contracts'
import { formatCharacterSummary, resolveCharacterSummaryParts } from '@rpg/contracts'

function isContentIndex(
  contentIndex:
    | CampaignContentEligibilityIndex
    | ReadonlyMap<string, CampaignContentEligibilityEntry>,
): contentIndex is CampaignContentEligibilityIndex {
  return 'contentById' in contentIndex
}

export function createCharacterSummaryLabelLookup(
  contentIndex:
    | CampaignContentEligibilityIndex
    | ReadonlyMap<string, CampaignContentEligibilityEntry>,
): CharacterSummaryLabelLookup {
  const contentById = isContentIndex(contentIndex) ? contentIndex.contentById : contentIndex
  const heritageBySpeciesId = isContentIndex(contentIndex)
    ? contentIndex.heritageBySpeciesId
    : undefined

  return {
    speciesName: (speciesId) => contentById.get(speciesId)?.label ?? speciesId,
    heritageName: heritageBySpeciesId
      ? (speciesId, heritageId) =>
          heritageBySpeciesId.get(speciesId)?.get(heritageId)?.label ?? heritageId
      : undefined,
    className: (classId) => contentById.get(classId)?.label ?? classId,
    subclassName: (subclassId) => contentById.get(subclassId)?.label ?? subclassId,
  }
}

export function buildCharacterCardSummaryDto(input: {
  character: Pick<Character, 'id' | 'name' | 'classes' | 'species'>
  contentIndex:
    | CampaignContentEligibilityIndex
    | ReadonlyMap<string, CampaignContentEligibilityEntry>
}): CharacterCardSummaryDto {
  const lookup = createCharacterSummaryLabelLookup(input.contentIndex)
  const parts = resolveCharacterSummaryParts(input.character, lookup)

  return {
    id: input.character.id,
    name: input.character.name,
    summary: formatCharacterSummary(parts),
    classIds: input.character.classes.map((entry) => entry.classId),
    speciesId: input.character.species.id,
  }
}
