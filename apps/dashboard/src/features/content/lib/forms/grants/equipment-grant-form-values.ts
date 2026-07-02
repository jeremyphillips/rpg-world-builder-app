import type {
  EquipmentChoiceGrant,
  EquipmentGrant,
  EquipmentPool,
  FixedEquipmentGrant,
} from '@rpg/contracts'
import { formatEquipmentPoolLabel } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import type {
  EquipmentGrantChoiceItemForm,
  EquipmentGrantFixedItemForm,
  EquipmentGrantItemForm,
} from './equipment-grant-form-fields'

/** Clears category filters that do not match the selected equipment kind. */
export function applyEquipmentGrantKindSync(
  row: EquipmentGrantChoiceItemForm,
): EquipmentGrantChoiceItemForm {
  if (row.poolSource !== 'filtered' || !row.poolEquipmentKind) {
    return row
  }

  return {
    ...row,
    poolToolCategories: row.poolEquipmentKind === 'tool' ? row.poolToolCategories : undefined,
    poolWeaponCategories: row.poolEquipmentKind === 'weapon' ? row.poolWeaponCategories : undefined,
    poolArmorCategories: row.poolEquipmentKind === 'armor' ? row.poolArmorCategories : undefined,
    poolGearKinds: row.poolEquipmentKind === 'adventuring_gear' ? row.poolGearKinds : undefined,
  }
}

export function equipmentPoolToFormRow(
  pool: EquipmentPool,
): Pick<
  EquipmentGrantChoiceItemForm,
  | 'poolSource'
  | 'poolEquipmentSlugs'
  | 'poolEquipmentKind'
  | 'poolToolCategories'
  | 'poolWeaponCategories'
  | 'poolArmorCategories'
  | 'poolGearKinds'
> {
  if (pool.source === 'explicit') {
    return {
      poolSource: 'explicit',
      poolEquipmentSlugs: pool.equipmentSlugs,
    }
  }

  return {
    poolSource: 'filtered',
    poolEquipmentKind: pool.equipmentKind,
    poolToolCategories: pool.toolCategories,
    poolWeaponCategories: pool.weaponCategories,
    poolArmorCategories: pool.armorCategories,
    poolGearKinds: pool.gearKinds,
  }
}

export function equipmentPoolFromFormRow(row: EquipmentGrantChoiceItemForm): EquipmentPool {
  const synced = applyEquipmentGrantKindSync(row)

  if (synced.poolSource === 'explicit') {
    return {
      source: 'explicit',
      equipmentSlugs: synced.poolEquipmentSlugs ?? [],
    }
  }

  const pool: Extract<EquipmentPool, { source: 'filtered' }> = {
    source: 'filtered',
    equipmentKind: synced.poolEquipmentKind!,
  }

  if (synced.poolToolCategories?.length) {
    pool.toolCategories = synced.poolToolCategories
  }
  if (synced.poolWeaponCategories?.length) {
    pool.weaponCategories = synced.poolWeaponCategories
  }
  if (synced.poolArmorCategories?.length) {
    pool.armorCategories = synced.poolArmorCategories
  }
  if (synced.poolGearKinds?.length) {
    pool.gearKinds = synced.poolGearKinds
  }

  return pool
}

function fixedGrantToFormRow(grant: FixedEquipmentGrant): EquipmentGrantItemForm {
  return {
    itemKind: 'fixed',
    equipmentSlug: grant.equipmentSlug,
    quantity: grant.quantity,
    equipped: grant.equipped,
  }
}

function choiceGrantToFormRow(grant: EquipmentChoiceGrant): EquipmentGrantItemForm {
  return {
    itemKind: 'choice',
    label: grant.label,
    choose: grant.choose,
    ...equipmentPoolToFormRow(grant.pool),
  }
}

export function equipmentGrantToFormRow(grant: EquipmentGrant): EquipmentGrantItemForm {
  return grant.kind === 'fixed' ? fixedGrantToFormRow(grant) : choiceGrantToFormRow(grant)
}

function fixedGrantFromFormRow(row: EquipmentGrantFixedItemForm): FixedEquipmentGrant {
  const grant: FixedEquipmentGrant = {
    kind: 'fixed',
    equipmentSlug: row.equipmentSlug,
    quantity: row.quantity ?? 1,
  }
  if (row.equipped !== undefined) {
    grant.equipped = row.equipped
  }
  return grant
}

function choiceGrantFromFormRow(row: EquipmentGrantChoiceItemForm): EquipmentChoiceGrant {
  return {
    kind: 'choice',
    label: row.label,
    choose: row.choose ?? 1,
    pool: equipmentPoolFromFormRow(row),
  }
}

export function equipmentGrantFromFormRow(row: EquipmentGrantItemForm): EquipmentGrant {
  return row.itemKind === 'fixed' ? fixedGrantFromFormRow(row) : choiceGrantFromFormRow(row)
}

export function equipmentGrantTitle(
  row: EquipmentGrantItemForm | undefined,
  index: number,
  equipmentOptions: FieldOption[] = [],
): string {
  if (!row) return `Item ${index + 1}`

  if (row.itemKind === 'fixed') {
    const label = equipmentOptions.find((option) => option.value === row.equipmentSlug)?.label
    const name = label ?? row.equipmentSlug ?? `Item ${index + 1}`
    const quantity = row.quantity ?? 1
    return quantity > 1 ? `${name} x${quantity}` : name
  }

  const poolLabel = row.label || formatEquipmentPoolLabel(equipmentPoolFromFormRow(row))
  const choose = row.choose ?? 1
  return `${poolLabel} — choose ${choose}`
}
