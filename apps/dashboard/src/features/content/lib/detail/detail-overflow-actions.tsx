import type { ReactNode } from 'react'

import { ActionIcon, Icon } from '@rpg/ui'

export type DetailOverflowAction = {
  id: string
  label: string
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  separatorBefore?: boolean
  onSelect: () => void
}

/** Flat labeled group. Destinations stay in the same menu, not a submenu. */
export type DetailOverflowActionGroup = {
  id: string
  label: string
  items: readonly DetailOverflowAction[]
}

export type DetailOverflowMenuEntry = DetailOverflowAction | DetailOverflowActionGroup

export function isDetailOverflowActionGroup(
  entry: DetailOverflowMenuEntry,
): entry is DetailOverflowActionGroup {
  return 'items' in entry
}

const OVERFLOW_MENU_ICON_STEP = 'md' as const

/** Standard destructive delete action with trash icon for detail overflow menus. */
export function detailOverflowDeleteAction(
  label: string,
  onSelect: () => void,
): DetailOverflowAction {
  return {
    id: 'delete',
    label,
    icon: <ActionIcon action="delete" size={OVERFLOW_MENU_ICON_STEP} />,
    destructive: true,
    onSelect,
  }
}

export function detailOverflowDuplicateAction(
  label: string,
  onSelect: () => void,
): DetailOverflowAction {
  return {
    id: 'duplicate',
    label,
    icon: <Icon name="copy" size="md" />,
    onSelect,
  }
}

export function detailOverflowViewAction(
  label: string,
  onSelect: () => void,
): DetailOverflowAction {
  return {
    id: 'view',
    label,
    icon: <ActionIcon action="view" size={OVERFLOW_MENU_ICON_STEP} />,
    onSelect,
  }
}

export function detailOverflowMoveAction(
  label: string,
  onSelect: () => void,
): DetailOverflowAction {
  return {
    id: 'move',
    label,
    icon: <ActionIcon action="waypoints" size={OVERFLOW_MENU_ICON_STEP} />,
    onSelect,
  }
}
