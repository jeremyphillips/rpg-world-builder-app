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
  radioCardEmbeddedSlotVariants,
  radioCardGroupGapVariants,
  radioCardIndicatorVariants,
  radioCardItemWithDetailsVariants,
  radioCardMetaListVariants,
  radioCardRootLayoutVariants,
  radioCardShellVariants,
  radioCardSummaryLinesVariants,
  radioCardSummaryVariants,
  radioCardTitleMetaVariants,
  radioCardTitleRowVariants,
  radioCardTitleVariants,
  radioCardVariants,
} from './radio-card.variants'
import { textVariants } from './text.variants'

export const RADIO_CARD_DEFAULT_DETAILS_LABEL = 'Details'

export const RADIO_CARD_SUMMARY_SEPARATOR = ' · '

export type RadioCardDensity = 'default' | 'compact'

export type RadioCardVariant = 'card' | 'row'

export type RadioCardEmbeddedSlotTone = 'divider' | 'panel'

export interface RadioCardOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
  /** Optional badge rendered inline with the title (e.g. "Recommended"). */
  badge?: string
  /** Inline muted text immediately after the title (e.g. "Heritage required"). */
  titleMeta?: string
  meta?: string[]
  /** Compact density: trait names or other summary chips rendered inline. */
  summaryItems?: string[]
  /** Stacked muted lines below the title row (e.g. level-grouped grant summaries). */
  summaryLines?: string[]
  /** Rendered inside the card shell when this option is selected (e.g. dependent-choice flow). */
  embeddedContent?: React.ReactNode
  /** Visual treatment for the embedded region below the primary card row. */
  embeddedSlotTone?: RadioCardEmbeddedSlotTone
  onDetails?: () => void
  detailsLabel?: string
}

export interface RadioCardItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  label: string
  description?: string
  badge?: string
  titleMeta?: string
  meta?: string[]
  summaryItems?: string[]
  summaryLines?: string[]
  density?: RadioCardDensity
  variant?: RadioCardVariant
  /** Merged onto the option title label. */
  titleClassName?: string
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
  | 'label'
  | 'description'
  | 'badge'
  | 'titleMeta'
  | 'meta'
  | 'summaryItems'
  | 'summaryLines'
  | 'density'
  | 'variant'
  | 'titleClassName'
  | 'controlPosition'
>

function RadioCardTitleMeta({ titleMeta }: { titleMeta: string }) {
  return (
    <span className={cn(textVariants({ variant: 'small' }), radioCardTitleMetaVariants())}>
      {titleMeta}
    </span>
  )
}

function RadioCardSummaryLines({ summaryLines }: { summaryLines: string[] }) {
  return (
    <div className={radioCardSummaryLinesVariants()}>
      {summaryLines.map((line) => (
        <span
          key={line}
          className={cn(textVariants({ variant: 'small' }), radioCardSummaryVariants())}
        >
          {line}
        </span>
      ))}
    </div>
  )
}

function RadioCardControl({
  className,
  variant = 'card',
}: {
  className?: string
  variant?: RadioCardVariant
}) {
  return (
    <span
      className={cn(radioCardControlVariants({ variant }), 'mt-0.5', className)}
      aria-hidden="true"
    >
      <span className={radioCardIndicatorVariants()}>
        <Circle
          className={cn('fill-primary text-primary', variant === 'row' ? 'size-2.5' : 'size-3')}
        />
      </span>
    </span>
  )
}

type RadioCardTitleRowContentProps = {
  label: string
  titleMeta?: string
  badge?: string
  titleClassName?: string
}

function RadioCardTitleRowContent({
  label,
  titleMeta,
  badge,
  titleClassName,
}: RadioCardTitleRowContentProps) {
  return (
    <div className={radioCardTitleRowVariants()}>
      <span className={cn(radioCardTitleVariants(), titleClassName)}>{label}</span>
      {titleMeta ? <RadioCardTitleMeta titleMeta={titleMeta} /> : null}
      {badge ? (
        <Badge appearance="soft" tone="informative" size="sm">
          {badge}
        </Badge>
      ) : null}
    </div>
  )
}

type RadioCardSecondaryContentProps = {
  description?: string
  summaryText?: string
  summaryLines?: string[]
  meta?: string[]
  showMeta?: boolean
}

