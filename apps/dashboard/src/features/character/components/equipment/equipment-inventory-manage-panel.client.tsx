'use client'

import { useMemo } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  Equipment,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_ACQUIRED_THROUGH_LABEL,
  EQUIPMENT_INVENTORY_ADD_ANOTHER_LABEL,
  EQUIPMENT_INVENTORY_MANAGE_LABEL,
  EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL,
  EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL,
  formatEquipmentInventoryManageHeadline,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import type { AddedEquipmentEntryViewModel } from './equipment-inventory-summary.lib'
import {
  formatInventoryAddAnotherPreview,
  resolveEquipmentInventoryManageSources,
} from './equipment-inventory-manage.lib'
import {
  equipmentInventoryManagePanelAddAnotherClasses,
  equipmentInventoryManagePanelContentClasses,
  equipmentInventoryManagePanelHeaderClasses,
  equipmentInventoryManagePanelSectionClasses,
  equipmentInventoryManagePanelSourceActionsClasses,
  equipmentInventoryManagePanelSourceListClasses,
  equipmentInventoryManagePanelSourceMetaClasses,
  equipmentInventoryManagePanelSourceRowClasses,
} from './equipment-inventory-manage-panel.variants'

export type EquipmentInventoryManagePanelProps = {
  equipmentName: string
  equipment?: Equipment
  rows: readonly EquipmentInventoryRow[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  showAddAnother?: boolean
  onReleaseGrant: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase: (args: { purchaseId: string; quantity: number }) => void
  onAddAnother: (equipmentId: string) => void
}

function ManageSourceSection({
  sources,
  onReleaseGrant,
  onRemovePurchase,
}: {
  sources: ReturnType<typeof resolveEquipmentInventoryManageSources>
  onReleaseGrant: EquipmentInventoryManagePanelProps['onReleaseGrant']
  onRemovePurchase: EquipmentInventoryManagePanelProps['onRemovePurchase']
}) {
  return (
    <div className={equipmentInventoryManagePanelSourceListClasses}>
      {sources.grants.map((grant) => (
        <div key={grant.allowanceId} className={equipmentInventoryManagePanelSourceRowClasses}>
          <div className={equipmentInventoryManagePanelSourceMetaClasses}>
            <Text as="p" className="text-sm text-foreground">
              {grant.label}
            </Text>
            <Text as="p" variant="caption" className="text-muted-foreground">
              {grant.quantity}
            </Text>
          </div>
          <div className={equipmentInventoryManagePanelSourceActionsClasses}>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                onReleaseGrant({
                  allowanceId: grant.allowanceId,
                  equipmentId: grant.equipmentId,
                  quantity: 1,
                })
              }
            >
              {EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL}
            </Button>
          </div>
        </div>
      ))}

      {sources.purchases.map((purchase) => (
        <div key={purchase.purchaseId} className={equipmentInventoryManagePanelSourceRowClasses}>
          <div className={equipmentInventoryManagePanelSourceMetaClasses}>
            <Text as="p" className="text-sm text-foreground">
              {purchase.label}
            </Text>
            <Text as="p" variant="caption" className="text-muted-foreground">
              {purchase.quantity}
            </Text>
            <Text as="p" variant="caption" className="text-muted-foreground">
              {purchase.totalPriceLabel} total
            </Text>
          </div>
          <div className={equipmentInventoryManagePanelSourceActionsClasses}>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                onRemovePurchase({
                  purchaseId: purchase.purchaseId,
                  quantity: 1,
                })
              }
            >
              {EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function EquipmentInventoryManagePanel({
  equipmentName,
  equipment,
  rows,
  draft,
  context,
  catalogIndex,
  budget,
  showAddAnother = true,
  onReleaseGrant,
  onRemovePurchase,
  onAddAnother,
}: EquipmentInventoryManagePanelProps) {
  const sources = useMemo(() => resolveEquipmentInventoryManageSources(rows), [rows])
  const addAnotherPreview = useMemo(() => {
    if (!showAddAnother || !equipment) return undefined

    return formatInventoryAddAnotherPreview({
      draft,
      context,
      catalogIndex,
      equipment,
      budget,
    })
  }, [budget, catalogIndex, context, draft, equipment, showAddAnother])

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {EQUIPMENT_INVENTORY_MANAGE_LABEL}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className={equipmentInventoryManagePanelContentClasses}>
        <div className={equipmentInventoryManagePanelSectionClasses}>
          <div className={equipmentInventoryManagePanelHeaderClasses}>
            <Heading variant="group" as="h4">
              {formatEquipmentInventoryManageHeadline(equipmentName)}
            </Heading>
            <Text as="p" variant="muted" className="text-sm">
              {EQUIPMENT_INVENTORY_ACQUIRED_THROUGH_LABEL}
            </Text>
          </div>

          <ManageSourceSection
            sources={sources}
            onReleaseGrant={onReleaseGrant}
            onRemovePurchase={onRemovePurchase}
          />

          {addAnotherPreview ? (
            <div className={equipmentInventoryManagePanelAddAnotherClasses}>
              <Text as="p" className="text-sm font-body-emphasis text-foreground">
                {EQUIPMENT_INVENTORY_ADD_ANOTHER_LABEL}
              </Text>
              <Text as="p" variant="muted" className="text-sm">
                {addAnotherPreview.label}
              </Text>
              {addAnotherPreview.blockerNote ? (
                <Text as="p" variant="warning" className="text-sm">
                  {addAnotherPreview.blockerNote}
                </Text>
              ) : null}
              <Button
                type="button"
                size="sm"
                disabled={!addAnotherPreview.canAdd}
                onClick={() => {
                  if (!equipment) return
                  onAddAnother(equipment.id)
                }}
              >
                {EQUIPMENT_INVENTORY_ADD_ANOTHER_LABEL}
              </Button>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export type EquipmentInventoryManageEntryProps = Omit<
  EquipmentInventoryManagePanelProps,
  'equipmentName' | 'rows'
> & {
  entry: AddedEquipmentEntryViewModel
}

export function EquipmentInventoryManageEntryPanel({
  entry,
  ...props
}: EquipmentInventoryManageEntryProps) {
  return (
    <EquipmentInventoryManagePanel
      equipmentName={entry.equipmentName}
      equipment={entry.rows.find((row) => row.equipment)?.equipment}
      rows={entry.rows}
      {...props}
    />
  )
}
