import type { ReactNode } from 'react'
import type { EquipmentMagicItemSlot } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import {
  Badge,
  Button,
  Heading,
  IconContainer,
  StatusIcon,
  cn,
  contentCardBodyVariants,
  contentCardHeadingRowVariants,
  contentCardMediaEndGapVariants,
  contentCardMetadataVariants,
  contentCardRootVariants,
  contentCardSubheadingVariants,
  resolveContentCardBodyCrossAxis,
  resolveContentCardHeadingRowRhythm,
  resolveSurfaceClasses,
  resourceIcon,
  type ContentCardDensity,
  type IconContainerSize,
  type ResourceIconRole,
} from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_RESOURCE_HEADING,
  formatEquipmentMagicItemSlotPresentation,
} from './equipment-acquisition-guidance.lib'
import {
  equipmentResourceSummaryBadgeListClasses,
  equipmentResourceSummaryDescriptionClasses,
  equipmentResourceSummaryHeadingClasses,
  equipmentResourceSummarySectionDividerVariants,
  equipmentResourceSummarySlotStatusClasses,
  equipmentResourceSummaryStackClasses,
} from './equipment-resource-summary.variants'

export type EquipmentResourceSummaryAction = {
  label: string
  onClick: () => void
  variant: 'secondary' | 'outline'
}

export type EquipmentResourceSummaryProps = {
  density: ContentCardDensity
  currency?: {
    heading: string
    subheading: string
  }
  slots?: readonly EquipmentMagicItemSlot[]
  currencyAction?: EquipmentResourceSummaryAction
  magicItemsAction?: EquipmentResourceSummaryAction
}

const RESOURCE_ICON_SIZE: Record<ContentCardDensity, IconContainerSize> = {
  compact: 'xs',
  comfortable: 'sm',
}

const CurrencyIcon = resourceIcon('currency')
const MagicItemIcon = resourceIcon('magicItem')

function ResourceGlyph({ role, density }: { role: ResourceIconRole; density: ContentCardDensity }) {
  return (
    <IconContainer shape="box" size={RESOURCE_ICON_SIZE[density]}>
      {role === 'currency' ? <CurrencyIcon /> : <MagicItemIcon />}
    </IconContainer>
  )
}

function ResourceSummaryHeading({ children }: { children: ReactNode }) {
  return (
    <Heading variant="group" as="h3" className={equipmentResourceSummaryHeadingClasses}>
      {children}
    </Heading>
  )
}

function ResourceSummaryAction({ action }: { action: EquipmentResourceSummaryAction }) {
  return (
    <Button type="button" variant={action.variant} size="sm" onClick={action.onClick}>
      {action.label}
    </Button>
  )
}

function ResourceSummaryRow({
  density,
  media,
  heading,
  subheading,
  metadata,
  action,
}: {
  density: ContentCardDensity
  media: ReactNode
  heading: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
  action?: EquipmentResourceSummaryAction
}) {
  const hasSecondaryText = Boolean(subheading || metadata)
  const crossAxis = resolveContentCardBodyCrossAxis(hasSecondaryText)
  const headingRowRhythm = resolveContentCardHeadingRowRhythm({
    hasSecondaryText,
    hasHeadingEndSlot: false,
  })

  return (
    <div className={contentCardBodyVariants({ density, crossAxis })}>
      {media ? (
        <div className={cn('shrink-0', contentCardMediaEndGapVariants({ density }))}>{media}</div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className={contentCardHeadingRowVariants({ rhythm: headingRowRhythm })}>
          <div className="min-w-0 flex-1">{heading}</div>
        </div>
        {subheading ? (
          <div className={contentCardSubheadingVariants({ density })}>
            <div className={equipmentResourceSummaryDescriptionClasses}>{subheading}</div>
          </div>
        ) : null}
        {metadata ? (
          <div className={contentCardMetadataVariants({ density })}>
            <div className={equipmentResourceSummaryBadgeListClasses}>{metadata}</div>
          </div>
        ) : null}
      </div>
      {action ? (
        <div className="shrink-0 self-center">
          <ResourceSummaryAction action={action} />
        </div>
      ) : null}
    </div>
  )
}

function EquipmentMagicItemSlotBadge({ slot }: { slot: EquipmentMagicItemSlot }) {
  const presentation = formatEquipmentMagicItemSlotPresentation(slot)

  return (
    <Badge
      appearance="soft"
      tone="neutral"
      size="sm"
      emphasis={slot.fulfilled ? 'subdued' : 'default'}
      aria-label={presentation.accessibleName}
    >
      {slot.fulfilled ? (
        <>
          {presentation.lead}
          <StatusIcon
            variant="ready"
            size="sm"
            tooltip={false}
            className={equipmentResourceSummarySlotStatusClasses}
          />
        </>
      ) : (
        joinInlineMetadata([presentation.lead, presentation.detail])
      )}
    </Badge>
  )
}

export function EquipmentResourceSummary({
  density,
  currency,
  slots,
  currencyAction,
  magicItemsAction,
}: EquipmentResourceSummaryProps) {
  const magicSlots = slots ?? []
  const showMagic = magicSlots.length > 0
  if (!currency && !showMagic) return null

  return (
    <article
      className={cn(
        contentCardRootVariants({ density, chrome: 'standalone' }),
        resolveSurfaceClasses({ emphasis: 'faint' }),
      )}
    >
      <div className={equipmentResourceSummaryStackClasses}>
        {currency ? (
          <ResourceSummaryRow
            density={density}
            media={<ResourceGlyph role="currency" density={density} />}
            heading={<ResourceSummaryHeading>{currency.heading}</ResourceSummaryHeading>}
            subheading={currency.subheading}
            action={currencyAction}
          />
        ) : null}
        {showMagic ? (
          <div
            className={
              currency ? equipmentResourceSummarySectionDividerVariants({ density }) : undefined
            }
          >
            <ResourceSummaryRow
              density={density}
              media={<ResourceGlyph role="magicItem" density={density} />}
              heading={
                <ResourceSummaryHeading>
                  {EQUIPMENT_MAGIC_ITEMS_RESOURCE_HEADING}
                </ResourceSummaryHeading>
              }
              metadata={magicSlots.map((slot) => (
                <EquipmentMagicItemSlotBadge
                  key={`${slot.rarityMode}:${slot.rarity}`}
                  slot={slot}
                />
              ))}
              action={magicItemsAction}
            />
          </div>
        ) : null}
      </div>
    </article>
  )
}
