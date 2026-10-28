import type { ReactElement } from 'react'
import type { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  normalizeEquipmentInstance,
  resolveCreatureArmorSlot,
  resolveEquipmentInstanceSummary,
  shouldShowUnmodifiedEquipmentQualifier,
} from '@rpg/contracts'
import type { buildEquipmentInventoryUnmodifiedContext, SystemRulesetId } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import { EquipmentInstanceEditorDrawer } from '../../../equipment/components/instance-editor/equipment-instance-editor-drawer'

import { findActionsReferencingEntry } from '../../lib/actions/monster-action-equipment-references'
import {
  buildCreatureEquipmentRowSupportingMetadata,
  EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT,
} from '../../../equipment/lib/inventory/resolve-creature-equipment-row-projection.lib'
import { resolveLoadoutEquipmentIsProficient } from '../../../equipment/lib/loadout/equipment-loadout-picker.lib'
import { equipmentEntryBaseName } from '../../lib/equipment/monster-equipment-labels'
import { resolveMonsterEquipmentRowProjection } from '../../lib/equipment/resolve-monster-equipment-row-projection.lib'
import { resolveMonsterEquipmentRowStatus } from '../../lib/equipment/resolve-monster-equipment-row-status.lib'
import { type monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'
import type { resolveMonsterFormWeaponGrants } from '../../lib/equipment/monster-loadout-picker.lib'
import { MonsterEquipmentEntryCard } from './monster-equipment-entry-card'

function monsterEntryIsProficient(
  item: ReturnType<ReturnType<typeof monsterEquipmentCatalog>['get']>,
  weaponGrants: ReturnType<typeof resolveMonsterFormWeaponGrants>,
): boolean {
  if (resolveCreatureArmorSlot(item) !== undefined) return true
  if (!item) return true
  return resolveLoadoutEquipmentIsProficient(item, weaponGrants)
}

export function MonsterEquipmentEntryCardView({
  entry,
  values,
  equipment,
  catalog,
  magicProvider,
  weaponGrants,
  unmodifiedContext,
  onUpdate,
  onRemove,
  onCustomize,
}: {
  entry: MonsterEquipmentFormEntry
  values: MonsterFormValues | undefined
  equipment: readonly MonsterEquipmentFormEntry[]
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  magicProvider: ReturnType<typeof createMagicPropertyDefinitionProvider>
  weaponGrants: ReturnType<typeof resolveMonsterFormWeaponGrants>
  unmodifiedContext: ReturnType<typeof buildEquipmentInventoryUnmodifiedContext>
  onUpdate: (next: MonsterEquipmentFormEntry[]) => void
  onRemove: (entryId: string) => void
  onCustomize: (entryId: string) => void
}) {
  if (!values) return null
  const item = catalog.get(entry.equipmentId)
  const summary = resolveEquipmentInstanceSummary(entry, item, magicProvider)
  const rowSummary = resolveMonsterEquipmentRowProjection({
    entry,
    item,
    abilityScores: values.abilityScores,
    challengeRating: values.challengeRating,
    weaponProficiencies: weaponGrants,
    omitSharedEnhancement: summary.enhancementInDisplayName,
    provider: magicProvider,
  })
  const inventoryStatus = resolveMonsterEquipmentRowStatus({
    summary,
    catalogItem: item,
    catalogMissing: !item,
    isProficient: monsterEntryIsProficient(item, weaponGrants),
    adjustmentSegments: rowSummary?.adjustmentSegments,
  })
  const supportingMetadata = buildCreatureEquipmentRowSupportingMetadata({
    rowSummary,
    leadingSegments: shouldShowUnmodifiedEquipmentQualifier(entry, unmodifiedContext)
      ? [EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT]
      : undefined,
  })
  return (
    <MonsterEquipmentEntryCard
      entry={entry}
      item={item}
      label={summary.displayName}
      equipped={Boolean(summary.equipped)}
      supportingMetadata={supportingMetadata}
      status={inventoryStatus.status}
      onEquippedChange={(nextEquipped) =>
        onUpdate(
          equipment.map((row) =>
            row.entryId === entry.entryId ? { ...row, equipped: nextEquipped } : row,
          ),
        )
      }
      onQuantityChange={(quantity) =>
        onUpdate(
          equipment.map((row) => (row.entryId === entry.entryId ? { ...row, quantity } : row)),
        )
      }
      onRemove={() => onRemove(entry.entryId)}
      onCustomize={() => onCustomize(entry.entryId)}
    />
  )
}

function MonsterEquipmentEditorDialog({
  editorEntry,
  editorItem,
  values,
  equipment,
  catalog,
  rulesetId,
  magicProvider,
  editorOpen,
  onUpdate,
  onClose,
}: {
  editorEntry: MonsterEquipmentFormEntry | undefined
  editorItem: ReturnType<ReturnType<typeof monsterEquipmentCatalog>['get']>
  values: MonsterFormValues | undefined
  equipment: readonly MonsterEquipmentFormEntry[]
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  rulesetId: SystemRulesetId
  magicProvider: ReturnType<typeof createMagicPropertyDefinitionProvider>
  editorOpen: boolean
  onUpdate: (next: MonsterEquipmentFormEntry[]) => void
  onClose: () => void
}) {
  if (!editorEntry || !editorItem || !values) return null
  const referenced = findActionsReferencingEntry(values, editorEntry.entryId).length > 0
  return (
    <EquipmentInstanceEditorDrawer
      open={editorOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      sourceEntry={normalizeEquipmentInstance(editorEntry) as MonsterEquipmentFormEntry}
      entries={equipment.map((row) => normalizeEquipmentInstance(row) as MonsterEquipmentFormEntry)}
      catalogItem={editorItem}
      rulesetId={rulesetId}
      definitions={magicProvider}
      subjectNoun="creature"
      referencedByLabel={
        referenced
          ? `This creature's attacks will continue using the original ${equipmentEntryBaseName(editorEntry, catalog)}. To use the customized copy, update the equipment selection in Actions.`
          : undefined
      }
      onCommit={(nextEntries) => {
        onUpdate(nextEntries)
        onClose()
      }}
    />
  )
}

function MonsterEquipmentRemovalDialog({
  pendingRemove,
  pendingRemoveCopy,
  onConfirmRemove,
  onClearRemove,
}: {
  pendingRemove: { entryId: string } | null
  pendingRemoveCopy: {
    headline: string
    description: string
    confirmLabel: string
  } | null
  onConfirmRemove: (entryId: string) => void
  onClearRemove: () => void
}) {
  return (
    <ConfirmDialog
      open={pendingRemove !== null}
      onOpenChange={(open) => {
        if (!open) onClearRemove()
      }}
      headline={pendingRemoveCopy?.headline ?? ''}
      description={pendingRemoveCopy?.description ?? ''}
      confirmLabel={pendingRemoveCopy?.confirmLabel ?? ''}
      onConfirm={() => {
        if (!pendingRemove) return
        onConfirmRemove(pendingRemove.entryId)
      }}
      onCancel={onClearRemove}
    />
  )
}

export function MonsterEquipmentEntryDialogs({
  values,
  equipment,
  catalog,
  rulesetId,
  magicProvider,
  editorEntryId,
  pendingRemove,
  pendingRemoveCopy,
  onUpdate,
  onCloseEditor,
  onConfirmRemove,
  onClearRemove,
}: {
  values: MonsterFormValues | undefined
  equipment: readonly MonsterEquipmentFormEntry[]
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  rulesetId: SystemRulesetId
  magicProvider: ReturnType<typeof createMagicPropertyDefinitionProvider>
  editorEntryId: string | null
  pendingRemove: { entryId: string } | null
  pendingRemoveCopy: {
    headline: string
    description: string
    confirmLabel: string
  } | null
  onUpdate: (next: MonsterEquipmentFormEntry[]) => void
  onCloseEditor: () => void
  onConfirmRemove: (entryId: string) => void
  onClearRemove: () => void
}): ReactElement {
  const editorEntry = editorEntryId
    ? equipment.find((entry) => entry.entryId === editorEntryId)
    : undefined
  return (
    <>
      <MonsterEquipmentEditorDialog
        editorEntry={editorEntry}
        editorItem={editorEntry ? catalog.get(editorEntry.equipmentId) : undefined}
        values={values}
        equipment={equipment}
        catalog={catalog}
        rulesetId={rulesetId}
        magicProvider={magicProvider}
        editorOpen={editorEntryId !== null}
        onUpdate={onUpdate}
        onClose={onCloseEditor}
      />
      <MonsterEquipmentRemovalDialog
        pendingRemove={pendingRemove}
        pendingRemoveCopy={pendingRemoveCopy}
        onConfirmRemove={onConfirmRemove}
        onClearRemove={onClearRemove}
      />
    </>
  )
}
