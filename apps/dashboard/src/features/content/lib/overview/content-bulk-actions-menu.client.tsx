'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { ChevronDown, Layers } from 'lucide-react'

import {
  CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL,
  CONTENT_BULK_ACTIONS_MENU_LABEL,
} from '../campaign-access/campaign-access-labels'

export type ContentBulkActionsMenuProps = {
  onEditCampaignAccess: () => void
}

export function ContentBulkActionsMenu({ onEditCampaignAccess }: ContentBulkActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Layers className="size-3.5" aria-hidden />
          {CONTENT_BULK_ACTIONS_MENU_LABEL}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEditCampaignAccess}>
          {CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
