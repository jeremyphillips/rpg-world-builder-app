import type { ReactNode } from 'react'

import { ActionIcon } from '@rpg/ui'

export type DetailOverflowAction = {
  id: string
  label: string
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  separatorBefore?: boolean
  onSelect: () => void
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
    icon: <ActionIcon action="delete" step={OVERFLOW_MENU_ICON_STEP} />,
    destructive: true,
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
    icon: <ActionIcon action="view" step={OVERFLOW_MENU_ICON_STEP} />,
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
    icon: <ActionIcon action="waypoints" step={OVERFLOW_MENU_ICON_STEP} />,
    onSelect,
  }
}
