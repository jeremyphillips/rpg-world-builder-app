import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  emphasisDetailLinePrimaryVariants,
  emphasisDetailLineRootVariants,
  emphasisDetailLineSecondaryVariants,
} from './emphasis-detail-line.variants'
import { InlineMetadata } from './inline-metadata'

import type { ContentTone } from './visual-vocabulary.types'

export type EmphasisDetailLineProps<T extends React.ElementType = 'span'> = {
  as?: T
  className?: string
  /** Optional leading label, e.g. "Budget:" */
  prefix?: React.ReactNode
  /** Foreground emphasis — the value users scan first */
  primary: React.ReactNode
  /** Muted tail — supporting context */
  secondary?: React.ReactNode
  /** Primary emphasis color — `warning` for unaffordable / shortfall copy */
  primaryTone?: 'default' | 'warning'
  /** `secondary` on neutral surfaces; `disabled` inside tinted parents */
  secondaryTone?: Extract<ContentTone, 'secondary' | 'disabled'>
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'className' | 'prefix' | 'primary' | 'secondary' | 'primaryTone' | 'secondaryTone'
>

export function EmphasisDetailLine<T extends React.ElementType = 'span'>({
  as,
  className,
  prefix,
  primary,
  secondary,
  primaryTone = 'default',
  secondaryTone = 'secondary',
  ...props
}: EmphasisDetailLineProps<T>) {
  const Comp = as ?? 'span'

  return (
    <Comp className={cn(emphasisDetailLineRootVariants(), className)} {...props}>
      {prefix ? <>{prefix} </> : null}
      {secondary ? (
        <InlineMetadata role="supporting" density="comfortable" wrap={false}>
          <InlineMetadata.Item>
            <strong className={emphasisDetailLinePrimaryVariants({ tone: primaryTone })}>
              {primary}
            </strong>
          </InlineMetadata.Item>
          <InlineMetadata.Item
            className={emphasisDetailLineSecondaryVariants({ tone: secondaryTone })}
          >
            {secondary}
          </InlineMetadata.Item>
        </InlineMetadata>
      ) : (
        <strong className={emphasisDetailLinePrimaryVariants({ tone: primaryTone })}>
          {primary}
        </strong>
      )}
    </Comp>
  )
}
