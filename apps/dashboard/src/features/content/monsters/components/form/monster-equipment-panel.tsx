import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { joinInlineMetadata, type Equipment } from '@rpg/contracts'
import { Button, ConfirmDialog, SemanticText } from '@rpg/ui'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { resolveStrictCatalogWriteGateReason } from '../../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import { useReportContentFormWriteGate } from '../../../lib/forms/shells/layout/content-form-write-gate'
import { deriveMonsterFormDraft, monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import { planEquipmentCatalogChange } from '../../lib/monster-equipment-catalog-change'
import {
  equipmentArmorRole,
  equipmentEntryBaseName,
  equipmentEntryReferenceLabel,
} from '../../lib/monster-equipment-labels'
import {
  findActionsReferencingEntry,
  removeEquipmentEntryWithDependents,
} from '../../lib/monster-equipment-references'
import {
  MONSTER_AC_ADJUSTMENT_LABEL,
  MONSTER_ADD_ITEM_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_CUSTOM_NAME_LABEL,
  MONSTER_CUSTOMIZATION_LABEL,
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_EQUIPPED_LABEL,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_REMOVE_LABEL,
  MONSTER_RETRY_LABEL,
  formatClearAdjustmentConfirmBody,
  formatEquipmentQuantityLabel,
  formatRemoveEquipmentConfirmBody,
  formatRemoveEquipmentConfirmLabel,
  formatRemoveEquipmentConfirmTitle,
  formatWeaponRetargetNotice,
  MONSTER_CLEAR_ADJUSTMENT_CONFIRM,
} from '../../lib/monster-form-labels'
import { describeEquipmentArmorContribution } from '../../lib/monster-display'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../../lib/monster-form-values'

type PendingChange = {
  entryId: string
  plan: ReturnType<typeof planEquipmentCatalogChange>
  previousEquipmentId: string
}

export function MonsterEquipmentPanel({
  ctx,
  onRetry,
}: {
  ctx: ContentFormCtx
  onRetry?: () => void
}) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const [pending, setPending] = useState<PendingChange | null>(null)
  const [notices, setNotices] = useState<Record<string, string>>({})
  const catalog = monsterEquipmentCatalog(ctx)
  const status = ctx.equipmentCatalogStatus ?? 'ready'
  const gateReason = resolveStrictCatalogWriteGateReason(status, {
    loading: MONSTER_LOADING_EQUIPMENT,
    error: MONSTER_EQUIPMENT_CATALOG_ERROR,
  })
  useReportContentFormWriteGate('strict', gateReason)

  if (!values) return null
  const derived = deriveMonsterFormDraft(values as MonsterFormValues, ctx)
  const breakdown = derived?.ac.status === 'resolved' ? derived.ac.value.breakdown : undefined
  const referenceOptions = ctx.options?.equipment?.forReference() ?? []

  const updateEntry = (entryId: string, next: MonsterEquipmentFormEntry) => {
    form.setValue(
      'equipment',
      values.equipment.map((entry) => (entry.entryId === entryId ? next : entry)),
      { shouldDirty: true },
    )
  }

  return (
    <div data-form-focus="equipment" tabIndex={-1} className="flex flex-col gap-4">
      {gateReason ? (
        <SemanticText tone={status === 'error' ? 'destructive' : 'warning'}>
          {gateReason}
          {status === 'error' && onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              {MONSTER_RETRY_LABEL}
            </Button>
          ) : null}
        </SemanticText>
      ) : null}
      {values.equipment.map((entry) => (
        <EquipmentEntryCard
          key={entry.entryId}
          entry={entry}
          values={values as MonsterFormValues}
          catalog={catalog}
          status={status}
          breakdown={breakdown}
          referenceOptions={referenceOptions}
          notice={notices[entry.entryId]}
          onUpdate={updateEntry}
          onPending={setPending}
          onNotice={(entryId, message) =>
            setNotices((current) => ({ ...current, [entryId]: message }))
          }
        />
      ))}
      <AddEquipmentSelect
        values={values as MonsterFormValues}
        referenceOptions={referenceOptions}
      />
      <EquipmentConfirm
        pending={pending}
        values={values as MonsterFormValues}
        catalog={catalog}
        onUpdate={updateEntry}
        onClose={() => setPending(null)}
      />
    </div>
  )
}

