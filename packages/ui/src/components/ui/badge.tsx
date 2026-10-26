import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import { badgeSurfaceClasses } from './badge-appearance.lib'
import type {
  BadgeAppearance,
  BadgeEmphasis,
  BadgeLayout,
  BadgeSize,
  BadgeTone,
} from './badge.variants'
import { badgeEmphasisClass, badgeLayoutVariants, badgeSizeVariants } from './badge.variants'

export {
  type BadgeAppearance,
  type BadgeEmphasis,
  type BadgeLayout,
  type BadgeSize,
  type BadgeTone,
} from './badge.variants'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  appearance?: BadgeAppearance
  tone?: BadgeTone
  size?: BadgeSize
  layout?: BadgeLayout
  /** Muted weight. Orthogonal to tone; not a disabled state. */
  emphasis?: BadgeEmphasis
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  asChild?: boolean
}

function BadgeIconSlot({ icon }: { icon: React.ReactNode }) {
  return (
    <span aria-hidden className="inline-flex shrink-0 leading-none">
      {icon}
    </span>
  )
}

function Badge({
  className,
  appearance = 'soft',
  tone = 'info',
  size = 'md',
  layout = 'label',
  emphasis = 'default',
  leadingIcon,
  trailingIcon,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const resolvedClassName = cn(
    'ui-pill',
    'ui-badge',
    badgeSizeVariants({ size }),
    badgeSurfaceClasses(appearance, tone),
    badgeEmphasisClass(emphasis),
    badgeLayoutVariants({ layout }),
    className,
  )

  if (asChild) {
    return (
      <Slot className={resolvedClassName} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <span className={resolvedClassName} {...props}>
      {leadingIcon ? <BadgeIconSlot icon={leadingIcon} /> : null}
      {children}
      {trailingIcon ? <BadgeIconSlot icon={trailingIcon} /> : null}
    </span>
  )
}

export { Badge }
