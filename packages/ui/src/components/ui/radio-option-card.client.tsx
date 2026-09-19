'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { Button } from './button.client'
import {
  SelectionOptionCardAnatomy,
  SelectionOptionCardTitleMeta,
  type SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import {
  optionCardBodyVariants,
  optionCardEmbeddedSlotVariants,
  optionCardFooterSlotVariants,
} from './selection-option-card.variants'
import {
  radioCardControlVariants,
  radioCardDetailsActionVariants,
  radioCardDetailsGridVariants,
  radioCardDetailsInlineSlotVariants,
  radioCardIconControlVariants,
  radioCardIndicatorVariants,
  radioCardItemWithDetailsVariants,
  radioCardShellItemVariants,
  radioCardShellVariants,
  radioCardVariants,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'

export type RadioOptionCardEmbeddedSlotTone = 'divider' | 'panel'

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
  /** Outer shell selected chrome when using shell layout. */
  shellSelected?: boolean
  /** When shell layout is used, whether embedded content is visible. */
  showEmbedded?: boolean
}

function RadioOptionCardControl({
  className,
  variant = 'card',
  density = 'default',
}: {
  className?: string
  variant?: RadioCardVariant
  density?: SelectionOptionCardDensity
}) {
  const indicatorSize = variant === 'row' ? 'size-2.5' : density === 'compact' ? 'size-2' : 'size-3'

  return (
    <span
      className={cn(radioCardControlVariants({ variant, density }), 'mt-0.5', className)}
      aria-hidden="true"
    >
      <span className={radioCardIndicatorVariants()}>
        <Circle className={cn('fill-primary text-primary', indicatorSize)} />
      </span>
    </span>
  )
}

function RadioOptionCardIconControl({
  icon,
  density = 'default',
  className,
}: {
  icon: React.ReactNode
  density?: SelectionOptionCardDensity
  className?: string
}) {
  return (
    <span
      className={cn(radioCardIconControlVariants({ density }), 'mt-0.5', className)}
      aria-hidden="true"
    >
      {icon}
    </span>
  )
}

function radioOptionCardUsesShell({
  titleEndSlot,
  embedded,
  footer,
}: Pick<RadioOptionCardProps, 'titleEndSlot' | 'embedded' | 'footer'>): boolean {
  return !!(titleEndSlot || embedded || footer)
}

function RadioOptionCardLeadingControl({
  visualControl = 'radio',
  icon,
  variant = 'card',
  density = 'default',
  className,
}: {
  visualControl?: RadioCardVisualControl
  icon?: React.ReactNode
  variant?: RadioCardVariant
  density?: SelectionOptionCardDensity
  className?: string
}) {
  if (visualControl === 'icon') {
    return icon ? (
      <RadioOptionCardIconControl icon={icon} density={density} className={className} />
    ) : null
  }

  return <RadioOptionCardControl variant={variant} density={density} className={className} />
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
      shellSelected = false,
      showEmbedded = false,
      disabled,
      onClick,
      value,
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

    if (variant === 'row' || !radioOptionCardUsesShell({ titleEndSlot, embedded, footer })) {
      return (
        <RadioGroupPrimitive.Item
          ref={ref}
          disabled={disabled}
          value={value}
          className={cn(radioCardVariants({ density, variant }), className)}
          onClick={onClick}
          {...props}
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
          />
        </RadioGroupPrimitive.Item>
      )
    }

    return (
      <div className={radioCardShellVariants({ density, selected: shellSelected })}>
        {titleEndSlot ? (
          <div className={radioCardDetailsGridVariants({ density })}>
            <RadioGroupPrimitive.Item
              ref={ref}
              disabled={disabled}
              value={value}
              className={cn(radioCardItemWithDetailsVariants(), 'group', className)}
              onClick={onClick}
              {...props}
            >
              <RadioOptionCardLeadingControl
                visualControl={visualControl}
                icon={icon}
                variant={variant}
                density={density}
                className="col-start-1 row-start-1"
              />
              <div
                className={cn(
                  optionCardBodyVariants({ density }),
                  'col-start-2 row-start-1 min-w-0',
                )}
              >
                <SelectionOptionCardAnatomy
                  density={density}
                  label={label}
                  titleAdornment={titleAdornment}
                  description={description}
                  summaryItems={summaryItems}
                  summaryLines={summaryLines}
                  titleClassName={titleClassName}
                />
              </div>
            </RadioGroupPrimitive.Item>
            <div className={radioCardDetailsInlineSlotVariants()}>{titleEndSlot}</div>
          </div>
        ) : (
          <RadioGroupPrimitive.Item
            ref={ref}
            disabled={disabled}
            value={value}
            className={cn(radioCardShellItemVariants(), 'group', className)}
            onClick={onClick}
            {...props}
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
            />
          </RadioGroupPrimitive.Item>
        )}
        {showEmbedded && embedded ? (
          <div className={optionCardEmbeddedSlotVariants({ density, tone: embeddedTone })}>
            {embedded}
          </div>
        ) : null}
        {footer ? <div className={optionCardFooterSlotVariants({ density })}>{footer}</div> : null}
      </div>
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
      variant="ghost"
      size="sm"
      density="compact"
      className={radioCardDetailsActionVariants()}
      onClick={onDetails}
    >
      {label}
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
