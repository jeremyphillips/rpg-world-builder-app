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

function catalogEntries<T extends { id: string; name: string }>(
  map: ReadonlyMap<string, T>,
): readonly T[] {
  return [...map.values()]
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
    return `Level ${level} · ${PREVIEW_CHOOSE_CLASS}`
  }

  const className = resolveCatalogEntryName(
    catalogEntries(catalogIndex.classes),
    draft.class.classId,
  )
  return `Level ${level} ${className}`
}

export function getPreviewSpeciesLine(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  if (!draft.species.speciesId) {
    return PREVIEW_CHOOSE_SPECIES
  }

  return resolveCatalogEntryName(catalogEntries(catalogIndex.species), draft.species.speciesId)
}

export function getPreviewAlignmentLine(draft: CharacterBuilderDraft): string {
  const alignment = draft.identity.alignment
  return alignment ? getAlignmentLabel(alignment) : PREVIEW_CHOOSE_ALIGNMENT
}
