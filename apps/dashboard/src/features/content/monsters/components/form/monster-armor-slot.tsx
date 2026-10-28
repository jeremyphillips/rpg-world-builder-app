import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  resolveCreatureArmorSlot,
  resolveEquipmentInstanceSummary,
  type CreatureArmorSlot,
} from '@rpg/contracts'
import {
  ActionButton,
  Button,
  ConfirmDialog,
  InsetPanel,
  Text,
  emptyStateWellSupportingClasses,
  emptyStateWellTitleClasses,
} from '@rpg/ui'

import { EquipmentPickerDrawer } from '@/features/character'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../lib/monster-form-derivation'
import { replaceMonsterArmorSlotEntry } from '../../lib/equipment/monster-equipment-loadout.lib'
import {
  buildMonsterLoadoutPickerItems,
  resolveMonsterFormWeaponGrants,
} from '../../lib/equipment/monster-loadout-picker.lib'
import { resolveEquipmentRemovalDecision } from '../../lib/equipment/resolve-equipment-removal-decision.lib'
import {
  formatEquipmentCustomizationRemovalSummary,
  formatEquipmentRemovalConfirmCopy,
  getMonsterArmorSlotUiCopy,
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

function blockingArmorReplacement(
  values: MonsterFormValues,
  owned: readonly MonsterEquipmentFormEntry[],
): MonsterEquipmentFormEntry | undefined {
  return owned.find((entry) => resolveEquipmentRemovalDecision(values, entry).requiresConfirmation)
}

function armorSlotPickerItems(
  items: ReturnType<typeof buildMonsterLoadoutPickerItems>,
  slot: CreatureArmorSlot,
) {
  return items.filter((item) => resolveCreatureArmorSlot(item.equipment) === slot)
}

function resolveArmorSlotCommit(
  pendingId: string | null,
  unchanged: boolean,
  values: MonsterFormValues | undefined,
  owned: readonly MonsterEquipmentFormEntry[],
) {
  if (!pendingId || unchanged || !values) return null
  const blocking = blockingArmorReplacement(values, owned)
  if (blocking) return { kind: 'confirm' as const, entry: blocking }
  return { kind: 'apply' as const, equipmentId: pendingId }
}

function ArmorSlotReplaceDialog({
  pendingId,
  pendingReplace,
  values,
  catalog,
  provider,
  onApply,
  onClear,
}: {
  pendingId: string | null
  pendingReplace: MonsterEquipmentFormEntry | null
  values: MonsterFormValues
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  provider: ReturnType<typeof monsterMagicPropertyProvider>
  onApply: (equipmentId: string) => void
  onClear: () => void
}) {
  const replaceCopy = pendingReplace
    ? armorReplacementConfirmCopy(pendingReplace, values, catalog, provider)
    : null
  return (
    <ConfirmDialog
      open={pendingReplace !== null}
      onOpenChange={(next) => {
        if (!next) onClear()
      }}
      headline={replaceCopy?.headline ?? ''}
      description={replaceCopy?.description ?? ''}
      confirmLabel={replaceCopy?.confirmLabel ?? ''}
      onConfirm={() => {
        if (pendingId) onApply(pendingId)
      }}
      onCancel={onClear}
    />
  )
}

function armorReplacementConfirmCopy(
  entry: MonsterEquipmentFormEntry,
  values: MonsterFormValues,
  catalog: ReturnType<typeof monsterEquipmentCatalog>,
  provider: ReturnType<typeof monsterMagicPropertyProvider>,
) {
  const decision = resolveEquipmentRemovalDecision(values, entry)
  return formatEquipmentRemovalConfirmCopy({
    displayName: resolveEquipmentInstanceSummary(entry, catalog.get(entry.equipmentId), provider)
      .displayName,
    reasons: decision.reasons,
    referencedActionCount: decision.references.length,
    customizationSummary: formatEquipmentCustomizationRemovalSummary(entry),
  })
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
  const [pendingReplace, setPendingReplace] = useState<MonsterEquipmentFormEntry | null>(null)

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
    form.setValue(
      'equipment',
      replaceMonsterArmorSlotEntry(form.getValues('equipment') ?? [], slot, equipmentId, catalog),
      { shouldDirty: true },
    )
    setOpen(false)
    setPendingReplace(null)
  }

  const commit = () => {
    const decision = resolveArmorSlotCommit(pendingId, unchanged, values, owned)
    if (!decision) return
    if (decision.kind === 'confirm') {
      setPendingReplace(decision.entry)
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
        selection={{ value: pendingId, onValueChange: setPendingId }}
        footer={
          <Button type="button" disabled={unchanged} onClick={commit}>
            {copy.select}
          </Button>
        }
      />
      <ArmorSlotReplaceDialog
        pendingId={pendingId}
        pendingReplace={pendingReplace}
        values={values ?? form.getValues()}
        catalog={catalog}
        provider={provider}
        onApply={applyReplacement}
        onClear={() => setPendingReplace(null)}
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
  const entry = owned[0]
  if (!entry) {
    const copy = getMonsterArmorSlotUiCopy(slot)
    return (
      <InsetPanel borderStyle="dashed" size="sm" align="center" className="gap-1">
        <Text as="p" className={emptyStateWellTitleClasses}>
          {copy.emptyTitle}
        </Text>
        <Text as="p" className={emptyStateWellSupportingClasses}>
          {copy.emptySupporting}
        </Text>
      </InsetPanel>
    )
  }
  return (
    <>
      {equipmentEntrySurface.entryCard(entry)}
      {equipmentEntrySurface.dialogs}
    </>
  )
}
