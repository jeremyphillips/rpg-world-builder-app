import { cn } from '../../lib/utils'
import { Icon } from './icon/icon'

export type NavigationChevronSize = 'md' | 'lg'

export type NavigationChevronProps = {
  className?: string
  /** Glyph step — `md` for card/destination rows, `lg` for compact list rows. */
  size?: NavigationChevronSize
}

/** Decorative trailing chevron for navigable surfaces (card, destination, list drill-in). */
export function NavigationChevron({ className, size = 'md' }: NavigationChevronProps) {
  return (
    <span className={cn('ui-nav-chevron', className)} aria-hidden>
      <Icon name="chevron-right" size={size} className="shrink-0" />
    </span>
  )
}
