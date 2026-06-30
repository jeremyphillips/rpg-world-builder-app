import { RowActionsMenu } from '@rpg/ui'

import { useCanManageCampaign } from '@/features/campaign'

export interface ContentOverviewRowActionsProps {
  campaignId: string
  editHref: string
  enabled: boolean
  onToggleEnabled: () => void
  itemLabel: string
}

/** Row actions menu for content overview tables; hidden for non-managers. */
export function ContentOverviewRowActions({
  campaignId,
  editHref,
  enabled,
  onToggleEnabled,
  itemLabel,
}: ContentOverviewRowActionsProps) {
  const canManage = useCanManageCampaign(campaignId)

  if (!canManage) return null

  return (
    <RowActionsMenu
      editHref={editHref}
      enabled={enabled}
      onToggleEnabled={onToggleEnabled}
      itemLabel={itemLabel}
    />
  )
}
