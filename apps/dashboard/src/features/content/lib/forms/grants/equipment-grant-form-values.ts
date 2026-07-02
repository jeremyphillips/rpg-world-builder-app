import type {
  EquipmentChoiceGrant,
  EquipmentGrant,
  EquipmentPool,
  FixedEquipmentGrant,
} from '@rpg/contracts'
import { formatEquipmentGrantSentence, formatEquipmentPoolLabel } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { EQUIPMENT_POOL_CATEGORY_ANY } from './equipment-grant-form-fields'
import type {
  EquipmentGrantChoiceItemForm,
  EquipmentGrantFixedItemForm,
  EquipmentGrantItemForm,
} from './equipment-grant-form-fields'

function formatExplicitPoolTitle(slugs: string[], equipmentOptions: FieldOption[]): string {
  const labels = slugs.map(
    (slug) => equipmentOptions.find((option) => option.value === slug)?.label ?? slug,
  )
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} items`
}

/** Clears category filters that do not match the selected equipment kind. */
export function applyEquipmentGrantKindSync(
  row: EquipmentGrantChoiceItemForm,
): EquipmentGrantChoiceItemForm {
  if (row.poolSource !== 'filtered' || !row.poolEquipmentKind) {
    return row
  }

  return {
    ...row,
    poolToolCategory:
      row.poolEquipmentKind === 'tool' ? row.poolToolCategory : EQUIPMENT_POOL_CATEGORY_ANY,
    poolWeaponCategory:
      row.poolEquipmentKind === 'weapon' ? row.poolWeaponCategory : EQUIPMENT_POOL_CATEGORY_ANY,
    poolArmorCategory:
      row.poolEquipmentKind === 'armor' ? row.poolArmorCategory : EQUIPMENT_POOL_CATEGORY_ANY,
    poolGearKind:
      row.poolEquipmentKind === 'adventuring_gear' ? row.poolGearKind : EQUIPMENT_POOL_CATEGORY_ANY,
  }
}

function categoryFormValueToDomain(value: string | undefined): string | undefined {
  if (!value || value === EQUIPMENT_POOL_CATEGORY_ANY) return undefined
  return value
}

export function equipmentPoolToFormRow(
  pool: EquipmentPool,
): Pick<
  EquipmentGrantChoiceItemForm,
  | 'poolSource'
  | 'poolEquipmentSlugs'
  | 'poolEquipmentKind'
  | 'poolToolCategory'
  | 'poolWeaponCategory'
  | 'poolArmorCategory'
  | 'poolGearKind'
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
    poolToolCategory: pool.toolCategory ?? EQUIPMENT_POOL_CATEGORY_ANY,
    poolWeaponCategory: pool.weaponCategory ?? EQUIPMENT_POOL_CATEGORY_ANY,
    poolArmorCategory: pool.armorCategory ?? EQUIPMENT_POOL_CATEGORY_ANY,
    poolGearKind: pool.gearKind ?? EQUIPMENT_POOL_CATEGORY_ANY,
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

  const toolCategory = categoryFormValueToDomain(synced.poolToolCategory)
  if (toolCategory) {
    pool.toolCategory = toolCategory as Extract<
      EquipmentPool,
      { source: 'filtered' }
    >['toolCategory']
  }
  const weaponCategory = categoryFormValueToDomain(synced.poolWeaponCategory)
  if (weaponCategory) {
    pool.weaponCategory = weaponCategory as Extract<
      EquipmentPool,
      { source: 'filtered' }
    >['weaponCategory']
  }
  const armorCategory = categoryFormValueToDomain(synced.poolArmorCategory)
  if (armorCategory) {
    pool.armorCategory = armorCategory as Extract<
      EquipmentPool,
      { source: 'filtered' }
    >['armorCategory']
  }
  const gearKind = categoryFormValueToDomain(synced.poolGearKind)
  if (gearKind) {
    pool.gearKind = gearKind as Extract<EquipmentPool, { source: 'filtered' }>['gearKind']
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

  const choose = row.choose ?? 1
  let poolLabel: string

  if (row.poolSource === 'explicit') {
    poolLabel = formatExplicitPoolTitle(row.poolEquipmentSlugs ?? [], equipmentOptions)
  } else {
    poolLabel = formatEquipmentPoolLabel(equipmentPoolFromFormRow(row))
  }

  return `${poolLabel} — choose ${choose}`
}

export function equipmentGrantSummary(
  row: EquipmentGrantItemForm | undefined,
  equipmentOptions: FieldOption[] = [],
): string {
  if (!row) return ''

  const resolveEquipmentName = (slug: string) =>
    equipmentOptions.find((option) => option.value === slug)?.label

  return formatEquipmentGrantSentence(equipmentGrantFromFormRow(row), resolveEquipmentName)
}
