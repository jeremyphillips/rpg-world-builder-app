import { Sparkles } from 'lucide-react'
import {
  InsetPanel,
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
    <InsetPanel
      borderStyle="dashed"
      size="lg"
      align="center"
      className="flex flex-1 flex-col items-center justify-center gap-3"
      role="status"
    >
      <Sparkles aria-hidden className={emptyStateWellIconLgClasses} />
      <Text as="p" className={emptyStateWellTitleLgClasses}>
        {masterDetailEmptySelectionHeading(itemNoun)}
      </Text>
      <Text as="p" className={emptyStateWellSupportingLgClasses}>
        {masterDetailEmptySelectionSubhead(itemNoun)}
      </Text>
    </InsetPanel>
  )
}