function EquipmentEntryCard({
  entry,
  values,
  catalog,
  status,
  breakdown,
  referenceOptions,
  notice,
  onUpdate,
  onPending,
  onNotice,
}: {
  entry: MonsterEquipmentFormEntry
  values: MonsterFormValues
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  status: NonNullable<ContentFormCtx['equipmentCatalogStatus']>
  breakdown: Parameters<typeof describeEquipmentArmorContribution>[1]['breakdown']
  referenceOptions: readonly Equipment[]
  notice: string | undefined
  onUpdate: (entryId: string, next: MonsterEquipmentFormEntry) => void
  onPending: (pending: PendingChange) => void
  onNotice: (entryId: string, message: string) => void
}) {
  const form = useFormContext<MonsterFormValues>()
  const item = catalog.get(entry.equipmentId)
  const role = equipmentArmorRole(item)
  const contribution =
    status === 'ready'
      ? describeEquipmentArmorContribution(entry.entryId, {
          acKind: values.armorClass.kind,
          breakdown,
          role,
        })
      : undefined
  const label = equipmentEntryReferenceLabel(entry, values.equipment, catalog)
  const acModifier = entry.modifiers?.find((modifier) => modifier.kind === 'armor_class')
  const acBonus = acModifier?.kind === 'armor_class' ? acModifier.bonus : 0
  return (
    <article>
      <h3>{label}</h3>
      <p>
        {joinInlineMetadata([
          equipmentEntryBaseName(entry, catalog),
          formatEquipmentQuantityLabel(entry.quantity, Boolean(entry.equipped)),
        ])}
      </p>
      <EquipmentContributionLines contribution={contribution} notice={notice} />
      <label>
        <input
          type="checkbox"
          aria-label={`${label} ${MONSTER_EQUIPPED_LABEL}`}
          checked={Boolean(entry.equipped)}
          onChange={(event) =>
            onUpdate(entry.entryId, { ...entry, equipped: event.target.checked })
          }
        />
        {MONSTER_EQUIPPED_LABEL}
      </label>
      <label>
        Catalog item
        <select
          aria-label={`${label} catalog item`}
          value={entry.equipmentId}
          onChange={(event) =>
            changeCatalogItem({
              values,
              entry,
              nextId: event.target.value,
              referenceOptions,
              catalog,
              onUpdate,
              onPending,
              onNotice,
            })
          }
        >
          {catalogOptions(entry, referenceOptions, catalog).map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input
          aria-label={`${label} quantity`}
          type="number"
          min={1}
          value={entry.quantity}
          onChange={(event) =>
            onUpdate(entry.entryId, {
              ...entry,
              quantity: Math.max(1, Number(event.target.value) || 1),
            })
          }
        />
      </label>
      <EquipmentCustomization entry={entry} role={role} acBonus={acBonus} onUpdate={onUpdate} />
      <Button
        type="button"
        variant="outline"
        onClick={() => removeEquipmentEntry(form, values, entry, onPending)}
      >
        {MONSTER_REMOVE_LABEL}
      </Button>
    </article>
  )
}

function AddEquipmentSelect({
  values,
  referenceOptions,
}: {
  values: MonsterFormValues
  referenceOptions: readonly Equipment[]
}) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <select
      aria-label={MONSTER_ADD_ITEM_LABEL}
      value=""
      onChange={(event) => {
        const equipmentId = event.target.value
        if (!equipmentId) return
        form.setValue(
          'equipment',
          [
            ...values.equipment,
            { entryId: crypto.randomUUID(), equipmentId, quantity: 1, equipped: true },
          ],
          { shouldDirty: true },
        )
      }}
    >
      <option value="">{MONSTER_ADD_ITEM_LABEL}</option>
      {referenceOptions.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  )
}

function EquipmentConfirm({
  pending,
  values,
  catalog,
  onUpdate,
  onClose,
}: {
  pending: PendingChange | null
  values: MonsterFormValues
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  onUpdate: (entryId: string, next: MonsterEquipmentFormEntry) => void
  onClose: () => void
}) {
  const form = useFormContext<MonsterFormValues>()
  const removePlan =
    pending?.plan.outcome === 'confirm' && pending.plan.reason === 'remove-actions'
      ? pending.plan
      : undefined
  const headline = removePlan
    ? formatRemoveEquipmentConfirmTitle(
        equipmentEntryReferenceLabel(
          values.equipment.find((entry) => entry.entryId === pending?.entryId) ?? removePlan.entry,
          values.equipment,
          catalog,
        ),
      )
    : MONSTER_CLEAR_ADJUSTMENT_CONFIRM
  const description = removePlan
    ? formatRemoveEquipmentConfirmBody(
        removePlan.references.map((reference) => reference.name ?? reference.id).join(', '),
      )
    : formatClearAdjustmentConfirmBody()
  const confirmLabel = removePlan
    ? formatRemoveEquipmentConfirmLabel(removePlan.references.length)
    : MONSTER_CLEAR_ADJUSTMENT_CONFIRM
  return (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      headline={headline}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={() => {
        if (!pending || pending.plan.outcome !== 'confirm') return
        if (
          pending.plan.reason === 'remove-actions' &&
          pending.plan.entry.equipmentId === pending.previousEquipmentId
        ) {
          form.reset(removeEquipmentEntryWithDependents(form.getValues(), pending.entryId), {
            keepDefaultValues: true,
          })
        } else {
          onUpdate(pending.entryId, pending.plan.entry)
        }
        onClose()
      }}
      onCancel={onClose}
    />
  )
}

