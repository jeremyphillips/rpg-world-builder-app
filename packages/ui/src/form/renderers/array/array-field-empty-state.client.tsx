'use client'

import { arrayEmptyStatePrimaryMessage } from './array-field-empty-state.lib'
import { arrayFieldEmptyStatePanelVariants } from './array-field-empty-state.variants'

export interface ArrayFieldEmptyStateProps {
  itemLabel: string
}

export function ArrayFieldEmptyState({ itemLabel }: ArrayFieldEmptyStateProps) {
  return (
    <div role="status" className={arrayFieldEmptyStatePanelVariants()}>
      {arrayEmptyStatePrimaryMessage(itemLabel)}
    </div>
  )
}
