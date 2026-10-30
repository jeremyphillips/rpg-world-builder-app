import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  resolveCreatureArmorSlot,
  resolveEquipmentInstanceSummary,
  type CreatureArmorSlot,
} from '@rpg/contracts'
import { ActionButton, Button, ConfirmDialog, InsetPanel } from '@rpg/ui'

import { EquipmentPickerDrawer } from '@/features/character'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../lib/monster-form-derivation'
import {
  commitMonsterArmorSlotReplacement,
  planArmorSlotReplacement,
} from '../../lib/equipment/armor-slot-replacement.lib'
import {
  buildMonsterLoadoutPickerItems,
  resolveMonsterFormWeaponGrants,
} from '../../lib/equipment/monster-loadout-picker.lib'
import { resolveEquipmentRemovalDecision } from '../../lib/equipment/resolve-equipment-removal-decision.lib'
import {
  formatArmorSlotReplacementConfirmCopy,
  formatEquipmentCustomizationRemovalSummary,
  getMonsterArmorSlotUiCopy,
  MONSTER_ARMOR_SLOT_EMPTY_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'
import { useMonsterEquipmentEntryActions } from './use-monster-equipment-entry-actions'

function slotEntries(
  equipment: readonly MonsterEquipmentFormEntry[],
  catalog: ReturnType<typeof monsterEquipmentCatalog>,
  slot: CreatureArmorSlot,
) {
  return equipment.filter(
    (entry) => resolveCreatureArmorSlot(catalog.get(entry.equipmentId)) === slot,
  )
}

function ownedArmorSlotId(owned: readonly MonsterEquipmentFormEntry[]): string | undefined {
  return owned.length === 1 ? owned[0]?.equipmentId : undefined
}

function armorSlotSelectionUnchanged(
  pendingId: string | null,
  owned: readonly MonsterEquipmentFormEntry[],
  currentId: string | undefined,
): boolean {
  return pendingId === null || (owned.length === 1 && pendingId === currentId)
}

function resolveArmorSlotCommit(
  pendingId: string | null,
  unchanged: boolean,
  values: MonsterFormValues | undefined,
  owned: readonly MonsterEquipmentFormEntry[],
) {
  if (!pendingId || unchanged || !values) return null
  const plan = planArmorSlotReplacement(
    owned.map((entry) => resolveEquipmentRemovalDecision(values, entry)),
  )
  if (plan === 'prohibited') return { kind: 'prohibited' as const }
  if (plan === 'confirm') return { kind: 'confirm' as const, equipmentId: pendingId }
  return { kind: 'apply' as const, equipmentId: pendingId }
}

function armorSlotFlaggedCopy(
  owned: readonly MonsterEquipmentFormEntry[],
  values: MonsterFormValues,
  catalog: ReturnType<typeof monsterEquipmentCatalog>,
  provider: ReturnType<typeof monsterMagicPropertyProvider>,
) {
  return owned.flatMap((entry) => {
    const decision = resolveEquipmentRemovalDecision(values, entry)
    if (decision.outcome !== 'confirm') return []
    return [
      {
        displayName: resolveEquipmentInstanceSummary(
          entry,
          catalog.get(entry.equipmentId),
          provider,
        ).displayName,
        reasons: decision.reasons,
        referencedActionCount: decision.references.length,
        referencedActionSummary: decision.references
          .map((reference) => reference.name ?? reference.id)
          .join(', '),
        customizationSummary: formatEquipmentCustomizationRemovalSummary(entry),
      },
    ]
  })
}

function ArmorSlotReplaceDialog({
  confirmingId,
  owned,
  values,
  catalog,
  provider,
  onApply,
  onClear,
}: {
  confirmingId: string | null
  owned: readonly MonsterEquipmentFormEntry[]
  values: MonsterFormValues
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  provider: ReturnType<typeof monsterMagicPropertyProvider>
  onApply: (equipmentId: string) => void
  onClear: () => void
}) {
  const flagged = armorSlotFlaggedCopy(owned, values, catalog, provider)
  const replaceCopy =
    confirmingId && flagged.length > 0 ? formatArmorSlotReplacementConfirmCopy({ flagged }) : null
  return (
    <ConfirmDialog
      open={replaceCopy !== null}
      onOpenChange={(next) => {
        if (!next) onClear()
      }}
      headline={replaceCopy?.headline ?? ''}
      description={replaceCopy?.description ?? ''}
      confirmLabel={replaceCopy?.confirmLabel ?? ''}
      onConfirm={() => {
        if (confirmingId) onApply(confirmingId)
      }}
      onCancel={onClear}
    />
  )
}
function armorSlotPickerItems(
  items: ReturnType<typeof buildMonsterLoadoutPickerItems>,
  slot: CreatureArmorSlot,
) {
  return items.filter((item) => resolveCreatureArmorSlot(item.equipment) === slot)
}

export function MonsterArmorSlotAction({
  slot,
  ctx,
}: {
  slot: CreatureArmorSlot
  ctx: ContentFormCtx
}) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const catalog = monsterEquipmentCatalog(ctx)
  const equipmentSource = values?.equipment
  const equipment = useMemo(() => equipmentSource ?? [], [equipmentSource])
  const owned = slotEntries(equipment, catalog, slot)
  const currentId = ownedArmorSlotId(owned)
  const copy = getMonsterArmorSlotUiCopy(slot)
  const [open, setOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const weaponGrants = useMemo(() => resolveMonsterFormWeaponGrants(values), [values])
  const items = useMemo(() => {
    const referenceOptions = ctx.options?.equipment?.forReference() ?? []
    return armorSlotPickerItems(
      buildMonsterLoadoutPickerItems({
        referenceOptions,
        weaponGrants,
        equipment,
      }),
      slot,
    )
  }, [ctx.options?.equipment, equipment, slot, weaponGrants])
  const unchanged = armorSlotSelectionUnchanged(pendingId, owned, currentId)
  const catalogReady = ctx.equipmentCatalogStatus === 'ready'
  const provider = monsterMagicPropertyProvider(ctx)

  const applyReplacement = (equipmentId: string) => {
    commitMonsterArmorSlotReplacement(form, slot, equipmentId, catalog)
    setOpen(false)
    setConfirmingId(null)
  }

  const commit = () => {
    const decision = resolveArmorSlotCommit(pendingId, unchanged, values, owned)
    if (!decision || decision.kind === 'prohibited') return
    if (decision.kind === 'confirm') {
      setConfirmingId(decision.equipmentId)
      return
    }
    applyReplacement(decision.equipmentId)
  }

  const openPicker = () => {
    setPendingId(currentId ?? null)
    setOpen(true)
  }
  const actionLabel = owned.length > 0 ? copy.change : copy.add

  return (
    <>
      {owned.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!catalogReady}
          onClick={openPicker}
        >
          {actionLabel}
        </Button>
      ) : (
        <ActionButton
          action="add"
          variant="outline"
          size="sm"
          disabled={!catalogReady}
          onClick={openPicker}
        >
          {actionLabel}
        </ActionButton>
      )}
      <EquipmentPickerDrawer
        open={open}
        onOpenChange={setOpen}
        title={copy.select}
        items={items}
        allowedKinds={['armor']}
        workflowMode="loadout"
        showCharacterPreview={false}
        armorClassRules={ctx.armorClassRules}
        selection={{ value: pendingId, onValueChange: setPendingId }}
        footer={
          <Button type="button" disabled={unchanged} onClick={commit}>
            {copy.select}
          </Button>
        }
      />
      <ArmorSlotReplaceDialog
        confirmingId={confirmingId}
        owned={owned}
        values={values ?? form.getValues()}
        catalog={catalog}
        provider={provider}
        onApply={applyReplacement}
        onClear={() => setConfirmingId(null)}
      />
    </>
  )
}

export function MonsterArmorSlotBody({
  slot,
  ctx,
}: {
  slot: CreatureArmorSlot
  ctx: ContentFormCtx
}) {
  const equipmentEntrySurface = useMonsterEquipmentEntryActions(ctx)
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const catalog = monsterEquipmentCatalog(ctx)
  const equipmentSource = values?.equipment
  const equipment = useMemo(() => equipmentSource ?? [], [equipmentSource])
  const owned = slotEntries(equipment, catalog, slot)
  if (owned.length === 0) {
    return (
      <InsetPanel borderStyle="dashed" size="sm" align="center" surface={{}}>
        <InsetPanel.Text>{MONSTER_ARMOR_SLOT_EMPTY_LABEL}</InsetPanel.Text>
      </InsetPanel>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {owned.map((entry) => (
        <div key={entry.entryId}>{equipmentEntrySurface.entryCard(entry)}</div>
      ))}
      {equipmentEntrySurface.dialogs}
    </div>
  )
}
