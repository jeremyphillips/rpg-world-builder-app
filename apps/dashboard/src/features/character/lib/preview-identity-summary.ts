import {
  getAlignmentLabel,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import { resolveCatalogEntryName } from './review-step-display'

export const PREVIEW_UNNAMED_CHARACTER = 'Unnamed character'
export const PREVIEW_CHOOSE_CLASS = 'Choose class'
export const PREVIEW_CHOOSE_SPECIES = 'Choose species'
export const PREVIEW_CHOOSE_ALIGNMENT = 'Choose alignment'
export const PREVIEW_LEVEL_CLASS_SEPARATOR = ' · '

function catalogEntries<T extends { id: string; name: string }>(
  map: ReadonlyMap<string, T>,
): readonly T[] {
  return [...map.values()]
}

function resolveHeritagePreviewLabel(
  speciesId: string,
  heritageId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const species = catalogIndex.species.get(speciesId)
  const heritageOption = species?.heritage?.options.find((option) => option.id === heritageId)

  if (!heritageOption) return heritageId
  if (heritageOption.kind === 'custom') return heritageOption.name
  return heritageOption.nameOverride ?? heritageId
}

export function getPreviewIdentityName(draft: CharacterBuilderDraft): string {
  const name = draft.identity.name?.trim()
  return name || PREVIEW_UNNAMED_CHARACTER
}

export function getPreviewLevelClassLine(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const level = draft.class.level

  if (!draft.class.classId) {
    return `Level ${level}${PREVIEW_LEVEL_CLASS_SEPARATOR}${PREVIEW_CHOOSE_CLASS}`
  }

  const className = resolveCatalogEntryName(
    catalogEntries(catalogIndex.classes),
    draft.class.classId,
  )
  return `Level ${level}${PREVIEW_LEVEL_CLASS_SEPARATOR}${className}`
}

export function getPreviewSpeciesLine(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  if (!draft.species.speciesId) {
    return PREVIEW_CHOOSE_SPECIES
  }

  const speciesName = resolveCatalogEntryName(
    catalogEntries(catalogIndex.species),
    draft.species.speciesId,
  )

  if (!draft.species.heritageId) {
    return speciesName
  }

  const heritageLabel = resolveHeritagePreviewLabel(
    draft.species.speciesId,
    draft.species.heritageId,
    catalogIndex,
  )
  return `${speciesName}${PREVIEW_LEVEL_CLASS_SEPARATOR}${heritageLabel}`
}

export function getPreviewAlignmentLine(draft: CharacterBuilderDraft): string {
  const alignment = draft.identity.alignment
  return alignment ? getAlignmentLabel(alignment) : PREVIEW_CHOOSE_ALIGNMENT
}
