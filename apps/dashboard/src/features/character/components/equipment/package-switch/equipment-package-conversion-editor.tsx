import { useEffect, useId, useRef } from 'react'

import {
  buildStartingPackageConversionPreview,
  canConvertStartingPackageToGold,
  copperToWealth,
  formatInlineWealth,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type ResolvedStartingEquipmentFunding,
  type StartingPackageConversionItem,
  type StartingPackageConversionPreview,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import { Button, Checkbox, Eyebrow, Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'
import { useEquipmentSelectionFacts } from '../../../hooks/use-equipment-selection-facts'
import { resolveEquipmentConversionItemPresentation } from '../../../lib/equipment/equipment-selection-facts.lib'
import type { StartingPackageInventoryGroup } from '../../../lib/equipment/equipment-step.lib'
import { resolveSelectionRowStatusItems } from '../../../lib/selection-row-status'
import { buildEquipmentInventoryRowEntity } from '../inventory/equipment-inventory-entity.lib'
import { equipmentInventoryRowListClasses } from '../inventory/equipment-inventory.variants'
import {
  equipmentPackageConversionBudgetClasses,
  equipmentPackageConversionCategoryClasses,
  equipmentPackageConversionEditorActionsClasses,
  equipmentPackageConversionEditorBodyClasses,
  equipmentPackageConversionEditorClasses,
  equipmentPackageConversionEditorDescriptionClasses,
  equipmentPackageConversionEditorListClasses,
  equipmentPackageConversionStatusClasses,
} from '../starting-package/equipment-starting-package.variants'

export type EquipmentPackageConversionEditorProps = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  departingOptionId: string
  packageGroup: StartingPackageInventoryGroup
  targetFunding: ResolvedStartingEquipmentFunding
  selectedPackageItemKeys: ReadonlySet<string>
  editorId?: string
  commitStatusMessage?: string
  onSelectedPackageItemKeysChange: (keys: ReadonlySet<string>) => void
  onCancel: () => void
  onCommit: (preview: StartingPackageConversionPreview) => void
}

function formatConversionBudgetLine(preview: StartingPackageConversionPreview): string {
  const remaining = formatInlineWealth(copperToWealth(preview.budget.remainingCp))
  const starting = formatInlineWealth(copperToWealth(preview.budget.startingCp))
  const spent = formatInlineWealth(
    copperToWealth(preview.budget.existingPurchaseCostCp + preview.budget.selectedConversionCostCp),
  )

  return joinInlineMetadata([`${remaining} remaining`, `${starting} starting`, `${spent} spent`])
}

function formatConversionItemValueLabel(item: StartingPackageConversionItem): string | undefined {
  if (item.pricing.status !== 'priced') return undefined
  const totalCp = item.pricing.unitCostCp * item.purchaseQuantity
  if (totalCp <= 0) return undefined
  return `${formatInlineWealth(copperToWealth(totalCp))} value`
}

function groupConversionItems(
  items: readonly StartingPackageConversionItem[],
  packageGroup: StartingPackageInventoryGroup,
): Array<{ groupLabel: string; items: StartingPackageConversionItem[] }> {
  const byKey = new Map(items.map((item) => [item.packageItemKey, item]))
  const used = new Set<string>()

  const groups = packageGroup.categoryGroups
    .map((category) => {
      const grouped = category.rows.flatMap((row) => {
        const key =
          row.removeTarget?.kind === 'package' ? row.removeTarget.packageItemKey : undefined
        if (!key) return []
        const item = byKey.get(key)
        if (!item) return []
        used.add(key)
        return [item]
      })
      return { groupLabel: category.groupLabel, items: grouped }
    })
    .filter((group) => group.items.length > 0)

  const unmatched = items.filter((item) => !used.has(item.packageItemKey))
  if (unmatched.length > 0) {
    groups.push({ groupLabel: 'Equipment', items: unmatched })
  }

  return groups
}

export function EquipmentPackageConversionEditor({
  draft,
  catalogIndex,
  departingOptionId,
  packageGroup,
  targetFunding,
  selectedPackageItemKeys,
  editorId,
  commitStatusMessage,
  onSelectedPackageItemKeysChange,
  onCancel,
  onCommit,
}: EquipmentPackageConversionEditorProps) {
  const fallbackId = useId()
  const resolvedEditorId = editorId ?? fallbackId
  const descriptionRef = useRef<HTMLDivElement>(null)
  const selectionFacts = useEquipmentSelectionFacts()

  const preview = buildStartingPackageConversionPreview({
    draft,
    catalogIndex,
    departingOptionId,
    selectedPackageItemKeys,
    targetFunding,
  })

  useEffect(() => {
    descriptionRef.current?.focus()
    descriptionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
  }, [])

  if (!preview) return null

  const canCommit = canConvertStartingPackageToGold({ preview, selectedPackageItemKeys })
  const groups = groupConversionItems(preview.items, packageGroup)

  const toggleItem = (packageItemKey: string, checked: boolean) => {
    const next = new Set(selectedPackageItemKeys)
    if (checked) {
      next.add(packageItemKey)
    } else {
      next.delete(packageItemKey)
    }
    onSelectedPackageItemKeysChange(next)
  }

  return (
    <section id={resolvedEditorId} className={equipmentPackageConversionEditorClasses}>
      <div ref={descriptionRef} tabIndex={-1} className="outline-none">
        <Text as="p" className={equipmentPackageConversionEditorDescriptionClasses}>
          Choose which package items to keep as starting-gold purchases.
        </Text>
      </div>

      <div className={equipmentPackageConversionEditorBodyClasses}>
        <Text as="p" className={equipmentPackageConversionBudgetClasses}>
          {formatConversionBudgetLine(preview)}
        </Text>
        <div className={equipmentPackageConversionEditorListClasses}>
          {groups.map((group) => (
            <div key={group.groupLabel} className={equipmentPackageConversionCategoryClasses}>
              <Eyebrow size="sm">{group.groupLabel}</Eyebrow>
              <ul className={equipmentInventoryRowListClasses}>
                {group.items.map((item) => {
                  const disabled = item.status === 'blocked'
                  const checked = selectedPackageItemKeys.has(item.packageItemKey)
                  const valueLabel = formatConversionItemValueLabel(item)
                  const status = resolveSelectionRowStatusItems(
                    resolveEquipmentConversionItemPresentation({
                      item,
                      equipment: catalogIndex.equipment.get(item.equipmentId),
                      facts: selectionFacts,
                    }),
                    { context: 'edit_choice' },
                  )
                  const title =
                    item.grantQuantity > 1
                      ? `${item.grantQuantity} × ${item.equipmentName}`
                      : item.equipmentName

                  return (
                    <li key={item.packageItemKey}>
                      <ContentEntityCard
                        entity={buildEquipmentInventoryRowEntity({
                          equipmentName: title,
                          stagedRemoval: !checked,
                          status,
                        })}
                        leading={
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            aria-label={title}
                            onCheckedChange={(nextChecked) =>
                              toggleItem(item.packageItemKey, nextChecked === true)
                            }
                          />
                        }
                        trailing={
                          valueLabel
                            ? { kind: 'indicator', variant: 'label', label: valueLabel }
                            : undefined
                        }
                        density="compact"
                        disabled={disabled}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {commitStatusMessage ? (
        <div className={equipmentPackageConversionStatusClasses} role="status">
          {commitStatusMessage}
        </div>
      ) : null}

      <div className={equipmentPackageConversionEditorActionsClasses}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!canCommit} onClick={() => onCommit(preview)}>
          Use starting gold
        </Button>
      </div>
    </section>
  )
}
