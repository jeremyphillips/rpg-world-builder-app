import type { Character, CharacterBuildCatalogIndex, ContentDisplayImage } from '@rpg/contracts'
import {
  formatCharacterSummary,
  resolveCharacterSummaryParts,
  resolveTraitDisplay,
  type CharacterSummaryLabelLookup,
} from '@rpg/contracts'

import { formatContentReferenceLabel } from './format-content-reference-label'
import { resolveCharacterPrimaryDisplayImage } from './resolve-character-display-image'
import type { CharacterCardViewModel } from './character-display-types'

function createDashboardSummaryLabelLookup(
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterSummaryLabelLookup {
  return {
    speciesName: (speciesId) =>
      catalogIndex.species.get(speciesId)?.name ?? formatContentReferenceLabel(speciesId),
    heritageName: (speciesId, heritageId) => {
      const species = catalogIndex.species.get(speciesId)
      const heritageOption = species?.heritage?.options.find((option) => option.id === heritageId)
      return heritageOption
        ? resolveTraitDisplay(heritageOption).name
        : formatContentReferenceLabel(heritageId)
    },
    className: (classId) =>
      catalogIndex.classes.get(classId)?.name ?? formatContentReferenceLabel(classId),
    subclassName: (subclassId) => formatContentReferenceLabel(subclassId),
  }
}

export function resolveDashboardCharacterSummaryParts(
  character: Pick<Character, 'classes' | 'species'>,
  catalogIndex: CharacterBuildCatalogIndex,
) {
  return resolveCharacterSummaryParts(character, createDashboardSummaryLabelLookup(catalogIndex))
}

export function formatCharacterSummaryFromCatalog(
  character: Pick<Character, 'classes' | 'species'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return formatCharacterSummary(resolveDashboardCharacterSummaryParts(character, catalogIndex))
}

/** Card view model for roster and campaign list surfaces — PCs and NPC list rows share this base. */
export function buildCharacterCardViewModel(
  character: Pick<Character, 'id' | 'name' | 'classes' | 'species' | 'media'> & {
    displayImage?: ContentDisplayImage
    campaign?: { id: string; name: string; emblemUrl?: string }
  },
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterCardViewModel {
  const displayImage = character.displayImage ?? resolveCharacterPrimaryDisplayImage(character)

  return {
    id: character.id,
    name: character.name,
    summary: formatCharacterSummaryFromCatalog(character, catalogIndex),
    ...(displayImage ? { displayImage } : {}),
    ...(character.campaign ? { campaign: character.campaign } : {}),
  }
}
