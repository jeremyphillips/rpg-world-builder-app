'use client'

import {
  OverviewBulkActionsMenu,
  type OverviewBulkAction,
} from '@/lib/overview/overview-bulk-actions-menu'

import {
  CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL,
  CONTENT_BULK_ACTIONS_MENU_LABEL,
} from '../campaign-access/campaign-access-labels'

export type ContentBulkActionsMenuProps = {
  onEditCampaignAccess?: () => void
  additionalActions?: readonly OverviewBulkAction[]
}

export function ContentBulkActionsMenu({
  onEditCampaignAccess,
  additionalActions = [],
}: ContentBulkActionsMenuProps) {
  const actions: OverviewBulkAction[] = []

  if (onEditCampaignAccess) {
    actions.push({
      id: 'edit-campaign-access',
      label: CONTENT_BULK_ACTION_EDIT_CAMPAIGN_ACCESS_LABEL,
      onSelect: onEditCampaignAccess,
    })
  }

  actions.push(...additionalActions)

  if (actions.length === 0) {
    return null
  }

  return <OverviewBulkActionsMenu menuLabel={CONTENT_BULK_ACTIONS_MENU_LABEL} actions={actions} />
}
