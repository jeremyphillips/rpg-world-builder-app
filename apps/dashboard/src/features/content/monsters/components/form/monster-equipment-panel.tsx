import { useCallback, useMemo, useState } from 'react'
import {
  findCanonicalPlainEntry,
  getContentTypeTerm,
  resolveCreatureArmorSlot,
  type EquipmentPickerItem,
} from '@rpg/contracts'
import { ActionButton, FieldRecommendationGroupView, InsetPanel, SemanticText, Text } from '@rpg/ui'

import { formatAddContentTypeLabel } from '../../../lib/content-type-labels'
import { EquipmentCategoryGroupedList, EquipmentInventorySectionHeader } from '@/features/content'
import { EquipmentPickerDrawer, buildEquipmentLoadoutRowViewModel } from '@/features/character'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { resolveStrictCatalogWriteGateReason } from '../../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import { useReportContentFormWriteGate } from '../../../lib/forms/shells/layout/content-form-write-gate'
import {
  groupMonsterEquipmentByKind,
  incrementMonsterPlainStack,
  incrementMonsterPlainStacks,
  setMonsterPlainStackQuantity,
} from '../../lib/equipment/monster-equipment-loadout.lib'
import { buildMonsterLoadoutPickerItems } from '../../lib/equipment/monster-loadout-picker.lib'
import {
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_EQUIPMENT_EMPTY_MESSAGE,
  MONSTER_LOADING_EQUIPMENT,
} from '../../lib/monster-form-labels'
import { buildMonsterEquipmentRecommendationGroup } from '../../lib/equipment/monster-equipment-field-recommendation.lib'
import type { MonsterEquipmentFormEntry } from '../../lib/monster-form-values'
import { useMonsterEquipmentEntryActions } from './use-monster-equipment-entry-actions'

export function MonsterEquipmentPanel({ ctx }: { ctx: ContentFormCtx }) {
  const actions = useMonsterEquipmentEntryActions(ctx)
  const [pickerOpen, setPickerOpen] = useState(false)
  const status = ctx.equipmentCatalogStatus ?? 'ready'
  const gateReason = resolveStrictCatalogWriteGateReason(status, {
    loading: MONSTER_LOADING_EQUIPMENT,
    error: MONSTER_EQUIPMENT_CATALOG_ERROR,
  })
  useReportContentFormWriteGate('strict', gateReason)

  const referenceOptions = ctx.options?.equipment?.forReference() ?? []
  const { equipment, updateEquipment, removeEntry, values, weaponGrants, rulesetId } = actions

  const pickerItems = useMemo(
    () =>
      buildMonsterLoadoutPickerItems({
        referenceOptions,
        weaponGrants,
        equipment,
      }).filter((item) => resolveCreatureArmorSlot(item.equipment) === undefined),
    [equipment, referenceOptions, weaponGrants],
  )

  const addEquipmentRecommendation = useCallback(
    (equipmentId: string) => {
      updateEquipment(incrementMonsterPlainStack(equipment, equipmentId, { equipped: false }))
    },
    [equipment, updateEquipment],
  )

  const addAllEquipmentRecommendations = useCallback(
    (equipmentIds: readonly string[]) => {
      updateEquipment(incrementMonsterPlainStacks(equipment, equipmentIds, { equipped: false }))
    },
    [equipment, updateEquipment],
  )

  const equipmentRecommendations = useMemo(() => {
    if (!values || gateReason) return null
    return buildMonsterEquipmentRecommendationGroup({
      weaponProficiencyItemIds: weaponGrants.items,
      referenceEquipment: referenceOptions,
      equipmentEntries: equipment,
      rulesetId,
      onAddEquipment: addEquipmentRecommendation,
      onAddAllEquipment: addAllEquipmentRecommendations,
    })
  }, [
    addAllEquipmentRecommendations,
    addEquipmentRecommendation,
    equipment,
    gateReason,
    referenceOptions,
    rulesetId,
    values,
    weaponGrants.items,
  ])

  if (!values) return null

  const totalQuantity = equipment.reduce((sum, entry) => sum + (entry.quantity ?? 1), 0)
  const groups = groupMonsterEquipmentByKind(equipment, actions.catalog)

  return (
    <div data-form-focus="equipment" tabIndex={-1} className="flex flex-col gap-4">
      {gateReason ? (
        <Text as="span" variant="supporting">
          <SemanticText tone={status === 'error' ? 'destructive' : 'warning'}>
            {gateReason}
          </SemanticText>
        </Text>
      ) : null}

      <EquipmentInventorySectionHeader
        title={getContentTypeTerm('equipment').label}
        count={totalQuantity}
        action={
          <ActionButton
            action="add"
            variant="outline"
            size="sm"
            disabled={Boolean(gateReason)}
            onClick={() => setPickerOpen(true)}
          >
            {formatAddContentTypeLabel('equipment')}
          </ActionButton>
        }
      />

      <div className="flex flex-col gap-2">
        {equipmentRecommendations ? (
          <FieldRecommendationGroupView group={equipmentRecommendations} placement="collection" />
        ) : null}

        <EquipmentCategoryGroupedList<MonsterEquipmentFormEntry>
          groups={groups.map((group) => ({ groupLabel: group.groupLabel, items: group.entries }))}
          getItemKey={(entry) => entry.entryId}
          emptyState={
            <InsetPanel size="sm" align="center" className="rounded-lg">
              <InsetPanel.PassiveMessage>
                {MONSTER_EQUIPMENT_EMPTY_MESSAGE}
              </InsetPanel.PassiveMessage>
            </InsetPanel>
          }
          renderRow={(entry) => actions.entryCard(entry)}
        />
      </div>

      <EquipmentPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={pickerItems}
        browseSortContext={{
          proficientWeaponCategories: weaponGrants.categories,
          preferMartialWeaponBrowseOrder: false,
        }}
        workflowMode="loadout"
        armorClassRules={ctx.armorClassRules}
        showCharacterPreview={false}
        resolveRowActionViewModel={({ equipment: row }) =>
          buildEquipmentLoadoutRowViewModel(row.id, equipment)
        }
        onCommitAdd={(item: EquipmentPickerItem) => {
          updateEquipment(incrementMonsterPlainStack(equipment, item.equipment.id))
          return true
        }}
        onSetRowQuantity={(item, total) => {
          const plain = findCanonicalPlainEntry(equipment, item.equipment.id) as
            | MonsterEquipmentFormEntry
            | undefined
          if (total === 0 && plain?.entryId) {
            removeEntry(plain.entryId)
            return
          }
          updateEquipment(setMonsterPlainStackQuantity(equipment, item.equipment.id, total))
        }}
      />
      {actions.dialogs}
    </div>
  )
}
