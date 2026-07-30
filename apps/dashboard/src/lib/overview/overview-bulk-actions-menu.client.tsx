'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { ChevronDown, Layers } from 'lucide-react'

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
          <Layers className="size-3.5" aria-hidden />
          {menuLabel}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden />
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
