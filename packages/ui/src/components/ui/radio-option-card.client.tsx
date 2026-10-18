'use client'

import * as React from 'react'
import { Info } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { Button } from './button.client'
import { cardSurfaceVariants, type CardSurfaceTone } from './card.variants'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import { DisclosureChevronTrigger } from './disclosure-chevron-trigger.client'
import {
  SelectionOptionCardAnatomy,
  SelectionOptionCardTitleMeta,
  type SelectionOptionCardCopyWidth,
  type SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import { RadioOptionCardLeadingControl } from './radio-option-card-controls.client'
import {
  radioCardDetailsActionVariants,
  radioCardGroupItemRowClasses,
  radioCardLeadingControlTitleLineVariants,
  radioCardMediaSlotClasses,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'
import { useRadioGroupItemSelected } from './radio-group.client'
import {
  SelectionTarget,
  SelectionTargetRadio,
  SelectionTargetRaised,
} from './selection-target.client'
import {
  optionCardDensityBodyLayoutVariants,
  optionCardDensityContentGapVariants,
  optionCardEmbeddedSlotVariants,
  optionCardFooterSlotVariants,
} from './selection-option-card.variants'

export type RadioOptionCardEmbeddedSlotTone = 'divider' | 'panel' | 'plain'

export type RadioOptionCardSummaryBadge = {
  label: string
  tooltip?: string
}

export type RadioOptionCardProps = {
  id?: string
  value: string
  disabled?: boolean
  label: string
  description?: string
  summaryItems?: string[]
  summaryLines?: string[]
  summaryContent?: React.ReactNode
  density?: SelectionOptionCardDensity
  variant?: RadioCardVariant
  visualControl?: RadioCardVisualControl
  icon?: React.ReactNode
  titleAdornment?: React.ReactNode
  embedded?: React.ReactNode
  footer?: React.ReactNode
  embeddedTone?: RadioOptionCardEmbeddedSlotTone
  media?: React.ReactNode
  summaryBadge?: RadioOptionCardSummaryBadge
  reserveSummaryBadgeRow?: boolean
  copyWidth?: SelectionOptionCardCopyWidth
  details?: React.ReactNode
  onDetails?: () => void
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  /** Card chrome ladder; defaults to strong for standalone choice cards. */
  tone?: CardSurfaceTone
}

function resolveRadioCardDetailsAriaLabel(label: string): string {
  return `View ${label} details`
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

function RadioOptionCardDetailsAction({
  ariaLabel,
  onDetails,
}: {
  ariaLabel: string
  onDetails: () => void
}) {
  return (
    <SelectionTargetRaised>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger interactive asChild>
            <Button
              type="button"
              variant="text"
              tone="neutral"
              size="sm"
              density="compact"
              className={radioCardDetailsActionVariants()}
              aria-label={ariaLabel}
              onClick={onDetails}
            >
              <Info aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View details</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SelectionTargetRaised>
  )
}

function resolveRadioOptionCardTitleEndSlot(
  label: string,
  details: React.ReactNode | undefined,
  onDetails: (() => void) | undefined,
): React.ReactNode {
  if (details) {
    return <DisclosureChevronTrigger label={`${label} details`} />
  }
  if (onDetails) {
    return (
      <RadioOptionCardDetailsAction
        ariaLabel={resolveRadioCardDetailsAriaLabel(label)}
        onDetails={onDetails}
      />
    )
  }
  return undefined
}

function resolveRadioOptionCardShellClassName({
  variant,
  density,
  tone,
  selected,
  disabled,
  media,
  className,
}: {
  variant: RadioCardVariant
  density: SelectionOptionCardDensity
  tone: CardSurfaceTone
  selected: boolean
  disabled?: boolean
  media?: React.ReactNode
  className?: string
}): string {
  if (variant === 'row') {
    return cn(
      radioCardGroupItemRowClasses({ density }),
      'group ui-radio-card ui-radio-card--row',
      selected && 'ui-interactive-row--selected-bordered',
      disabled && 'opacity-50',
      className,
    )
  }

  return cn(
    cardSurfaceVariants({
      tone,
      interactive: !disabled,
      selected,
      disabled,
    }),
    'group ui-radio-card',
    density === 'compact' ? 'ui-radio-card--compact' : 'ui-radio-card--default',
    media && 'ui-radio-card--media',
    className,
  )
}

type RadioOptionCardInteriorProps = Pick<
  RadioOptionCardProps,
  | 'id'
  | 'value'
  | 'label'
  | 'description'
  | 'summaryItems'
  | 'summaryLines'
  | 'summaryContent'
  | 'density'
  | 'variant'
  | 'visualControl'
  | 'icon'
  | 'titleAdornment'
  | 'embedded'
  | 'footer'
  | 'embeddedTone'
  | 'media'
  | 'summaryBadge'
  | 'reserveSummaryBadgeRow'
  | 'copyWidth'
  | 'details'
  | 'onDetails'
  | 'disabled'
  | 'onClick'
> & {
  selected: boolean
}

function RadioOptionCardBodyExtras({
  density,
  embeddedTone,
  selected,
  embedded,
  footer,
}: Pick<
  RadioOptionCardInteriorProps,
  'density' | 'embeddedTone' | 'selected' | 'embedded' | 'footer'
>) {
  return (
    <>
      {selected && embedded ? (
        <div
          className={cn(
            'ui-radio-card__embedded',
            optionCardEmbeddedSlotVariants({ density, tone: embeddedTone }),
          )}
        >
          {embedded}
        </div>
      ) : null}
      {footer ? (
        <div className={cn('ui-radio-card__footer', optionCardFooterSlotVariants({ density }))}>
          {footer}
        </div>
      ) : null}
    </>
  )
}

function RadioOptionCardPrimaryRow(props: RadioOptionCardInteriorProps) {
  const {
    id,
    value,
    label,
    description,
    summaryItems,
    summaryLines,
    summaryContent,
    density = 'default',
    variant = 'card',
    visualControl = 'radio',
    icon,
    titleAdornment,
    media,
    summaryBadge,
    reserveSummaryBadgeRow = false,
    copyWidth = 'fill',
    details,
    onDetails,
    disabled,
    onClick,
  } = props

  const summaryBadgeNode = summaryBadge ? (
    <RadioOptionCardSummaryBadgeSlot badge={summaryBadge} />
  ) : null

  const leadingIndicator =
    visualControl === 'icon' && icon ? (
      <RadioOptionCardLeadingControl
        visualControl="icon"
        icon={icon}
        variant={variant}
        density={density}
      />
    ) : undefined

  const titleEndSlot = resolveRadioOptionCardTitleEndSlot(label, details, onDetails)

  const leadingControl = (
    <SelectionTargetRadio
      id={id}
      value={value}
      disabled={disabled}
      indicator={leadingIndicator}
      aria-label={label}
      aria-describedby={description ? `${id}-description` : undefined}
      onClick={onClick}
    />
  )

  return (
    <SelectionOptionCardAnatomy
      density={density}
      leadingControl={
        variant === 'card' ? (
          <div
            className={radioCardLeadingControlTitleLineVariants({
              density,
              titleEnd: titleEndSlot != null,
            })}
          >
            {leadingControl}
          </div>
        ) : (
          leadingControl
        )
      }
      leadingMedia={variant === 'row' ? media : undefined}
      label={label}
      titleAdornment={titleAdornment}
      titleEndSlot={titleEndSlot}
      description={description}
      summaryItems={summaryItems}
      summaryLines={summaryLines}
      summaryContent={summaryContent}
      summaryBadge={summaryBadgeNode}
      reserveSummaryBadgeRow={reserveSummaryBadgeRow || summaryBadge != null}
      copyWidth={copyWidth}
    />
  )
}

function RadioOptionCardInterior(props: RadioOptionCardInteriorProps) {
  const {
    id,
    density = 'default',
    variant = 'card',
    media,
    embedded,
    footer,
    embeddedTone,
    selected,
  } = props
  const showCardMedia = Boolean(media && variant === 'card')

  return (
    <SelectionTarget htmlFor={id}>
      {showCardMedia ? (
        <div className={cn('ui-radio-card__media', radioCardMediaSlotClasses)}>{media}</div>
      ) : null}
      <div
        className={cn(
          'ui-radio-card__body',
          optionCardDensityBodyLayoutVariants({ density }),
          optionCardDensityContentGapVariants({ density }),
          showCardMedia && 'flex min-h-0 flex-1 flex-col',
        )}
      >
        <RadioOptionCardPrimaryRow {...props} />
        <RadioOptionCardBodyExtras
          density={density}
          embeddedTone={embeddedTone}
          selected={selected}
          embedded={embedded}
          footer={footer}
        />
      </div>
    </SelectionTarget>
  )
}

export const RadioOptionCard = React.forwardRef<HTMLDivElement, RadioOptionCardProps>(
  (props, ref) => {
    const {
      className,
      density = 'default',
      variant = 'card',
      details,
      disabled,
      value,
      id,
      media,
      tone = 'strong',
    } = props
    const selected = useRadioGroupItemSelected(value)
    const detailsBodyId = details && id ? `${id}-details` : undefined
    const shellClassName = resolveRadioOptionCardShellClassName({
      variant,
      density,
      tone,
      selected,
      disabled,
      media,
      className,
    })
    const cardInterior = <RadioOptionCardInterior {...props} selected={selected} />

    if (details) {
      return (
        <Collapsible>
          <div ref={ref} className={shellClassName} data-disabled={disabled ? true : undefined}>
            {cardInterior}
            <CollapsibleContent id={detailsBodyId} className="ui-radio-card__details">
              {details}
            </CollapsibleContent>
          </div>
        </Collapsible>
      )
    }

    return (
      <div ref={ref} className={shellClassName} data-disabled={disabled ? true : undefined}>
        {cardInterior}
      </div>
    )
  },
)
RadioOptionCard.displayName = 'RadioOptionCard'

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
