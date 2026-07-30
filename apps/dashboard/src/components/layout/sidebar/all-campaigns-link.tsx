import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, sidebarNavItemVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

export const allCampaignsLinkClasses = cn(
  sidebarNavItemVariants({ active: false }),
  'text-muted-foreground',
)

/** Exits campaign workspace scope back to the global campaigns index. */
export function AllCampaignsLink() {
  return (
    <Link to={ROUTES.campaign.list} className={allCampaignsLinkClasses}>
      <ChevronLeft className="size-4.5 shrink-0" size={18} strokeWidth={1.75} aria-hidden />
      All campaigns
    </Link>
  )
}
