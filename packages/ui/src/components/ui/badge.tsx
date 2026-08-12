import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import type { BadgeAppearance, BadgeSize, BadgeTone } from './badge.variants'
import { resolveCompactLabelClassName } from './compact-label.variants'
import { badgeIconGlyphClasses } from './icon-glyph.variants'

export {
  badgeVariants,
  type BadgeAppearance,
  type BadgeSize,
  type BadgeTone,
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
  return (
    <span aria-hidden className={badgeIconGlyphClasses(size)}>
      {icon}
    </span>
  )
}

function Badge({
  className,
  appearance = 'soft',
  tone = 'info',
  size = 'md',
  leadingIcon,
  trailingIcon,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const resolvedClassName = resolveCompactLabelClassName({
    size,
    appearance,
    tone,
    filled: appearance === 'soft' || appearance === 'strong',
    className: cn('border-[1.5px]', className),
  })

  if (asChild) {
    return (
      <Slot className={resolvedClassName} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <span className={resolvedClassName} {...props}>
      {leadingIcon ? <BadgeIconSlot icon={leadingIcon} size={size} /> : null}
      {children}
      {trailingIcon ? <BadgeIconSlot icon={trailingIcon} size={size} /> : null}
    </span>
  )
}

export { Badge }
