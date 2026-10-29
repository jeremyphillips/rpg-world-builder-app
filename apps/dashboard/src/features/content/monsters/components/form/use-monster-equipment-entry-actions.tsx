import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import {
  buildEquipmentInventoryUnmodifiedContext,
  resolveEquipmentInstanceSummary,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import { commitEquipmentEntryRemoval } from '../../lib/equipment/commit-equipment-entry-removal.lib'
import { resolveMonsterFormWeaponGrants } from '../../lib/equipment/monster-loadout-picker.lib'
import { resolveEquipmentRemovalDecision } from '../../lib/equipment/resolve-equipment-removal-decision.lib'
import {
  MONSTER_EQUIPMENT_REMOVAL_FALLBACK_NAME,
  formatEquipmentCustomizationRemovalSummary,
  formatEquipmentRemovalConfirmCopy,
} from '../../lib/monster-form-labels'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'
import {
  MonsterEquipmentEntryCardView,
  MonsterEquipmentEntryDialogs,
} from './monster-equipment-entry-actions.parts'

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

export function useMonsterEquipmentEntryActions(ctx: ContentFormCtx): MonsterEquipmentEntryActions {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const [editorEntryId, setEditorEntryId] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)

  const catalog = monsterEquipmentCatalog(ctx)
  const rulesetId = (ctx.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  const magicProvider = useMemo(() => createMagicPropertyDefinitionProvider(rulesetId), [rulesetId])
  const equipmentSource = values?.equipment
  const equipment = useMemo(() => equipmentSource ?? [], [equipmentSource])
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
      if (resolveEquipmentRemovalDecision(values, entry).outcome === 'confirm') {
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
      armorClassRules={ctx.armorClassRules}
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
