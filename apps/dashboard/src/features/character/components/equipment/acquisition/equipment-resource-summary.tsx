import type { EquipmentMagicItemSlot } from '@rpg/contracts'
import { Check } from 'lucide-react'

import {
  Badge,
  Button,
  ContentCardBody,
  Heading,
  IconContainer,
  InlineMetadata,
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
  equipmentResourceSummaryRowVariants,
  equipmentResourceSummarySectionDividerClasses,
  equipmentResourceSummarySlotCheckClasses,
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
      <InlineMetadata role="heading" density={metaDensity} wrap={false}>
        <InlineMetadata.Item>{presentation.lead}</InlineMetadata.Item>
        <InlineMetadata.Item>
          {slot.fulfilled ? (
            <Check className={equipmentResourceSummarySlotCheckClasses} aria-hidden />
          ) : (
            presentation.detail
          )}
        </InlineMetadata.Item>
      </InlineMetadata>
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
          <ContentCardBody
            density={density}
            media={<ResourceGlyph role="currency" density={density} />}
            heading={
              <Heading variant="subsection" as="h3">
                {currency.heading}
              </Heading>
            }
            subheading={currency.subheading}
          />
        ) : null}
        {showMagic ? (
          <div className={currency ? equipmentResourceSummarySectionDividerClasses : undefined}>
            <ContentCardBody
              density={density}
              media={<ResourceGlyph role="magicItem" density={density} />}
              heading={
                <Heading variant="subsection" as="h3">
                  {EQUIPMENT_MAGIC_ITEMS_RESOURCE_HEADING}
                </Heading>
              }
              metadata={
                <div className={equipmentResourceSummaryBadgeListClasses}>
                  {magicSlots.map((slot) => (
                    <EquipmentMagicItemSlotBadge
                      key={`${slot.rarityMode}:${slot.rarity}`}
                      slot={slot}
                      density={density}
                    />
                  ))}
                </div>
              }
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
