import type { MasterDetailListItem } from '../../../components/master-detail/master-detail-list-panel'
import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { subclassMasterDetailMeta } from './subclass-master-detail.lib'
import { isSubclassDeletable } from './subclass-editor-constants'
import type { SubclassListItem } from './subclass-editor-state'
import { SUBCLASS_MASTER_DETAIL_ITEM_NOUN } from './subclass-form-labels'

const SOURCE_FOR_DELETABLE = {
  system: 'system',
  homebrew: 'homebrew',
  unsaved: 'homebrew',
} as const satisfies Record<SubclassListItem['catalogLayer'], 'system' | 'homebrew'>

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
    meta: subclassMasterDetailMeta(item.id, item.catalogLayer, isModified),
    ...(isAvailable ? {} : { availabilityStatusLabel: 'Unavailable' as const }),
    deletable: isSubclassDeletable(SOURCE_FOR_DELETABLE[item.catalogLayer], item.id),
  }
}
