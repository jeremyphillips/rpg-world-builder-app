'use client'

import { EmptyPanel } from '../../../components/ui/empty-panel.client'
import { arrayEmptyStatePrimaryMessage } from './array-field-empty-state.lib'

export interface ArrayFieldEmptyStateProps {
  itemLabel: string
  /** When set, replaces derived primary empty-state copy. */
  primaryMessage?: string
}

export function ArrayFieldEmptyState({ itemLabel, primaryMessage }: ArrayFieldEmptyStateProps) {
  return <EmptyPanel>{primaryMessage ?? arrayEmptyStatePrimaryMessage(itemLabel)}</EmptyPanel>
}
