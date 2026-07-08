'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { Button } from './button.client'
import { RadioGroup } from './radio-group.client'
import {
  radioCardBodyVariants,
  radioCardControlVariants,
  radioCardDetailsGridVariants,
  radioCardDetailsInlineSlotVariants,
  radioCardDetailsLinkVariants,
  radioCardIndicatorVariants,
  radioCardItemWithDetailsVariants,
  radioCardMetaListVariants,
  radioCardRootLayoutVariants,
  radioCardShellVariants,
  radioCardSummaryVariants,
  radioCardTitleRowVariants,
  radioCardTitleVariants,
  radioCardVariants,
} from './radio-card.variants'
import { textVariants } from './text.variants'

export const RADIO_CARD_DEFAULT_DETAILS_LABEL = 'Details'

export const RADIO_CARD_SUMMARY_SEPARATOR = ' · '

export type RadioCardDensity = 'default' | 'compact'

export interface RadioCardOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
  /** Optional badge rendered inline with the title (e.g. "Recommended"). */
  badge?: string
  meta?: string[]
  /** Compact density: trait names or other summary chips rendered inline. */
  summaryItems?: string[]
  onDetails?: () => void
  detailsLabel?: string
}

export interface RadioCardItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  label: string
  description?: string
  badge?: string
  meta?: string[]
  summaryItems?: string[]
  density?: RadioCardDensity
  /** Horizontal placement of the decorative radio control within the card. */
  controlPosition?: 'left' | 'right'
}

function RadioCardDetailsLink({ label, onDetails }: { label: string; onDetails: () => void }) {
  return (
    <Button variant="link" size="sm" className={radioCardDetailsLinkVariants()} onClick={onDetails}>
      {label}
    </Button>
  )
}

type RadioCardItemContentProps = Pick<
  RadioCardItemProps,
  'label' | 'description' | 'badge' | 'meta' | 'summaryItems' | 'density' | 'controlPosition'
>

