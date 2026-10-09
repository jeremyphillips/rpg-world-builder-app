import type {
  SelectionRowPresentation,
  SelectionSignalCategory,
} from './selection-row-status.types'

/**
 * Closed set of row contexts. Each surface maps to exactly one; add a context here
 * (and a policy row below) instead of filtering entries in a component.
 */
export const SELECTION_ROW_CONTEXTS = [
  'picker',
  'owned',
  'review',
  'edit_choice',
  'reconciliation',
] as const
export type SelectionRowContext = (typeof SELECTION_ROW_CONTEXTS)[number]

export type SelectionRowContextPolicy = { visible: readonly SelectionSignalCategory[] }

export const SELECTION_ROW_CONTEXT_POLICIES = {
  picker: {
    visible: [
      'availability',
      'affordability',
      'compatibility',
      'capacity',
      'requirement_open',
      'recommendation',
      'source',
    ],
  },
  owned: { visible: ['compatibility'] },
  review: { visible: ['compatibility'] },
  edit_choice: {
    visible: [
      'availability',
      'compatibility',
      'requirement_open',
      'requirement_held',
      'recommendation',
      'recommendation_held',
    ],
  },
  /** Facts come from the target draft without the trimmable purchases; "held" means covered elsewhere. */
  reconciliation: { visible: ['compatibility', 'requirement_open', 'recommendation'] },
} as const satisfies Record<SelectionRowContext, SelectionRowContextPolicy>

/** Internal — not exported from the barrel. Render through `resolveSelectionRowStatusItems`. */
export function applySelectionRowPolicy(
  presentation: SelectionRowPresentation,
  policy: SelectionRowContextPolicy,
): SelectionRowPresentation {
  const visible = new Set<SelectionSignalCategory>(policy.visible)
  return {
    status: presentation.status.filter((entry) => visible.has(entry.category)),
    guidance: presentation.guidance.filter((entry) => visible.has(entry.category)),
  }
}
