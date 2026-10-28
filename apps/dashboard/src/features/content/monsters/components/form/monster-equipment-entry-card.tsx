import { resolveCreatureArmorSlot, type Equipment } from '@rpg/contracts'
import { ActionIcon, iconGhostControlVariants } from '@rpg/ui'

import { EquipmentQuantityStepper } from '@/features/character'
import { EntityCard } from '@/features/content'

import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'
import type { MonsterEquipmentFormEntry } from '../../lib/monster-form-values'
import { MonsterEquipmentEquippedToggle } from './monster-equipment-equipped-toggle'

export type MonsterEquipmentEntryCardProps = {
  entry: MonsterEquipmentFormEntry
  item: Equipment | undefined
  label: string
  equipped: boolean
  supportingMetadata: readonly string[]
  status: readonly EntitySummaryStatusItem[]
  onEquippedChange: (equipped: boolean) => void
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  onCustomize: () => void
}

export function MonsterEquipmentEntryCard({
  entry,
  item,
  label,
  equipped,
  supportingMetadata,
  status,
  onEquippedChange,
  onQuantityChange,
  onRemove,
  onCustomize,
}: MonsterEquipmentEntryCardProps) {
  const slotItem = resolveCreatureArmorSlot(item) !== undefined
  return (
    <EntityCard
      density="compact"
      headingInline={
        <MonsterEquipmentEquippedToggle
          displayName={label}
          checked={equipped}
          onCheckedChange={onEquippedChange}
        />
      }
      entity={{
        heading: label,
        ...(supportingMetadata.length > 0 ? { supportingMetadata: [...supportingMetadata] } : {}),
        ...(status.length > 0 ? { status, statusComposition: 'metadata' as const } : {}),
      }}
      trailing={{
        kind: 'utility',
        content: (
          <div className="flex items-center gap-1">
            {slotItem ? (
              <button
                type="button"
                className={iconGhostControlVariants({ hover: 'destructive', layout: 'flex' })}
                aria-label={`Remove ${label}`}
                onClick={onRemove}
              >
                <ActionIcon action="remove" size="lg" />
              </button>
            ) : (
              <EquipmentQuantityStepper
                size="sm"
                digits={2}
                value={entry.quantity ?? 1}
                min={1}
                max={999}
                ariaLabel={`Quantity of ${label}`}
                remove={{
                  ariaLabel: `Remove ${label}`,
                  onRemove,
                }}
                onChange={onQuantityChange}
              />
            )}
            {item ? (
              <button
                type="button"
                className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
                aria-label={`Customize ${label}`}
                onClick={onCustomize}
              >
                <ActionIcon action="edit" size="lg" />
              </button>
            ) : null}
          </div>
        ),
      }}
    />
  )
}
