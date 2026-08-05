'use client'

import { MoreHorizontal } from 'lucide-react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'

export type RelationshipOverflowAction = {
  id: string
  label: string
  destructive?: boolean
  onSelect: () => void
}

export type RelationshipOverflowMenuProps = {
  actions: readonly RelationshipOverflowAction[]
  triggerLabel: string
}

export function RelationshipOverflowMenu({ actions, triggerLabel }: RelationshipOverflowMenuProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={triggerLabel}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            className={action.destructive ? 'text-destructive focus:text-destructive' : undefined}
            onSelect={() => action.onSelect()}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
