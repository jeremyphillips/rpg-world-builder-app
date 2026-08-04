import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sidebarNavItemVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

export const allCampaignsLinkClasses = sidebarNavItemVariants({
  active: false,
  tone: 'workspaceExit',
})

/** Exits campaign workspace scope back to the global campaigns index. */
export function AllCampaignsLink() {
  return (
    <Link to={ROUTES.campaign.list} className={allCampaignsLinkClasses}>
      <ChevronLeft className="size-4 shrink-0" size={16} strokeWidth={1.75} aria-hidden />
      All campaigns
    </Link>
  )
}
