import { Link, type LinkProps } from 'react-router-dom'
import { Badge } from '@rpg/ui'

const linkBadgeLinkClasses = 'hover:underline focus-visible:underline'

export interface LinkBadgeProps {
  to: LinkProps['to']
  children: React.ReactNode
}

/** In-app navigation badge — sole dashboard owner of `Badge asChild` + router `Link`. */
export function LinkBadge({ to, children }: LinkBadgeProps) {
  return (
    <Badge asChild appearance="outline" tone="neutral">
      <Link to={to} className={linkBadgeLinkClasses}>
        {children}
      </Link>
    </Badge>
  )
}

export interface StaticBadgeProps {
  children: React.ReactNode
}

/** Non-interactive outline badge for metadata chips. */
export function StaticBadge({ children }: StaticBadgeProps) {
  return (
    <Badge appearance="outline" tone="neutral">
      {children}
    </Badge>
  )
}