function RadioCardSecondaryContent({
  description,
  summaryText,
  summaryLines,
  meta,
  showMeta = false,
}: RadioCardSecondaryContentProps) {
  return (
    <>
      {description ? (
        <span className={textVariants({ variant: 'small' })}>{description}</span>
      ) : null}
      {summaryText ? (
        <span className={cn(textVariants({ variant: 'small' }), radioCardSummaryVariants())}>
          {summaryText}
        </span>
      ) : null}
      {summaryLines && summaryLines.length > 0 ? (
        <RadioCardSummaryLines summaryLines={summaryLines} />
      ) : null}
      {showMeta && meta && meta.length > 0 ? (
        <ul className={radioCardMetaListVariants()} aria-hidden="true">
          {meta.map((chip) => (
            <li key={chip}>
              <Badge appearance="neutral" tone="neutral" size="sm">
                {chip}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

function RadioCardItemContent({
  label,
  description,
  badge,
  titleMeta,
  meta,
  summaryItems,
  summaryLines,
  density = 'default',
  variant = 'card',
  titleClassName,
  controlPosition = 'left',
}: RadioCardItemContentProps) {
  const isCompact = density === 'compact'
  const summaryText =
    summaryItems && summaryItems.length > 0
      ? summaryItems.join(RADIO_CARD_SUMMARY_SEPARATOR)
      : undefined

  return (
    <div className={radioCardRootLayoutVariants({ controlPosition, density })}>
      <RadioCardControl variant={variant} />
      <div className={radioCardBodyVariants({ density })}>
        <RadioCardTitleRowContent
          label={label}
          titleMeta={titleMeta}
          badge={badge}
          titleClassName={titleClassName}
        />
        <RadioCardSecondaryContent
          description={description}
          summaryText={summaryText}
          summaryLines={summaryLines}
          meta={meta}
          showMeta={!isCompact}
        />
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
      titleMeta,
      meta,
      summaryItems,
      summaryLines,
      density = 'default',
      variant = 'card',
      titleClassName,
      controlPosition = 'left',
      disabled,
      ...props
    },
    ref,
  ) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={cn(radioCardVariants({ density, variant }), className)}
      {...props}
    >
      <RadioCardItemContent
        label={label}
        description={description}
        badge={badge}
        titleMeta={titleMeta}
        meta={meta}
        summaryItems={summaryItems}
        summaryLines={summaryLines}
        density={density}
        variant={variant}
        titleClassName={titleClassName}
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
          <RadioCardControl variant="card" className="col-start-1 row-start-1" />
          <div
            className={cn(radioCardBodyVariants({ density }), 'col-start-2 row-start-1 min-w-0')}
          >
            <RadioCardTitleRowContent
              label={option.label}
              titleMeta={option.titleMeta}
              badge={option.badge}
            />
            <RadioCardSecondaryContent
              description={option.description}
              summaryText={summaryText}
              summaryLines={option.summaryLines}
            />
          </div>
        </RadioGroupPrimitive.Item>
        <div className={radioCardDetailsInlineSlotVariants()}>
          <RadioCardDetailsLink label={detailsLabel} onDetails={option.onDetails!} />
        </div>
      </div>
      {selected && option.embeddedContent ? (
        <div
          className={radioCardEmbeddedSlotVariants({
            density,
            tone: option.embeddedSlotTone ?? 'divider',
          })}
        >
          {option.embeddedContent}
        </div>
      ) : null}
    </div>
  )
}

export interface RadioCardProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  options: RadioCardOption[]
  /** Prefix for generated option ids (used with `htmlFor` when embedding items separately). */
  idPrefix?: string
  variant?: RadioCardVariant
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
  variant = 'card',
  density = 'default',
  controlPosition = 'left',
  value,
  ...props
}: RadioCardProps) {
  return (
    <RadioGroup
      className={cn(radioCardGroupGapVariants({ variant }), className)}
      value={value}
      {...props}
    >
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
            titleMeta={option.titleMeta}
            meta={option.meta}
            summaryItems={option.summaryItems}
            summaryLines={option.summaryLines}
            density={density}
            variant={variant}
            controlPosition={controlPosition}
          />
        )
      })}
    </RadioGroup>
  )
}

export { RadioCard, RadioCardItem, radioCardVariants }
