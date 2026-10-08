import type { PickerSelectionStateLineModel } from '@/features/content'

import { resolvePickerMutationCopy, type PickerMutationFamilyId } from './picker-mutation-family'

/** Owned is a selection-state label, not a mutation-family member. */
export const PICKER_SELECTION_OWNED_LABEL = 'Owned'

export const PICKER_SELECTION_STATE_KINDS = ['selected', 'learned', 'prepared', 'owned'] as const

export type PickerSelectionStateKind = (typeof PICKER_SELECTION_STATE_KINDS)[number]

export const PICKER_SELECTION_PROVENANCE_KINDS = [
  'package',
  'purchase',
  'choice',
  'grant',
  'class',
  'species',
  'role',
  'other',
] as const

export type PickerSelectionProvenanceKind = (typeof PICKER_SELECTION_PROVENANCE_KINDS)[number]

export type PickerSelectionProvenance = {
  kind: PickerSelectionProvenanceKind
  label: string
  quantity?: number
}

export type PickerSelectionState = {
  kind: PickerSelectionStateKind
  provenance?: PickerSelectionProvenance[]
}

const FAMILY_BY_SELECTION_KIND = {
  selected: 'genericSelection',
  learned: 'learnedSpell',
  prepared: 'preparedSpell',
} as const satisfies Record<Exclude<PickerSelectionStateKind, 'owned'>, PickerMutationFamilyId>

function selectionStateLabel(kind: PickerSelectionStateKind): string {
  if (kind === 'owned') return PICKER_SELECTION_OWNED_LABEL
  return resolvePickerMutationCopy(FAMILY_BY_SELECTION_KIND[kind]).state
}

/** The only reader of family state words and the Owned label. */
export function resolvePickerSelectionStateLine(
  state: PickerSelectionState,
): PickerSelectionStateLineModel
export function resolvePickerSelectionStateLine(
  state: PickerSelectionState | null | undefined,
): PickerSelectionStateLineModel | null
export function resolvePickerSelectionStateLine(
  state: PickerSelectionState | null | undefined,
): PickerSelectionStateLineModel | null {
  if (!state) return null

  const provenance = state.provenance?.map((item) => item.label).filter((label) => label.length > 0)

  return {
    label: selectionStateLabel(state.kind),
    ...(provenance && provenance.length > 0 ? { provenance } : {}),
  }
}