function RadioCardItemContent({
  label,
  description,
  badge,
  meta,
  summaryItems,
  density = 'default',
  controlPosition = 'left',
}: RadioCardItemContentProps) {
  const isCompact = density === 'compact'
  const summaryText =
    summaryItems && summaryItems.length > 0
      ? summaryItems.join(RADIO_CARD_SUMMARY_SEPARATOR)
      : undefined

  return (
    <div className={radioCardRootLayoutVariants({ controlPosition, density })}>
      <span className={cn(radioCardControlVariants(), 'mt-0.5')} aria-hidden="true">
        <span className={radioCardIndicatorVariants()}>
          <Circle className="size-3 fill-primary text-primary" />
        </span>
      </span>
      <div className={radioCardBodyVariants({ density })}>
        <div className={radioCardTitleRowVariants()}>
          <span className={radioCardTitleVariants()}>{label}</span>
          {badge ? (
            <Badge variant="default" size="sm">
              {badge}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <span className={textVariants({ variant: 'small' })}>{description}</span>
        ) : null}
        {summaryText ? (
          <span className={cn(textVariants({ variant: 'small' }), radioCardSummaryVariants())}>
            {summaryText}
          </span>
        ) : null}
        {!isCompact && meta && meta.length > 0 ? (
          <ul className={radioCardMetaListVariants()} aria-hidden="true">
            {meta.map((chip) => (
              <li key={chip}>
                <Badge variant="secondary" size="sm">
                  {chip}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

const RadioCardItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioCardItemProps
>(
  (
    {
      className,
      label,
      description,
      badge,
      meta,
      summaryItems,
      density = 'default',
      controlPosition = 'left',
      disabled,
      ...props
    },
    ref,
  ) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={cn(radioCardVariants({ density }), className)}
      {...props}
    >
      <RadioCardItemContent
        label={label}
        description={description}
        badge={badge}
        meta={meta}
        summaryItems={summaryItems}
        density={density}
        controlPosition={controlPosition}
      />
    </RadioGroupPrimitive.Item>
  ),
)
RadioCardItem.displayName = 'RadioCardItem'

type RadioCardOptionWithDetailsProps = {
  option: RadioCardOption
  density: RadioCardDensity
  idPrefix: string
  selected: boolean
}

function RadioCardOptionWithDetails({
  option,
  density,
  idPrefix,
  selected,
}: RadioCardOptionWithDetailsProps) {
  const summaryText =
    option.summaryItems && option.summaryItems.length > 0
      ? option.summaryItems.join(RADIO_CARD_SUMMARY_SEPARATOR)
      : undefined
  const detailsLabel = option.detailsLabel ?? RADIO_CARD_DEFAULT_DETAILS_LABEL

  return (
    <div className={radioCardShellVariants({ density, selected })}>
      <div className={radioCardDetailsGridVariants({ density })}>
        <RadioGroupPrimitive.Item
          id={`${idPrefix}-${option.value}`}
          value={option.value}
          disabled={option.disabled}
          className={cn(radioCardItemWithDetailsVariants(), 'group')}
        >
          <span
            className={cn(radioCardControlVariants(), 'col-start-1 row-start-1 mt-0.5')}
            aria-hidden="true"
          >
            <span className={radioCardIndicatorVariants()}>
              <Circle className="size-3 fill-primary text-primary" />
            </span>
          </span>
          <div className={cn(radioCardTitleRowVariants(), 'col-start-2 row-start-1 min-w-0')}>
            <span className={radioCardTitleVariants()}>{option.label}</span>
            {option.badge ? (
              <Badge variant="default" size="sm">
                {option.badge}
              </Badge>
            ) : null}
          </div>
          {option.description ? (
            <span className={cn(textVariants({ variant: 'small' }), 'col-start-2 row-start-2')}>
              {option.description}
            </span>
          ) : null}
          {summaryText ? (
            <span
              className={cn(
                textVariants({ variant: 'small' }),
                radioCardSummaryVariants(),
                'col-start-2',
                option.description ? 'row-start-3' : 'row-start-2',
              )}
            >
              {summaryText}
            </span>
          ) : null}
        </RadioGroupPrimitive.Item>
        <div className={radioCardDetailsInlineSlotVariants()}>
          <RadioCardDetailsLink label={detailsLabel} onDetails={option.onDetails!} />
        </div>
      </div>
    </div>
  )
}

export interface RadioCardProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  options: RadioCardOption[]
  /** Prefix for generated option ids (used with `htmlFor` when embedding items separately). */
  idPrefix?: string
  density?: RadioCardDensity
  /** Horizontal placement of the decorative radio control within each card. */
  controlPosition?: 'left' | 'right'
}

/**
 * Card-style single-select built on Radix `RadioGroup`. Each option renders a
 * label, optional description, and optional meta chip list.
 */
function RadioCard({
  className,
  options,
  idPrefix = 'radio-card',
  density = 'default',
  controlPosition = 'left',
  value,
  ...props
}: RadioCardProps) {
  return (
    <RadioGroup className={cn('grid gap-3', className)} value={value} {...props}>
      {options.map((option) => {
        if (option.onDetails) {
          return (
            <RadioCardOptionWithDetails
              key={option.value}
              option={option}
              density={density}
              idPrefix={idPrefix}
              selected={value === option.value}
            />
          )
        }

        return (
          <RadioCardItem
            key={option.value}
            id={`${idPrefix}-${option.value}`}
            value={option.value}
            disabled={option.disabled}
            label={option.label}
            description={option.description}
            badge={option.badge}
            meta={option.meta}
            summaryItems={option.summaryItems}
            density={density}
            controlPosition={controlPosition}
          />
        )
      })}
    </RadioGroup>
  )
}

export { RadioCard, RadioCardItem, radioCardVariants }
