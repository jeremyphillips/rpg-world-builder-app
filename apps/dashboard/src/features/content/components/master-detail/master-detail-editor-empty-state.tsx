import { Sparkles } from 'lucide-react'
import { Text } from '@rpg/ui'

import {
  masterDetailEmptySelectionHeading,
  masterDetailEmptySelectionSubhead,
} from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import {
  masterDetailEditorEmptyStateContentClasses,
  masterDetailEditorEmptyStateHeadingClasses,
  masterDetailEditorEmptyStateIconClasses,
  masterDetailEditorEmptyStateShellClasses,
  masterDetailEditorEmptyStateSubheadClasses,
} from './master-detail-editor-empty-state.variants'

export interface MasterDetailEditorEmptyStateProps {
  itemNoun: MasterDetailItemNounTerm
}

export function MasterDetailEditorEmptyState({ itemNoun }: MasterDetailEditorEmptyStateProps) {
  return (
    <div className={masterDetailEditorEmptyStateShellClasses} role="status">
      <div className={masterDetailEditorEmptyStateContentClasses}>
        <Sparkles aria-hidden className={masterDetailEditorEmptyStateIconClasses} />
        <Text as="p" className={masterDetailEditorEmptyStateHeadingClasses}>
          {masterDetailEmptySelectionHeading(itemNoun)}
        </Text>
        <Text as="p" className={masterDetailEditorEmptyStateSubheadClasses}>
          {masterDetailEmptySelectionSubhead(itemNoun)}
        </Text>
      </div>
    </div>
  )
}
