'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { ChevronDown } from 'lucide-react'

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
        <Button type="button" variant="ghost" size="sm">
          {CONTENT_BULK_ACTIONS_MENU_LABEL}
          <ChevronDown className="size-4" aria-hidden />
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
