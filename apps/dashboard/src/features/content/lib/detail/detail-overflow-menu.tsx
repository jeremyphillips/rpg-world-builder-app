import type { ReactNode } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuItemContent,
} from '@rpg/ui'

export type DetailOverflowAction = {
  id: string
  label: string
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  onSelect: () => void
}

export type DetailOverflowMenuProps = {
  actions: readonly DetailOverflowAction[]
  triggerLabel: string
}

/** Standard destructive delete action with trash icon for detail overflow menus. */
export function detailOverflowDeleteAction(
  label: string,
  onSelect: () => void,
): DetailOverflowAction {
  return {
    id: 'delete',
    label,
    icon: <Trash2 aria-hidden />,
    destructive: true,
    onSelect,
  }
}

export function DetailOverflowMenu({ actions, triggerLabel }: DetailOverflowMenuProps) {
  if (actions.length === 0) {
    return null
  }

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
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            disabled={action.disabled}
            className={action.destructive ? 'text-destructive focus:text-destructive' : undefined}
            onSelect={() => action.onSelect()}
          >
            <DropdownMenuItemContent icon={action.icon} label={action.label} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
