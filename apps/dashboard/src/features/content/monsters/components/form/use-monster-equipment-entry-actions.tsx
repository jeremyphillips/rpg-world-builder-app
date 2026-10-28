import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  buildEquipmentInventoryUnmodifiedContext,
  normalizeEquipmentInstance,
  resolveCreatureArmorSlot,
  resolveEquipmentInstanceSummary,
  shouldShowUnmodifiedEquipmentQualifier,
  type SystemRulesetId,
} from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import { EquipmentInstanceEditorDrawer } from '../../../equipment/components/instance-editor/equipment-instance-editor-drawer'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import { equipmentEntryBaseName } from '../../lib/equipment/monster-equipment-labels'
import { findActionsReferencingEntry } from '../../lib/actions/monster-action-equipment-references'
import { commitEquipmentEntryRemoval } from '../../lib/equipment/commit-equipment-entry-removal.lib'
import { resolveMonsterFormWeaponGrants } from '../../lib/equipment/monster-loadout-picker.lib'
import {
  buildCreatureEquipmentRowSupportingMetadata,
  EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT,
} from '../../../equipment/lib/inventory/resolve-creature-equipment-row-projection.lib'
import { resolveMonsterEquipmentRowProjection } from '../../lib/equipment/resolve-monster-equipment-row-projection.lib'
import { resolveMonsterEquipmentRowStatus } from '../../lib/equipment/resolve-monster-equipment-row-status.lib'
import { resolveLoadoutEquipmentIsProficient } from '../../../equipment/lib/loadout/equipment-loadout-picker.lib'
import { resolveEquipmentRemovalDecision } from '../../lib/equipment/resolve-equipment-removal-decision.lib'
import {
  MONSTER_EQUIPMENT_REMOVAL_FALLBACK_NAME,
  formatEquipmentCustomizationRemovalSummary,
  formatEquipmentRemovalConfirmCopy,
} from '../../lib/monster-form-labels'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterEquipmentEntryCard } from './monster-equipment-entry-card'

type PendingRemove = {
  entryId: string
}

export type MonsterEquipmentEntryActions = {
  values: MonsterFormValues | undefined
  equipment: readonly MonsterEquipmentFormEntry[]
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  weaponGrants: ReturnType<typeof resolveMonsterFormWeaponGrants>
  rulesetId: SystemRulesetId
  updateEquipment: (next: MonsterEquipmentFormEntry[]) => void
  removeEntry: (entryId: string) => void
  entryCard: (entry: MonsterEquipmentFormEntry) => ReactNode
  dialogs: ReactElement
}

function monsterEntryIsProficient(
  item: ReturnType<ReturnType<typeof monsterEquipmentCatalog>['get']>,
  weaponGrants: ReturnType<typeof resolveMonsterFormWeaponGrants>,
): boolean {
  if (resolveCreatureArmorSlot(item) !== undefined) return true
  if (!item) return true
  return resolveLoadoutEquipmentIsProficient(item, weaponGrants)
}

function buildPendingRemovalCopy(
  pendingRemove: PendingRemove,
  values: MonsterFormValues,
  equipment: readonly MonsterEquipmentFormEntry[],
  catalog: ReturnType<typeof monsterEquipmentCatalog>,
  magicProvider: ReturnType<typeof createMagicPropertyDefinitionProvider>,
) {
  const removing = equipment.find((entry) => entry.entryId === pendingRemove.entryId)
  const decision = resolveEquipmentRemovalDecision(
    values,
    removing ?? { entryId: pendingRemove.entryId, equipmentId: '', quantity: 1 },
  )
  const displayName = removing
    ? resolveEquipmentInstanceSummary(removing, catalog.get(removing.equipmentId), magicProvider)
        .displayName
    : MONSTER_EQUIPMENT_REMOVAL_FALLBACK_NAME
  return formatEquipmentRemovalConfirmCopy({
    displayName,
    reasons: decision.reasons,
    referencedActionCount: decision.references.length,
    referencedActionSummary: decision.references
      .map((reference) => reference.name ?? reference.id)
      .join(', '),
    customizationSummary: removing
      ? formatEquipmentCustomizationRemovalSummary(removing)
      : undefined,
  })
}

function MonsterEquipmentEntryCardView({
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
  pendingRemove: PendingRemove | null
  pendingRemoveCopy: ReturnType<typeof buildPendingRemovalCopy> | null
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

function MonsterEquipmentEntryDialogs({
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
  pendingRemove: PendingRemove | null
  pendingRemoveCopy: ReturnType<typeof buildPendingRemovalCopy> | null
  onUpdate: (next: MonsterEquipmentFormEntry[]) => void
  onCloseEditor: () => void
  onConfirmRemove: (entryId: string) => void
  onClearRemove: () => void
}) {
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

export function useMonsterEquipmentEntryActions(ctx: ContentFormCtx): MonsterEquipmentEntryActions {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const [editorEntryId, setEditorEntryId] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)

  const catalog = monsterEquipmentCatalog(ctx)
  const rulesetId = (ctx.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  const magicProvider = useMemo(() => createMagicPropertyDefinitionProvider(rulesetId), [rulesetId])
  const equipment = values?.equipment ?? []
  const weaponGrants = useMemo(() => resolveMonsterFormWeaponGrants(values), [values])
  const unmodifiedContext = useMemo(
    () => buildEquipmentInventoryUnmodifiedContext(equipment),
    [equipment],
  )

  const updateEquipment = useCallback(
    (next: MonsterEquipmentFormEntry[]) => {
      form.setValue('equipment', next, { shouldDirty: true })
    },
    [form],
  )

  const removeEntry = useCallback(
    (entryId: string) => {
      const entry = equipment.find((row) => row.entryId === entryId)
      if (!entry || !values) return
      if (resolveEquipmentRemovalDecision(values, entry).requiresConfirmation) {
        setPendingRemove({ entryId })
        return
      }
      commitEquipmentEntryRemoval(form, entryId)
    },
    [equipment, form, values],
  )

  const pendingRemoveCopy = useMemo(() => {
    if (!pendingRemove || !values) return null
    return buildPendingRemovalCopy(pendingRemove, values, equipment, catalog, magicProvider)
  }, [catalog, equipment, magicProvider, pendingRemove, values])

  const entryCard = (entry: MonsterEquipmentFormEntry) => (
    <MonsterEquipmentEntryCardView
      entry={entry}
      values={values}
      equipment={equipment}
      catalog={catalog}
      magicProvider={magicProvider}
      weaponGrants={weaponGrants}
      unmodifiedContext={unmodifiedContext}
      onUpdate={updateEquipment}
      onRemove={removeEntry}
      onCustomize={setEditorEntryId}
    />
  )

  const dialogs = (
    <MonsterEquipmentEntryDialogs
      values={values}
      equipment={equipment}
      catalog={catalog}
      rulesetId={rulesetId}
      magicProvider={magicProvider}
      editorEntryId={editorEntryId}
      pendingRemove={pendingRemove}
      pendingRemoveCopy={pendingRemoveCopy}
      onUpdate={updateEquipment}
      onCloseEditor={() => setEditorEntryId(null)}
      onConfirmRemove={(entryId) => {
        commitEquipmentEntryRemoval(form, entryId)
        setPendingRemove(null)
      }}
      onClearRemove={() => setPendingRemove(null)}
    />
  )

  return {
    values,
    equipment,
    catalog,
    weaponGrants,
    rulesetId,
    updateEquipment,
    removeEntry,
    entryCard,
    dialogs,
  }
}
