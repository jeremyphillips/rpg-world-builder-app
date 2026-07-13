import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { RowActionsMenu, type RowActionsMenuLinkProps } from '@rpg/ui'

import { useCanManageCampaign } from '@/features/campaign'

const DashboardRowActionsEditLink = forwardRef<HTMLAnchorElement, RowActionsMenuLinkProps>(
  function DashboardRowActionsEditLink({ href, className, children }, ref) {
    return (
      <Link ref={ref} to={href} className={className}>
        {children}
      </Link>
    )
  },
)

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
      EditLink={DashboardRowActionsEditLink}
      enabled={enabled}
      onToggleEnabled={onToggleEnabled}
      itemLabel={itemLabel}
    />
  )
}
