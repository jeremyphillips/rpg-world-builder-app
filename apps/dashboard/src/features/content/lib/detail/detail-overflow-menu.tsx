import type { ReactNode } from 'react'

import {
  ActionIcon,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItemContent,
} from '@rpg/ui'

export type DetailOverflowAction = {
  id: string
  label: string
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  separatorBefore?: boolean
  onSelect: () => void
}

export type DetailOverflowMenuProps = {
  actions: readonly DetailOverflowAction[]
  triggerLabel: string
  triggerIcon?: 'horizontal' | 'vertical'
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

export function DetailOverflowMenu({
  actions,
  triggerLabel,
  triggerIcon = 'horizontal',
}: DetailOverflowMenuProps) {
  if (actions.length === 0) {
    return null
  }

  const triggerAction = triggerIcon === 'vertical' ? 'overflowVertical' : 'overflow'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          density="compact"
          aria-label={triggerLabel}
        >
          <ActionIcon action={triggerAction} step="md" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <div key={action.id}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              disabled={action.disabled}
              className={action.destructive ? 'text-destructive focus:text-destructive' : undefined}
              onSelect={() => action.onSelect()}
            >
              <DropdownMenuItemContent icon={action.icon} label={action.label} />
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
