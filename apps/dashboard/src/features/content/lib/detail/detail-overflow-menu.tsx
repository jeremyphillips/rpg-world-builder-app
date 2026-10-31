import {
  ActionIcon,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItemContent,
} from '@rpg/ui'

import {
  isDetailOverflowActionGroup,
  type DetailOverflowAction,
  type DetailOverflowMenuEntry,
} from './detail-overflow-actions'

export type { DetailOverflowAction, DetailOverflowMenuEntry }

function OverflowMenuItem({ action }: { action: DetailOverflowAction }) {
  return (
    <DropdownMenuItem
      disabled={action.disabled}
      className={action.destructive ? 'text-destructive focus:text-destructive' : undefined}
      onSelect={() => action.onSelect()}
    >
      <DropdownMenuItemContent icon={action.icon} label={action.label} />
    </DropdownMenuItem>
  )
}

export type DetailOverflowMenuProps = {
  actions: readonly DetailOverflowMenuEntry[]
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
        <Button type="button" variant="ghost" size="icon" aria-label={triggerLabel}>
          <ActionIcon action={triggerAction} size="md" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((entry) =>
          isDetailOverflowActionGroup(entry) ? (
            entry.items.length > 0 ? (
              <DropdownMenuGroup key={entry.id}>
                <DropdownMenuLabel>{entry.label}</DropdownMenuLabel>
                {entry.items.map((action) => (
                  <OverflowMenuItem key={action.id} action={action} />
                ))}
              </DropdownMenuGroup>
            ) : null
          ) : (
            <div key={entry.id}>
              {entry.separatorBefore ? <DropdownMenuSeparator /> : null}
              <OverflowMenuItem action={entry} />
            </div>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
