import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  alertDescriptionVariants,
  alertTitleVariants,
  alertVariants,
  type AlertAnnouncement,
  type AlertDensity,
  type AlertVariant,
} from './alert.variants'

export type { AlertAnnouncement, AlertDensity, AlertVariant }

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  variant?: AlertVariant
  density?: AlertDensity
  announcement?: AlertAnnouncement
  leading?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /** Optional action controls (e.g. links or buttons) below the copy. */
  actions?: React.ReactNode
}

function resolveAnnouncementRole(
  announcement: AlertAnnouncement,
  roleProp: React.AriaRole | undefined,
): React.AriaRole | undefined {
  if (roleProp != null) {
    return roleProp
  }
  if (announcement === 'alert') {
    return 'alert'
  }
  if (announcement === 'status') {
    return 'status'
  }
  return undefined
}

/**
 * Non-blocking status surface for contextual guidance. Variants map to global
 * status tokens (`info`, `success`, `warning`, `destructive`, or `default`).
 */
export function Alert({
  variant = 'default',
  density = 'comfortable',
  announcement = 'alert',
  leading,
  title,
  description,
  actions,
  className,
  children,
  role: roleProp,
  ...props
}: AlertProps) {
  const hasCopy = title != null || description != null || children != null

  return (
    <div
      className={cn(alertVariants({ variant, density }), className)}
      role={resolveAnnouncementRole(announcement, roleProp)}
      {...props}
    >
      {leading ? <div className="ui-alert__leading">{leading}</div> : null}
      <div className="ui-alert__main">
        {hasCopy ? (
          <div className="ui-alert__copy">
            {title ? (
              <p className={alertTitleVariants()} data-slot="alert-title">
                {title}
              </p>
            ) : null}
            {description ? (
              <p className={alertDescriptionVariants()} data-slot="alert-description">
                {description}
              </p>
            ) : null}
            {children}
          </div>
        ) : null}
        {actions ? (
          <div className="ui-alert__actions" data-slot="alert-actions">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
