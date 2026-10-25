import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import type { BadgeAppearance, BadgeLayout, BadgeSize, BadgeTone } from './badge.variants'
import { badgeLayoutVariants } from './badge.variants'
import type { CompactLabelEmphasis } from './compact-label.lib'
import { resolveCompactLabelClassName } from './compact-label.variants'
export {
  type BadgeAppearance,
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
  emphasis?: CompactLabelEmphasis
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
    'ui-badge',
    resolveCompactLabelClassName({
      size,
      appearance,
      tone,
      emphasis,
      className: cn(badgeLayoutVariants({ layout }), className),
    }),
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
