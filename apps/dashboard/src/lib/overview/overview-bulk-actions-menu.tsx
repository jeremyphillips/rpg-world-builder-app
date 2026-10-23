import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@rpg/ui'

export type OverviewBulkAction = {
  id: string
  label: string
  onSelect: () => void
}

export type OverviewBulkActionsMenuProps = {
  menuLabel: string
  actions: readonly OverviewBulkAction[]
}

/** Shared bulk-actions dropdown shell for content and vocabulary overview tables. */
export function OverviewBulkActionsMenu({ menuLabel, actions }: OverviewBulkActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Icon name="layers" size="md" />
          {menuLabel}
          <Icon name="chevron-down" size="md" className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem key={action.id} onSelect={action.onSelect}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
