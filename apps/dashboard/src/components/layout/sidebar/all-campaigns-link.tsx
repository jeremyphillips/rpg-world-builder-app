import { Link } from 'react-router-dom'

import { cn } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

/** Exits campaign workspace scope back to the global campaigns index. */
export function AllCampaignsLink() {
  return (
    <Link
      to={ROUTES.campaign.list}
      className={cn(
        'block px-3 py-1.5 text-sm font-medium text-sidebar-nav-item-fg transition-colors',
        'rounded-md hover:bg-accent hover:text-accent-foreground',
      )}
    >
      ← All campaigns
    </Link>
  )
}
