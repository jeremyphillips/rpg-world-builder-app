'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { ChevronRight } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { Button } from './button.client'
import {
  SelectionOptionCardAnatomy,
  SelectionOptionCardTitleMeta,
  type SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import { RadioOptionCardLeadingControl } from './radio-option-card-controls.client'
import {
  RadioOptionCardMediaSlot,
  RadioOptionCardShellLayout,
} from './radio-option-card-shell.client'
import {
  radioCardDetailsActionVariants,
  radioCardVariants,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'

export type RadioOptionCardEmbeddedSlotTone = 'divider' | 'panel'

export type RadioOptionCardSummaryBadge = {
  label: string
  tooltip?: string
}

export type RadioOptionCardProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & {
  label: string
  description?: string
  summaryItems?: string[]
  summaryLines?: string[]
  density?: SelectionOptionCardDensity
  variant?: RadioCardVariant
  /** Merged onto the option title label. */
  titleClassName?: string
  controlPosition?: 'left' | 'right'
  visualControl?: RadioCardVisualControl
  icon?: React.ReactNode
  titleEndSlot?: React.ReactNode
  titleAdornment?: React.ReactNode
  embedded?: React.ReactNode
  footer?: React.ReactNode
  embeddedTone?: RadioOptionCardEmbeddedSlotTone
  /** Full-bleed image region above the card body. */
  media?: React.ReactNode
  summaryBadge?: RadioOptionCardSummaryBadge
  reserveSummaryBadgeRow?: boolean
  clampDescription?: boolean
  /** Outer shell selected chrome when using shell layout. */
  shellSelected?: boolean
  /** When shell layout is used, whether embedded content is visible. */
  showEmbedded?: boolean
}

function radioOptionCardUsesShell({
  titleEndSlot,
  embedded,
  footer,
  media,
}: Pick<RadioOptionCardProps, 'titleEndSlot' | 'embedded' | 'footer' | 'media'>): boolean {
  return !!(titleEndSlot || embedded || footer || media)
}

function RadioOptionCardSummaryBadgeSlot({ badge }: { badge: RadioOptionCardSummaryBadge }) {
  const badgeNode = (
    <Badge appearance="soft" tone="neutral" size="sm">
      {badge.label}
    </Badge>
  )

  if (!badge.tooltip) {
    return badgeNode
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badgeNode}</span>
        </TooltipTrigger>
        <TooltipContent>{badge.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function renderSummaryBadge(
  summaryBadge: RadioOptionCardSummaryBadge | undefined,
): React.ReactNode {
  if (!summaryBadge) return null
  return <RadioOptionCardSummaryBadgeSlot badge={summaryBadge} />
}

export const RadioOptionCard = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioOptionCardProps
>(
  (
    {
      className,
      label,
      description,
      summaryItems,
      summaryLines,
      density = 'default',
      variant = 'card',
      titleClassName,
      controlPosition = 'left',
      visualControl = 'radio',
      icon,
      titleEndSlot,
      titleAdornment,
      embedded,
      footer,
      embeddedTone = 'divider',
      media,
      summaryBadge,
      reserveSummaryBadgeRow = false,
      clampDescription = false,
      shellSelected = false,
      showEmbedded = false,
      disabled,
      onClick,
      value,
      id,
      ...props
    },
    ref,
  ) => {
    const effectiveControlPosition = visualControl === 'icon' ? 'left' : controlPosition
    const leadingControl = (
      <RadioOptionCardLeadingControl
        visualControl={visualControl}
        icon={icon}
        variant={variant}
        density={density}
      />
    )
    const summaryBadgeNode = renderSummaryBadge(summaryBadge)
    const anatomyProps = {
      density,
      label,
      titleAdornment,
      description,
      summaryItems,
      summaryLines,
      titleClassName,
      summaryBadgeNode,
      reserveSummaryBadgeRow,
      clampDescription,
    }
    const itemProps = {
      ref,
      disabled,
      value,
      id,
      onClick,
      className,
      ...props,
    }

    if (variant === 'row' || !radioOptionCardUsesShell({ titleEndSlot, embedded, footer, media })) {
      return (
        <RadioGroupPrimitive.Item
          {...itemProps}
          aria-label={label}
          className={cn(radioCardVariants({ density, variant }), className)}
        >
          <SelectionOptionCardAnatomy
            density={density}
            leadingControl={leadingControl}
            label={label}
            titleAdornment={titleAdornment}
            description={description}
            summaryItems={summaryItems}
            summaryLines={summaryLines}
            titleClassName={titleClassName}
            controlPosition={effectiveControlPosition}
            summaryBadge={summaryBadgeNode}
            reserveSummaryBadgeRow={reserveSummaryBadgeRow}
            clampDescription={clampDescription}
          />
        </RadioGroupPrimitive.Item>
      )
    }

    return (
      <RadioOptionCardShellLayout
        itemProps={itemProps}
        visualControl={visualControl}
        icon={icon}
        variant={variant}
        leadingControl={leadingControl}
        effectiveControlPosition={effectiveControlPosition}
        titleEndSlot={titleEndSlot}
        embedded={embedded}
        footer={footer}
        embeddedTone={embeddedTone}
        showEmbedded={showEmbedded}
        media={media}
        mediaSlot={
          media != null ? (
            <RadioOptionCardMediaSlot media={media} id={id} disabled={disabled} />
          ) : null
        }
        shellSelected={shellSelected}
        {...anatomyProps}
      />
    )
  },
)
RadioOptionCard.displayName = 'RadioOptionCard'

export function RadioOptionCardDetailsAction({
  label,
  onDetails,
}: {
  label: string
  onDetails: () => void
}) {
  return (
    <Button
      type="button"
      variant="text"
      tone="accent"
      size="sm"
      density="compact"
      className={radioCardDetailsActionVariants()}
      onClick={onDetails}
    >
      {label}
      <ChevronRight aria-hidden />
    </Button>
  )
}

export function RadioOptionCardTitleAdornment({
  badge,
  titleMeta,
}: {
  badge?: string
  titleMeta?: string
}) {
  if (!badge && !titleMeta) {
    return null
  }

  return (
    <>
      {titleMeta ? <SelectionOptionCardTitleMeta>{titleMeta}</SelectionOptionCardTitleMeta> : null}
      {badge ? (
        <Badge appearance="soft" tone="info" size="sm">
          {badge}
        </Badge>
      ) : null}
    </>
  )
}