function EquipmentContributionLines({
  contribution,
  notice,
}: {
  contribution: ReturnType<typeof describeEquipmentArmorContribution> | undefined
  notice: string | undefined
}) {
  return (
    <>
      {contribution?.contributionLabel ? <p>{contribution.contributionLabel}</p> : null}
      {contribution?.participation === 'not-used' && contribution.notUsedReason ? (
        <SemanticText>{contribution.notUsedReason}</SemanticText>
      ) : null}
      {notice ? <SemanticText>{notice}</SemanticText> : null}
    </>
  )
}

function EquipmentCustomization({
  entry,
  role,
  acBonus,
  onUpdate,
}: {
  entry: MonsterEquipmentFormEntry
  role: ReturnType<typeof equipmentArmorRole>
  acBonus: number
  onUpdate: (entryId: string, next: MonsterEquipmentFormEntry) => void
}) {
  return (
    <details>
      <summary>{MONSTER_CUSTOMIZATION_LABEL}</summary>
      <label>
        {MONSTER_CUSTOM_NAME_LABEL}
        <input
          aria-label={MONSTER_CUSTOM_NAME_LABEL}
          value={entry.customName ?? ''}
          onChange={(event) =>
            onUpdate(entry.entryId, {
              ...entry,
              ...(event.target.value
                ? { customName: event.target.value }
                : { customName: undefined }),
            })
          }
        />
      </label>
      <label>
        {MONSTER_CUSTOM_DESCRIPTION_LABEL}
        <input
          aria-label={MONSTER_CUSTOM_DESCRIPTION_LABEL}
          value={entry.customDescription ?? ''}
          onChange={(event) =>
            onUpdate(entry.entryId, {
              ...entry,
              customDescription: event.target.value || undefined,
            })
          }
        />
      </label>
      {role !== 'other' ? (
        <label>
          {MONSTER_AC_ADJUSTMENT_LABEL}
          <input
            aria-label={MONSTER_AC_ADJUSTMENT_LABEL}
            type="number"
            value={acBonus}
            onChange={(event) => {
              const bonus = Number(event.target.value)
              const rest =
                entry.modifiers?.filter((modifier) => modifier.kind !== 'armor_class') ?? []
              onUpdate(entry.entryId, {
                ...entry,
                modifiers: bonus === 0 ? rest : [...rest, { kind: 'armor_class', bonus }],
              })
            }}
          />
        </label>
      ) : null}
    </details>
  )
}

function changeCatalogItem(input: {
  values: MonsterFormValues
  entry: MonsterEquipmentFormEntry
  nextId: string
  referenceOptions: readonly Equipment[]
  catalog: ReturnType<typeof monsterEquipmentCatalog>
  onUpdate: (entryId: string, next: MonsterEquipmentFormEntry) => void
  onPending: (pending: PendingChange) => void
  onNotice: (entryId: string, message: string) => void
}): void {
  const { values, entry, nextId, referenceOptions, catalog, onUpdate, onPending, onNotice } = input
  const nextItem = referenceOptions.find((option) => option.id === nextId) ?? catalog.get(nextId)
  const plan = planEquipmentCatalogChange(values, entry, nextItem, nextItem?.name ?? nextId)
  if (plan.outcome === 'confirm') {
    onPending({ entryId: entry.entryId, plan, previousEquipmentId: entry.equipmentId })
    return
  }
  onUpdate(entry.entryId, plan.entry)
  if (plan.retarget) {
    onNotice(
      entry.entryId,
      formatWeaponRetargetNotice(plan.retarget.nextName, plan.retarget.actionNames),
    )
  }
}

function removeEquipmentEntry(
  form: ReturnType<typeof useFormContext<MonsterFormValues>>,
  values: MonsterFormValues,
  entry: MonsterEquipmentFormEntry,
  onPending: (pending: PendingChange) => void,
): void {
  const references = findActionsReferencingEntry(values, entry.entryId)
  if (references.length === 0) {
    form.setValue(
      'equipment',
      values.equipment.filter((row) => row.entryId !== entry.entryId),
      { shouldDirty: true },
    )
    return
  }
  onPending({
    entryId: entry.entryId,
    previousEquipmentId: entry.equipmentId,
    plan: { outcome: 'confirm', reason: 'remove-actions', entry, references },
  })
}

function catalogOptions(
  entry: MonsterEquipmentFormEntry,
  referenceOptions: readonly Equipment[],
  catalog: ReadonlyMap<string, Equipment>,
): Equipment[] {
  const options = [...referenceOptions]
  const current = catalog.get(entry.equipmentId)
  if (current && !options.some((option) => option.id === current.id)) options.unshift(current)
  return options
}
