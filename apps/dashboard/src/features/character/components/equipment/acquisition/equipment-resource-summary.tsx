import type { ReactNode } from 'react'
import type { EquipmentMagicItemSlot } from '@rpg/contracts'

import {
  Badge,
  Button,
  Heading,
  IconContainer,
  InlineMetadata,
  StatusIcon,
  cn,
  contentCardRootVariants,
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
  equipmentResourceSummaryMetadataClasses,
  equipmentResourceSummaryResourceRowClasses,
  equipmentResourceSummaryRowVariants,
  equipmentResourceSummarySectionDividerClasses,
  equipmentResourceSummarySlotStatusClasses,
  equipmentResourceSummaryStackClasses,
} from './equipment-resource-summary.variants'

export type EquipmentResourceSummaryAction = {
  label: string
  onClick: () => void
}

export type EquipmentResourceSummaryProps = {
  density: ContentCardDensity
  currency?: {
    heading: string
    subheading: string
  }
  slots?: readonly EquipmentMagicItemSlot[]
  action?: EquipmentResourceSummaryAction
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
    <Heading variant="group" as="h3">
      {children}
    </Heading>
  )
}

function ResourceSummaryRow({
  density,
  media,
  heading,
  subheading,
  metadata,
}: {
  density: ContentCardDensity
  media: ReactNode
  heading: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
}) {
  return (
    <div className={equipmentResourceSummaryResourceRowClasses({ density })}>
      <div className="shrink-0">{media}</div>
      <div className="min-w-0 flex-1">
        {heading}
        {subheading ? (
          <div className={equipmentResourceSummaryDescriptionClasses}>{subheading}</div>
        ) : null}
        {metadata ? (
          <div className={equipmentResourceSummaryMetadataClasses}>
            <div className={equipmentResourceSummaryBadgeListClasses}>{metadata}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function EquipmentMagicItemSlotBadge({
  slot,
  density,
}: {
  slot: EquipmentMagicItemSlot
  density: ContentCardDensity
}) {
  const presentation = formatEquipmentMagicItemSlotPresentation(slot)
  const metaDensity = density === 'compact' ? 'compact' : 'comfortable'

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
        <InlineMetadata role="heading" density={metaDensity} wrap={false}>
          <InlineMetadata.Item>{presentation.lead}</InlineMetadata.Item>
          <InlineMetadata.Item>{presentation.detail}</InlineMetadata.Item>
        </InlineMetadata>
      )}
    </Badge>
  )
}

export function EquipmentResourceSummary({
  density,
  currency,
  slots,
  action,
}: EquipmentResourceSummaryProps) {
  const magicSlots = slots ?? []
  const showMagic = magicSlots.length > 0
  if (!currency && !showMagic) return null

  const showBoth = Boolean(currency) && showMagic

  return (
    <article
      className={cn(
        contentCardRootVariants({ density, chrome: 'standalone' }),
        resolveSurfaceClasses({ emphasis: 'faint' }),
        equipmentResourceSummaryRowVariants({ alignment: showBoth ? 'center' : 'start' }),
      )}
    >
      <div className={equipmentResourceSummaryStackClasses}>
        {currency ? (
          <ResourceSummaryRow
            density={density}
            media={<ResourceGlyph role="currency" density={density} />}
            heading={<ResourceSummaryHeading>{currency.heading}</ResourceSummaryHeading>}
            subheading={currency.subheading}
          />
        ) : null}
        {showMagic ? (
          <div className={currency ? equipmentResourceSummarySectionDividerClasses : undefined}>
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
                  density={density}
                />
              ))}
            />
          </div>
        ) : null}
      </div>
      {action ? (
        <Button type="button" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </article>
  )
}
