import {
  formatCompactSelectionSourceLabel,
  formatGrantCardSelectionSourceLabel,
  formatSelectionSourceLabel,
  type FormatSelectionSourceLabelOptions,
  type SelectionSourceLabelCatalogIndex,
  type SelectionSourceRowKind,
} from '../../../character/format-selection-source-label'
import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'

export type ProficiencySourceRowKind = SelectionSourceRowKind

export type FormatProficiencySourceLabelOptions = Pick<FormatSelectionSourceLabelOptions, 'rowKind'>

/** Proficiency step provenance labels — delegates to {@link formatSelectionSourceLabel}. */
export function formatProficiencySourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
  options: FormatProficiencySourceLabelOptions = {},
): string {
  return formatSelectionSourceLabel(sources, catalogIndex, options)
}

/** Compact provenance labels for granted proficiency summary rows. */
export function formatCompactProficiencySourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  return formatCompactSelectionSourceLabel(sources, catalogIndex)
}

/** Grant-card provenance labels for fixed proficiency grant rows in section bodies. */
export function formatGrantCardProficiencySourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  return formatGrantCardSelectionSourceLabel(sources, catalogIndex)
}
