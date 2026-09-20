import type { CharacterBuildCatalogIndex } from '../../context'
import {
  formatCompactSelectionSourceLabel,
  formatSelectionSourceLabel,
  type FormatSelectionSourceLabelOptions,
  type SelectionSourceRowKind,
} from '../../../character/format-selection-source-label'
import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'

export type ProficiencySourceRowKind = SelectionSourceRowKind

export type FormatProficiencySourceLabelOptions = Pick<FormatSelectionSourceLabelOptions, 'rowKind'>

/** Proficiency step provenance labels — delegates to {@link formatSelectionSourceLabel}. */
export function formatProficiencySourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
  options: FormatProficiencySourceLabelOptions = {},
): string {
  return formatSelectionSourceLabel(sources, catalogIndex, options)
}

/** Compact provenance labels for granted proficiency summary rows. */
export function formatCompactProficiencySourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return formatCompactSelectionSourceLabel(sources, catalogIndex)
}
