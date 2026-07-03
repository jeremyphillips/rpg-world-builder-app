import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  alertDescriptionVariants,
  alertTitleVariants,
  alertVariants,
  type AlertVariant,
} from './alert.variants'

export type { AlertVariant }

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  variant?: AlertVariant
  title?: React.ReactNode
  description?: React.ReactNode
  /** Optional action controls (e.g. links or buttons) rendered beside the copy. */
  actions?: React.ReactNode
}

/**
 * Non-blocking status surface for contextual guidance. Variants map to global
 * status tokens (`info`, `success`, `warning`, `destructive`, or `default`).
 */
export function Alert({
  variant = 'default',
  title,
  description,
  actions,
  className,
  children,
  ...props
}: AlertProps) {
  const hasCopy = title != null || description != null || children != null

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {hasCopy ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title ? (
            <p className={alertTitleVariants({ variant })} data-slot="alert-title">
              {title}
            </p>
          ) : null}
          {description ? (
            <p className={alertDescriptionVariants({ variant })} data-slot="alert-description">
              {description}
            </p>
          ) : null}
          {children}
        </div>
      ) : null}
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2" data-slot="alert-actions">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
