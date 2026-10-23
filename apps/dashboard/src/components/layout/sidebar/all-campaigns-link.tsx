import { Link } from 'react-router-dom'
import { Icon, sidebarNavItemVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

const allCampaignsLinkClasses = sidebarNavItemVariants({
  active: false,
  tone: 'workspaceExit',
})

/** Exits campaign workspace scope back to the global campaigns index. */
export function AllCampaignsLink() {
  return (
    <Link to={ROUTES.campaign.list} className={allCampaignsLinkClasses}>
      <Icon name="chevron-left" size="lg" className="shrink-0" />
      All campaigns
    </Link>
  )
}
