import { Link, type LinkProps } from 'react-router-dom'
import { Badge } from '@rpg/ui'

const contentLinkBadgeLinkClasses = 'hover:underline focus-visible:underline'

export interface ContentLinkBadgeProps {
  to: LinkProps['to']
  children: React.ReactNode
}

/** Outline badge wrapping a content detail route link. */
export function ContentLinkBadge({ to, children }: ContentLinkBadgeProps) {
  return (
    <Badge asChild appearance="outline" tone="neutral">
      <Link to={to} className={contentLinkBadgeLinkClasses}>
        {children}
      </Link>
    </Badge>
  )
}

export interface ContentStaticBadgeProps {
  children: React.ReactNode
}

/** Non-interactive outline badge for content detail metadata chips. */
export function ContentStaticBadge({ children }: ContentStaticBadgeProps) {
  return (
    <Badge appearance="outline" tone="neutral">
      {children}
    </Badge>
  )
}
