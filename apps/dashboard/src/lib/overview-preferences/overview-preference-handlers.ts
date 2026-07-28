import { areColumnChangeStatesEqual, type ColumnChangeState } from '@rpg/ui'

import type { OverviewPreferencesBase } from './create-overview-preferences'

export function applyOverviewColumnChangePreferences<T extends OverviewPreferencesBase<number>>(
  current: T,
  state: ColumnChangeState,
): { next: T; changed: boolean } {
  const next = {
    ...current,
    columnVisibility: state.visibility,
    columnOrder: state.order,
  }

  if (
    areColumnChangeStatesEqual(
      {
        visibility: current.columnVisibility ?? {},
        order: current.columnOrder ?? [],
      },
      state,
    )
  ) {
    return { next: current, changed: false }
  }

  return { next, changed: true }
}

export function applyOverviewAdvancedOpenPreferences<T extends OverviewPreferencesBase<number>>(
  current: T,
  open: boolean,
): { next: T; changed: boolean } {
  if (current.advancedOpen === open) {
    return { next: current, changed: false }
  }

  return { next: { ...current, advancedOpen: open }, changed: true }
}
