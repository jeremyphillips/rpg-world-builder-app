import type { EquipmentMagicItemSlot } from '@rpg/contracts'

import {
  EntityAnatomyHost,
  type EntityAnatomyTrailing,
  type EntitySummaryStatusItem,
} from '@/features/content'
import {
  Button,
  DividedStack,
  Panel,
  IconContainer,
  resourceIcon,
  type ContentCardDensity,
  type IconContainerSize,
  type ResourceIconRole,
} from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_RESOURCE_HEADING,
  formatEquipmentMagicItemSlotPresentation,
  type EquipmentBudgetGuidanceCopy,
} from './equipment-acquisition-guidance.lib'
export type EquipmentResourceSummaryAction = {
  label: string
  onClick: () => void
  variant: 'secondary' | 'outline'
}

export type EquipmentResourceSummaryProps = {
  density: ContentCardDensity
  currency?: EquipmentBudgetGuidanceCopy
  slots?: readonly EquipmentMagicItemSlot[]
  currencyAction?: EquipmentResourceSummaryAction
  magicItemsAction?: EquipmentResourceSummaryAction
}

const RESOURCE_ICON_SIZE: Record<ContentCardDensity, IconContainerSize> = {
  compact: 'xs',
  comfortable: 'sm',
  spacious: 'sm',
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

function resolveTrailingAction(
  action?: EquipmentResourceSummaryAction,
): EntityAnatomyTrailing | undefined {
  if (!action) return undefined
  return {
    kind: 'action',
    content: (
      <Button type="button" variant={action.variant} size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    ),
  }
}

function mapMagicItemSlotToStatus(slot: EquipmentMagicItemSlot): EntitySummaryStatusItem {
  const presentation = formatEquipmentMagicItemSlotPresentation(slot)
  if (slot.fulfilled) {
    return {
      kind: 'badge',
      label: presentation.accessibleName,
      appearance: 'soft',
      tone: 'neutral',
      leadingIcon: 'check',
    }
  }
  return {
    kind: 'badge',
    label: presentation.accessibleName,
    appearance: 'soft',
    tone: 'neutral',
  }
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
    <Panel tone="transparent" density={density === 'compact' ? 'compact' : 'comfortable'}>
      <DividedStack density={density}>
        {currency ? (
          <EntityAnatomyHost
            density={density}
            entity={{
              heading: currency.heading,
              supportingMetadata: currency.metadata,
              media: <ResourceGlyph role="currency" density={density} />,
            }}
            trailing={resolveTrailingAction(currencyAction)}
          />
        ) : null}
        {showMagic ? (
          <EntityAnatomyHost
            density={density}
            entity={{
              heading: EQUIPMENT_MAGIC_ITEMS_RESOURCE_HEADING,
              status: magicSlots.map(mapMagicItemSlotToStatus),
              media: <ResourceGlyph role="magicItem" density={density} />,
            }}
            trailing={resolveTrailingAction(magicItemsAction)}
          />
        ) : null}
      </DividedStack>
    </Panel>
  )
}
