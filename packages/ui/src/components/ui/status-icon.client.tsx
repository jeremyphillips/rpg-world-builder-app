'use client'

import * as React from 'react'
import { Check, CircleAlert, Ellipsis, Minus, Slash } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import {
  STATUS_ICON_OFF_SLASH_STROKE_WIDTH,
  STATUS_ICON_STROKE_WIDTH,
  STATUS_ICON_TOOLTIP_LABELS,
  statusIconGlyphVariants,
  statusIconVariants,
  type StatusIconVariant,
  type StatusIconVariantProps,
} from './status-icon.variants'

function resolveStatusIconStrokeWidth(variant: StatusIconVariant): number {
  if (variant === 'off') {
    return STATUS_ICON_OFF_SLASH_STROKE_WIDTH
  }

  return STATUS_ICON_STROKE_WIDTH
}

function resolveStatusIconTooltipLabel(
  variant: StatusIconVariant,
  tooltip: StatusIconProps['tooltip'],
): string {
  if (typeof tooltip === 'string') {
    return tooltip
  }

  return STATUS_ICON_TOOLTIP_LABELS[variant]
}

type StatusIconGlyphComponent = React.ComponentType<{
  className?: string
  strokeWidth?: number
}>

const STATUS_ICON_GLYPHS = {
  ready: Check,
  incomplete: Ellipsis,
  off: Slash,
  none: Minus,
  notConfigured: Ellipsis,
  needsAttention: CircleAlert,
} as const satisfies Record<StatusIconVariant, StatusIconGlyphComponent>

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

function StatusIconGlyph({
  variant,
  size,
  className,
}: ResolvedStatusIconVariantProps & { className?: string }) {
  const Glyph = STATUS_ICON_GLYPHS[variant]

  return (
    <Glyph
      aria-hidden
      strokeWidth={resolveStatusIconStrokeWidth(variant)}
      className={cn(statusIconGlyphVariants({ variant, size }), className)}
    />
  )
}

function StatusIconDisc({
  variant,
  size,
  className,
  ...props
}: ResolvedStatusIconVariantProps & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>) {
  return (
    <span className={cn(statusIconVariants({ variant, size }), className)} {...props}>
      <StatusIconGlyph variant={variant} size={size} />
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
  const resolvedSize = size ?? 'sm'
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
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    )
  }

  return icon
}
