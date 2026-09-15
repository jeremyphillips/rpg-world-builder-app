'use client'

import {
  arrayEmptyStateMinRequiredMessage,
  arrayEmptyStatePrimaryMessage,
} from './array-field-empty-state.lib'
import {
  arrayFieldEmptyStatePanelVariants,
  arrayFieldEmptyStateRequiredVariants,
} from './array-field-empty-state.variants'

export interface ArrayFieldEmptyStateProps {
  itemLabel: string
  showMinRequired?: boolean
}

export function ArrayFieldEmptyState({
  itemLabel,
  showMinRequired = false,
}: ArrayFieldEmptyStateProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div role="status" className={arrayFieldEmptyStatePanelVariants()}>
        {arrayEmptyStatePrimaryMessage(itemLabel)}
      </div>
      {showMinRequired ? (
        <p className={arrayFieldEmptyStateRequiredVariants()}>
          {arrayEmptyStateMinRequiredMessage(itemLabel)}
        </p>
      ) : null}
    </div>
  )
}
