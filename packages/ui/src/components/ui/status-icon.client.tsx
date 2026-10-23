'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Icon } from './icon/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import {
  STATUS_ICON_DEFAULT_SIZE,
  STATUS_ICON_DEFINITIONS,
  STATUS_ICON_OPTICAL_REDUCED_HEAVY_CLASS,
  STATUS_ICON_TOOLTIP_LABELS,
  statusIconVariants,
  type StatusIconVariant,
  type StatusIconVariantProps,
} from './status-icon.variants'

function resolveStatusIconTooltipLabel(
  variant: StatusIconVariant,
  tooltip: StatusIconProps['tooltip'],
): string {
  if (typeof tooltip === 'string') {
    return tooltip
  }

  return STATUS_ICON_TOOLTIP_LABELS[variant]
}

export type { StatusIconVariant } from './status-icon.variants'

export interface StatusIconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>, StatusIconVariantProps {
  /**
   * Tooltip copy — opt-in with variant labels. Pass `true` to show the default label or a
   * string to override it.
   */
  tooltip?: boolean | string
  /** Visible helper copy beside the icon — separate from the hover tooltip. */
  label?: string
}

type ResolvedStatusIconVariantProps = {
  variant: StatusIconVariant
  size: NonNullable<StatusIconVariantProps['size']>
}

function StatusIconDisc({
  variant,
  size,
  className,
  ...props
}: ResolvedStatusIconVariantProps & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>) {
  const definition = STATUS_ICON_DEFINITIONS[variant]

  return (
    <span
      className={cn(
        statusIconVariants({ variant, size }),
        'optical' in definition && STATUS_ICON_OPTICAL_REDUCED_HEAVY_CLASS,
        className,
      )}
      {...props}
    >
      <Icon name={definition.icon} size="owner" />
    </span>
  )
}

function StatusIconWithTooltip({
  variant,
  size,
  className,
  tooltip,
  ...props
}: ResolvedStatusIconVariantProps & {
  tooltip: boolean | string | undefined
} & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>) {
  const tooltipLabel = resolveStatusIconTooltipLabel(variant, tooltip)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <StatusIconDisc
            variant={variant}
            size={size}
            aria-hidden
            className={className}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StatusIcon({
  className,
  variant,
  size,
  tooltip = false,
  label,
  ...props
}: StatusIconProps) {
  const resolvedVariant = variant ?? 'ready'
  const resolvedSize = size ?? STATUS_ICON_DEFAULT_SIZE
  const showTooltip = tooltip !== false

  const icon = showTooltip ? (
    <StatusIconWithTooltip
      variant={resolvedVariant}
      size={resolvedSize}
      tooltip={tooltip}
      className={className}
      {...props}
    />
  ) : (
    <StatusIconDisc
      variant={resolvedVariant}
      size={resolvedSize}
      aria-hidden
      className={className}
      {...props}
    />
  )

  if (label) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {icon}
        <span className="text-style-caption">{label}</span>
      </span>
    )
  }

  return icon
}
