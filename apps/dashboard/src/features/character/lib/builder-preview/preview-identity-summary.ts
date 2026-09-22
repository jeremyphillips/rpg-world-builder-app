import {
  getAlignmentLabel,
  formatCharacterSummary,
  resolveBuilderCharacterSummaryParts,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import { PREVIEW_RAIL_EMPTY_TEXT } from '@rpg/ui'

import {
  formatCharacterSummaryFromCatalog,
  resolveDashboardCharacterSummaryParts,
} from '../display/character-summary.lib'
import { resolveCatalogEntryName } from './review-step-display'

export const PREVIEW_UNNAMED_CHARACTER = 'Unnamed character'
export const PREVIEW_LEVEL_CLASS_SEPARATOR = ' · '

function catalogEntries<T extends { id: string; name: string }>(
  map: ReadonlyMap<string, T>,
): readonly T[] {
  return [...map.values()]
}

function createBuilderSummaryLabelLookup(
  catalogIndex: CharacterBuildCatalogIndex,
): Parameters<typeof resolveBuilderCharacterSummaryParts>[1] {
  return {
    speciesName: (speciesId) =>
      resolveCatalogEntryName(catalogEntries(catalogIndex.species), speciesId),
    heritageName: (speciesId, heritageId) => {
      const species = catalogIndex.species.get(speciesId)
      const heritageOption = species?.heritage?.options.find((option) => option.id === heritageId)

      if (!heritageOption) return heritageId
      if (heritageOption.kind === 'custom') return heritageOption.name
      return heritageOption.nameOverride ?? heritageId
    },
    className: (classId) => resolveCatalogEntryName(catalogEntries(catalogIndex.classes), classId),
    subclassName: (subclassId) => subclassId,
  }
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
    return `Level ${level}${PREVIEW_LEVEL_CLASS_SEPARATOR}${PREVIEW_RAIL_EMPTY_TEXT}`
  }

  const parts = resolveBuilderCharacterSummaryParts(
    draft,
    createBuilderSummaryLabelLookup(catalogIndex),
  )

  return formatCharacterSummary({ classes: parts.classes })
}

export function getPreviewSpeciesLine(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  if (!draft.species.speciesId) {
    return PREVIEW_RAIL_EMPTY_TEXT
  }

  const parts = resolveBuilderCharacterSummaryParts(
    draft,
    createBuilderSummaryLabelLookup(catalogIndex),
  )

  if (!parts.species) {
    return PREVIEW_RAIL_EMPTY_TEXT
  }

  return formatCharacterSummary({ species: parts.species, classes: [] })
}

export function getPreviewAlignmentLine(draft: CharacterBuilderDraft): string {
  const alignment = draft.identity.alignment
  return alignment ? getAlignmentLabel(alignment) : PREVIEW_RAIL_EMPTY_TEXT
}

/** Canonical roster/card summary for a partial builder draft (species + class/level). */
export function formatBuilderDraftCharacterSummary(
  draft: Pick<CharacterBuilderDraft, 'species' | 'class'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return formatCharacterSummary(
    resolveBuilderCharacterSummaryParts(draft, createBuilderSummaryLabelLookup(catalogIndex)),
  )
}

/** @internal Exported for adapter parity tests. */
export function resolveBuilderPreviewSummaryParts(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
) {
  return resolveBuilderCharacterSummaryParts(draft, createBuilderSummaryLabelLookup(catalogIndex))
}

/** @internal Exported for adapter parity tests. */
export { resolveDashboardCharacterSummaryParts, formatCharacterSummaryFromCatalog }
