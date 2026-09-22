import type { ReactNode } from 'react'
import { MoreHorizontal, MoreVertical, Trash2 } from 'lucide-react'

import {
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

export function DetailOverflowMenu({
  actions,
  triggerLabel,
  triggerIcon = 'horizontal',
}: DetailOverflowMenuProps) {
  if (actions.length === 0) {
    return null
  }

  const TriggerIcon = triggerIcon === 'vertical' ? MoreVertical : MoreHorizontal

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
          <TriggerIcon aria-hidden />
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
