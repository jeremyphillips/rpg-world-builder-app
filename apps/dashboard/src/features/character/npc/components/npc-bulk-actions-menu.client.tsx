'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { ChevronDown, Layers } from 'lucide-react'

export const NPC_BULK_ACTIONS_MENU_LABEL = 'Bulk actions' as const
export const NPC_BULK_ACTION_EDIT_ROSTER_STATUS_LABEL = 'Edit roster status' as const

export type NpcBulkActionsMenuProps = {
  onEditRosterStatus: () => void
}

export function NpcBulkActionsMenu({ onEditRosterStatus }: NpcBulkActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Layers className="size-3.5" aria-hidden />
          {NPC_BULK_ACTIONS_MENU_LABEL}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEditRosterStatus}>
          {NPC_BULK_ACTION_EDIT_ROSTER_STATUS_LABEL}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
