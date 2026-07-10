import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  emphasisDetailLinePrimaryVariants,
  emphasisDetailLineRootVariants,
  emphasisDetailLineSecondaryVariants,
} from './emphasis-detail-line.variants'

export type EmphasisDetailLineSecondaryTone = 'muted' | 'subtle'

export type EmphasisDetailLineProps<T extends React.ElementType = 'span'> = {
  as?: T
  className?: string
  /** Optional leading label, e.g. "Budget:" */
  prefix?: React.ReactNode
  /** Foreground emphasis — the value users scan first */
  primary: React.ReactNode
  /** Muted tail — supporting context */
  secondary?: React.ReactNode
  /** `muted` on neutral surfaces; `subtle` inside tinted parents like warning text */
  secondaryTone?: EmphasisDetailLineSecondaryTone
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'className' | 'prefix' | 'primary' | 'secondary' | 'secondaryTone'
>

export function EmphasisDetailLine<T extends React.ElementType = 'span'>({
  as,
  className,
  prefix,
  primary,
  secondary,
  secondaryTone = 'muted',
  ...props
}: EmphasisDetailLineProps<T>) {
  const Comp = as ?? 'span'

  return (
    <Comp className={cn(emphasisDetailLineRootVariants(), className)} {...props}>
      {prefix ? <>{prefix} </> : null}
      <strong className={emphasisDetailLinePrimaryVariants()}>{primary}</strong>
      {secondary ? (
        <span className={emphasisDetailLineSecondaryVariants({ tone: secondaryTone })}>
          {' · '}
          {secondary}
        </span>
      ) : null}
    </Comp>
  )
}
