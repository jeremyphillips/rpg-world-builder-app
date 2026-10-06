import type { DetailOverflowAction } from '../../detail/detail-overflow-menu'
import type { EntityRowListMenuItem } from './entity-row-list-parts'

/** Maps shared detail overflow actions onto entity row list menu items (preserves icons). */
export function detailOverflowActionsToRowMenuItems(
  actions: readonly DetailOverflowAction[],
): EntityRowListMenuItem[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    destructive: action.destructive,
    disabled: action.disabled,
    separatorBefore: action.separatorBefore,
    onSelect: action.onSelect,
  }))
}
