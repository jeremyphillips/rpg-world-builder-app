'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '../../lib/utils'
import {
  SelectionOptionCardAnatomy,
  type SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import {
  optionCardBodyVariants,
  optionCardEmbeddedSlotVariants,
  optionCardFooterSlotVariants,
} from './selection-option-card.variants'
import {
  radioCardDetailsGridVariants,
  radioCardDetailsInlineSlotVariants,
  radioCardItemWithDetailsVariants,
  radioCardMediaSlotVariants,
  radioCardShellBodyVariants,
  radioCardShellItemVariants,
  radioCardShellVariants,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'
import { RadioOptionCardLeadingControl } from './radio-option-card-controls.client'
export type RadioOptionCardEmbeddedSlotTone = 'divider' | 'panel'

type RadioOptionCardItemProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>

type RadioOptionCardShellAnatomyProps = {
  density: SelectionOptionCardDensity
  label: string
  titleAdornment?: React.ReactNode
  description?: string
  summaryItems?: string[]
  summaryLines?: string[]
  titleClassName?: string
  summaryBadgeNode: React.ReactNode
  reserveSummaryBadgeRow: boolean
  clampDescription: boolean
}

type RadioOptionCardShellLayoutProps = RadioOptionCardShellAnatomyProps & {
  itemProps: RadioOptionCardItemProps
  visualControl: RadioCardVisualControl
  icon?: React.ReactNode
  variant: RadioCardVariant
  leadingControl: React.ReactNode
  effectiveControlPosition: 'left' | 'right'
  titleEndSlot?: React.ReactNode
  embedded?: React.ReactNode
  footer?: React.ReactNode
  embeddedTone: RadioOptionCardEmbeddedSlotTone
  showEmbedded: boolean
  media?: React.ReactNode
  mediaSlot: React.ReactNode
  shellSelected: boolean
}

export function RadioOptionCardMediaSlot({
  media,
  id,
  disabled,
}: {
  media: React.ReactNode
  id?: string
  disabled?: boolean
}) {
  if (id && !disabled) {
    return (
      <label htmlFor={id} className={cn(radioCardMediaSlotVariants(), 'block cursor-pointer')}>
        {media}
      </label>
    )
  }

  return <div className={radioCardMediaSlotVariants()}>{media}</div>
}

function RadioOptionCardDetailsShellRow({
  itemProps,
  anatomyProps,
  visualControl,
  icon,
  variant,
  density,
  titleEndSlot,
}: {
  itemProps: RadioOptionCardItemProps
  anatomyProps: RadioOptionCardShellAnatomyProps
  visualControl: RadioCardVisualControl
  icon?: React.ReactNode
  variant: RadioCardVariant
  density: SelectionOptionCardDensity
  titleEndSlot: React.ReactNode
}) {
  const { clampDescription, summaryBadgeNode, reserveSummaryBadgeRow, ...anatomyRest } =
    anatomyProps

  return (
    <div className={radioCardDetailsGridVariants({ density })}>
      <RadioGroupPrimitive.Item
        {...itemProps}
        aria-label={anatomyRest.label}
        className={cn(radioCardItemWithDetailsVariants(), 'group', itemProps.className)}
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
            clampDescription && 'flex min-h-0 flex-1 flex-col',
          )}
        >
          <SelectionOptionCardAnatomy
            {...anatomyRest}
            density={density}
            summaryBadge={summaryBadgeNode}
            reserveSummaryBadgeRow={reserveSummaryBadgeRow}
            clampDescription={clampDescription}
          />
        </div>
      </RadioGroupPrimitive.Item>
      <div className={radioCardDetailsInlineSlotVariants()}>{titleEndSlot}</div>
    </div>
  )
}

function RadioOptionCardShellPrimaryRow({
  itemProps,
  anatomyProps,
  leadingControl,
  effectiveControlPosition,
  density,
}: {
  itemProps: RadioOptionCardItemProps
  anatomyProps: RadioOptionCardShellAnatomyProps
  leadingControl: React.ReactNode
  effectiveControlPosition: 'left' | 'right'
  density: SelectionOptionCardDensity
}) {
  const { clampDescription, summaryBadgeNode, reserveSummaryBadgeRow, ...anatomyRest } =
    anatomyProps

  return (
    <RadioGroupPrimitive.Item
      {...itemProps}
      aria-label={anatomyRest.label}
      className={cn(radioCardShellItemVariants(), 'group', itemProps.className)}
    >
      <SelectionOptionCardAnatomy
        {...anatomyRest}
        density={density}
        leadingControl={leadingControl}
        controlPosition={effectiveControlPosition}
        summaryBadge={summaryBadgeNode}
        reserveSummaryBadgeRow={reserveSummaryBadgeRow}
        clampDescription={clampDescription}
      />
    </RadioGroupPrimitive.Item>
  )
}

export function RadioOptionCardShellLayout({
  itemProps,
  visualControl,
  icon,
  variant,
  density,
  leadingControl,
  effectiveControlPosition,
  titleEndSlot,
  embedded,
  footer,
  embeddedTone,
  showEmbedded,
  media,
  mediaSlot,
  shellSelected,
  ...anatomyProps
}: RadioOptionCardShellLayoutProps) {
  return (
    <div
      className={radioCardShellVariants({
        hasMedia: !!media,
        selected: shellSelected,
      })}
    >
      {mediaSlot}
      <div
        className={cn(
          radioCardShellBodyVariants({ density }),
          media && 'flex min-h-0 flex-1 flex-col',
        )}
      >
        {titleEndSlot ? (
          <RadioOptionCardDetailsShellRow
            itemProps={itemProps}
            anatomyProps={{ ...anatomyProps, density }}
            visualControl={visualControl}
            icon={icon}
            variant={variant}
            density={density}
            titleEndSlot={titleEndSlot}
          />
        ) : (
          <RadioOptionCardShellPrimaryRow
            itemProps={itemProps}
            anatomyProps={{ ...anatomyProps, density }}
            leadingControl={leadingControl}
            effectiveControlPosition={effectiveControlPosition}
            density={density}
          />
        )}
        {showEmbedded && embedded ? (
          <div className={optionCardEmbeddedSlotVariants({ density, tone: embeddedTone })}>
            {embedded}
          </div>
        ) : null}
        {footer ? <div className={optionCardFooterSlotVariants({ density })}>{footer}</div> : null}
      </div>
    </div>
  )
}
