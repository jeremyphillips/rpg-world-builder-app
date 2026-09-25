'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '../../lib/utils'
import {
  SelectionOptionCardAnatomy,
  type SelectionOptionCardCopyWidth,
  type SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import {
  optionCardEmbeddedSlotVariants,
  optionCardFooterSlotVariants,
} from './selection-option-card.variants'
import {
  radioCardLeadingControlTitleLineVariants,
  radioCardMediaSlotVariants,
  radioCardShellBodyVariants,
  radioCardShellItemVariants,
  radioCardShellVariants,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'
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
  copyWidth: SelectionOptionCardCopyWidth
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

function RadioOptionCardShellPrimaryRow({
  itemProps,
  anatomyProps,
  leadingControl,
  effectiveControlPosition,
  density,
  titleEndSlot,
}: {
  itemProps: RadioOptionCardItemProps
  anatomyProps: RadioOptionCardShellAnatomyProps
  leadingControl: React.ReactNode
  effectiveControlPosition: 'left' | 'right'
  density: SelectionOptionCardDensity
  titleEndSlot?: React.ReactNode
}) {
  const { clampDescription, summaryBadgeNode, reserveSummaryBadgeRow, ...anatomyRest } =
    anatomyProps

  const alignedLeadingControl = titleEndSlot ? (
    <div className={radioCardLeadingControlTitleLineVariants({ density })}>{leadingControl}</div>
  ) : (
    leadingControl
  )

  return (
    <RadioGroupPrimitive.Item
      {...itemProps}
      aria-label={anatomyRest.label}
      className={cn(radioCardShellItemVariants(), 'group', itemProps.className)}
    >
      <SelectionOptionCardAnatomy
        {...anatomyRest}
        density={density}
        leadingControl={alignedLeadingControl}
        controlPosition={effectiveControlPosition}
        titleEndSlot={titleEndSlot}
        summaryBadge={summaryBadgeNode}
        reserveSummaryBadgeRow={reserveSummaryBadgeRow}
        clampDescription={clampDescription}
        copyWidth={anatomyProps.copyWidth}
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
        <RadioOptionCardShellPrimaryRow
          itemProps={itemProps}
          anatomyProps={{ ...anatomyProps, density }}
          leadingControl={leadingControl}
          effectiveControlPosition={effectiveControlPosition}
          density={density}
          titleEndSlot={titleEndSlot}
        />
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
