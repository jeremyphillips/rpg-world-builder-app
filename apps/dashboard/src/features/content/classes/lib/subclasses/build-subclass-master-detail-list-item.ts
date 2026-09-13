import type { MasterDetailListItem } from '../../../components/master-detail/master-detail-list-panel'
import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { resolveSubclassEditorSourceLabel } from './subclass-editor-panel.lib'
import { isDraftSubclassId, isSubclassDeletable } from './subclass-editor-constants'
import type { SubclassListItem } from './subclass-editor-state'
import { SUBCLASS_MASTER_DETAIL_ITEM_NOUN } from './subclass-form-labels'

const SOURCE_FOR_DELETABLE = {
  system: 'system',
  homebrew: 'homebrew',
  unsaved: 'homebrew',
} as const satisfies Record<SubclassListItem['source'], 'system' | 'homebrew'>

export interface BuildSubclassMasterDetailListItemParams {
  item: SubclassListItem
  isModified: boolean
  isAvailable: boolean
}

/** Maps a subclass list row to the shared master-detail list item contract. */
export function buildSubclassMasterDetailListItem({
  item,
  isModified,
  isAvailable,
}: BuildSubclassMasterDetailListItemParams): MasterDetailListItem {
  return {
    id: item.id,
    title: masterDetailItemTitle(item.name, SUBCLASS_MASTER_DETAIL_ITEM_NOUN),
    meta: {
      ...(isModified ? { eyebrow: 'Modified' } : {}),
      sourceLabel: resolveSubclassEditorSourceLabel(
        item.id,
        item.source === 'unsaved' ? 'homebrew' : item.source,
        item.source === 'unsaved' || isDraftSubclassId(item.id) ? 'draft' : 'published',
      ),
    },
    active: isAvailable,
    deletable: isSubclassDeletable(SOURCE_FOR_DELETABLE[item.source], item.id),
  }
}
