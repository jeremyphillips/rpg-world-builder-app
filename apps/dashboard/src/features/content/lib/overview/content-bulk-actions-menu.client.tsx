'use client'

import { OverviewBulkActionsMenu } from '@/lib/overview/overview-bulk-actions-menu.client'

import {
  CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL,
  CONTENT_BULK_ACTIONS_MENU_LABEL,
} from '../campaign-access/campaign-access-labels'

export type ContentBulkActionsMenuProps = {
  onEditCampaignAccess: () => void
}

export function ContentBulkActionsMenu({ onEditCampaignAccess }: ContentBulkActionsMenuProps) {
  return (
    <OverviewBulkActionsMenu
      menuLabel={CONTENT_BULK_ACTIONS_MENU_LABEL}
      actions={[
        {
          id: 'edit-campaign-access',
          label: CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL,
          onSelect: onEditCampaignAccess,
        },
      ]}
    />
  )
}
