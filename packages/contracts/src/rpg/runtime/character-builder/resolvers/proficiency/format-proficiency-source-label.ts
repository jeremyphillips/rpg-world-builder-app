import type { CharacterBuildCatalogIndex } from '../../context'
import {
  formatSelectionSourceLabel,
  type FormatSelectionSourceLabelOptions,
  type SelectionSourceRowKind,
} from '../../../character/format-selection-source-label'
import type { CharacterSelectionSource } from '../../../character/selection-sources'

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

/** ChoiceSet selection provenance for proficiency step selected rows. */
export function formatProficiencyChoiceSourceLabel(choiceSetLabel: string): string {
  return `Chosen from ${choiceSetLabel}`
}
