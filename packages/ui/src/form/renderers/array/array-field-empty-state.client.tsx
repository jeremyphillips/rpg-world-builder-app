'use client'

import { EmptyPanel } from '../../../components/ui/empty-panel.client'
import { arrayEmptyStatePrimaryMessage } from './array-field-empty-state.lib'

export interface ArrayFieldEmptyStateProps {
  itemLabel: string
}

export function ArrayFieldEmptyState({ itemLabel }: ArrayFieldEmptyStateProps) {
  return <EmptyPanel>{arrayEmptyStatePrimaryMessage(itemLabel)}</EmptyPanel>
}
