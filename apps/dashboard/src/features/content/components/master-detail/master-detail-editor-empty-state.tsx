import { Sparkles } from 'lucide-react'
import {
  Card,
  Text,
  emptyStateWellIconLgClasses,
  emptyStateWellSupportingLgClasses,
  emptyStateWellTitleLgClasses,
} from '@rpg/ui'

import {
  masterDetailEmptySelectionHeading,
  masterDetailEmptySelectionSubhead,
} from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'

export interface MasterDetailEditorEmptyStateProps {
  itemNoun: MasterDetailItemNounTerm
}

export function MasterDetailEditorEmptyState({ itemNoun }: MasterDetailEditorEmptyStateProps) {
  return (
    <Card
      tone="subtle"
      stretch
      className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        <Sparkles aria-hidden className={emptyStateWellIconLgClasses} />
        <Text as="p" className={emptyStateWellTitleLgClasses}>
          {masterDetailEmptySelectionHeading(itemNoun)}
        </Text>
        <Text as="p" className={emptyStateWellSupportingLgClasses}>
          {masterDetailEmptySelectionSubhead(itemNoun)}
        </Text>
      </div>
    </Card>
  )
}
