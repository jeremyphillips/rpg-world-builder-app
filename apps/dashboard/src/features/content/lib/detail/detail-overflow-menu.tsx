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

import type { DetailOverflowAction } from './detail-overflow-actions'

export type { DetailOverflowAction }

export type DetailOverflowMenuProps = {
  actions: readonly DetailOverflowAction[]
  triggerLabel: string
  triggerIcon?: 'horizontal' | 'vertical'
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
