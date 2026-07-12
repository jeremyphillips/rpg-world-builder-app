import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import type { BadgeAppearance, BadgeSize, BadgeTone } from './badge.variants'
import { resolveCompactLabelClassName } from './compact-label.variants'
import { compactLabelFilledFromAppearance } from './compact-label.lib'

export {
  badgeVariants,
  mapLegacyBadgeVariant,
  type BadgeAppearance,
  type BadgeSize,
  type BadgeTone,
  type LegacyBadgeVariant,
} from './badge.variants'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  appearance?: BadgeAppearance
  tone?: BadgeTone
  size?: BadgeSize
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  asChild?: boolean
}

function BadgeIconSlot({ icon, size }: { icon: React.ReactNode; size: BadgeSize }) {
  const iconSizeClass =
    size === 'sm' ? '[&_svg]:size-2.5' : size === 'lg' ? '[&_svg]:size-3.5' : '[&_svg]:size-3'

  return (
    <span aria-hidden className={cn('inline-flex shrink-0 leading-none', iconSizeClass)}>
      {icon}
    </span>
  )
}

function Badge({
  className,
  appearance = 'soft',
  tone = 'informative',
  size = 'md',
  leadingIcon,
  trailingIcon,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      className={resolveCompactLabelClassName({
        size,
        appearance,
        tone,
        filled: compactLabelFilledFromAppearance(appearance),
        className,
      })}
      {...props}
    >
      {leadingIcon ? <BadgeIconSlot icon={leadingIcon} size={size} /> : null}
      {children}
      {trailingIcon ? <BadgeIconSlot icon={trailingIcon} size={size} /> : null}
    </Comp>
  )
}

export { Badge }
