/** Domain-neutral picker row state shared across equipment and spell pickers (BENCH-095/105). */
export type PickerItemStateBase = {
  /** Catalog/API availability; always true in standalone MVP (upstream-filtered). */
  isAvailable: boolean
  /** Recommended-tab signal; spells omit recommendations in MVP. */
  isRecommended: boolean
  /** Human-readable reasons the row cannot be newly selected. */
  disabledReasons: readonly string[]
}

export const PICKER_DISABLED_REASON_SELECTION_FULL = 'Selection full'
