import type {
  EquipmentChoiceGrant,
  EquipmentGrant,
  EquipmentPool,
  GrantedEquipmentItem,
} from '@rpg/contracts'
import { formatEquipmentGrantSentence, formatEquipmentPoolLabel } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { PROFICIENCY_LINK_SUMMARY } from '../../../classes/lib/character-creation/class-character-creation-link-labels'
import { EQUIPMENT_POOL_CATEGORY_ANY } from './equipment-grant-form-fields'
import type {
  EquipmentGrantChoiceItemForm,
  EquipmentGrantItemForm,
  GrantedEquipmentItemForm,
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
    poolSpellcastingGearKind:
      row.poolEquipmentKind === 'adventuring_gear' && row.poolGearKind === 'spellcasting'
        ? row.poolSpellcastingGearKind
        : EQUIPMENT_POOL_CATEGORY_ANY,
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
  | 'poolSpellcastingGearKind'
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
    poolSpellcastingGearKind: pool.spellcastingGearKind ?? EQUIPMENT_POOL_CATEGORY_ANY,
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
  const spellcastingGearKind = categoryFormValueToDomain(synced.poolSpellcastingGearKind)
  if (spellcastingGearKind) {
    pool.spellcastingGearKind = spellcastingGearKind as Extract<
      EquipmentPool,
      { source: 'filtered' }
    >['spellcastingGearKind']
  }

  return pool
}

function grantedItemToFormRow(grant: GrantedEquipmentItem): EquipmentGrantItemForm {
  return {
    itemKind: 'grant',
    grantTargetSource: 'equipment',
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
  return grant.kind === 'grant' ? grantedItemToFormRow(grant) : choiceGrantToFormRow(grant)
}

function grantedItemFromFormRow(row: GrantedEquipmentItemForm): GrantedEquipmentItem {
  const grant: GrantedEquipmentItem = {
    kind: 'grant',
    equipmentSlug: row.equipmentSlug ?? '',
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
  return row.itemKind === 'grant' ? grantedItemFromFormRow(row) : choiceGrantFromFormRow(row)
}

function formatQuantityPrefixedLabel(name: string, quantity: number): string {
  return quantity > 1 ? `${quantity} × ${name}` : `1 × ${name}`
}

function equipmentGrantTitleForProficiencyChoice(
  row: GrantedEquipmentItemForm,
  index: number,
  proficiencyChoiceOptions: FieldOption[],
): string {
  if (!row.proficiencyChoiceId) return `Item ${index + 1}`

  const matchedOption = proficiencyChoiceOptions.find(
    (option) => option.value === row.proficiencyChoiceId,
  )
  const choiceLabel = matchedOption?.label ?? row.proficiencyChoiceId
  const quantity = row.quantity ?? 1
  const prefix = quantity > 1 ? `${quantity} × ` : '1 × '
  return `${prefix}Tool selected in "${choiceLabel}"`
}

function equipmentGrantTitleForEquipmentGrant(
  row: GrantedEquipmentItemForm,
  index: number,
  equipmentOptions: FieldOption[],
): string {
  const label = equipmentOptions.find((option) => option.value === row.equipmentSlug)?.label
  const name = label ?? row.equipmentSlug ?? `Item ${index + 1}`
  return formatQuantityPrefixedLabel(name, row.quantity ?? 1)
}

function equipmentGrantTitleForChoice(
  row: EquipmentGrantChoiceItemForm,
  index: number,
  equipmentOptions: FieldOption[],
): string {
  const choose = row.choose ?? 1
  const poolLabel = resolveChoicePoolLabel(row, equipmentOptions)
  if (!poolLabel) return `Item ${index + 1}`

  return `${poolLabel} — choose ${choose}`
}

function resolveChoicePoolLabel(
  row: EquipmentGrantChoiceItemForm,
  equipmentOptions: FieldOption[],
): string | undefined {
  if (row.poolSource === 'explicit') {
    return formatExplicitPoolTitle(row.poolEquipmentSlugs ?? [], equipmentOptions)
  }

  if (!row.poolEquipmentKind) return undefined

  return formatEquipmentPoolLabel(equipmentPoolFromFormRow(row))
}

export function equipmentGrantTitle(
  row: EquipmentGrantItemForm | undefined,
  index: number,
  equipmentOptions: FieldOption[] = [],
  proficiencyChoiceOptions: FieldOption[] = [],
): string {
  if (!row) return `Item ${index + 1}`

  if (row.itemKind === 'grant') {
    if (row.grantTargetSource === 'proficiency_choice') {
      return equipmentGrantTitleForProficiencyChoice(row, index, proficiencyChoiceOptions)
    }
    return equipmentGrantTitleForEquipmentGrant(row, index, equipmentOptions)
  }

  return equipmentGrantTitleForChoice(row, index, equipmentOptions)
}

function isEquipmentGrantSummaryComplete(row: EquipmentGrantItemForm): boolean {
  if (row.itemKind === 'grant') {
    if (row.grantTargetSource === 'proficiency_choice') {
      return Boolean(row.proficiencyChoiceId)
    }
    return Boolean(row.equipmentSlug)
  }

  if (row.poolSource === 'explicit') {
    return (row.poolEquipmentSlugs?.length ?? 0) > 0
  }

  return Boolean(row.poolEquipmentKind)
}

export function equipmentGrantSummary(
  row: EquipmentGrantItemForm | undefined,
  equipmentOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind || !isEquipmentGrantSummaryComplete(row)) return ''

  if (row.itemKind === 'grant' && row.grantTargetSource === 'proficiency_choice') {
    return PROFICIENCY_LINK_SUMMARY
  }

  const resolveEquipmentName = (slug: string) =>
    equipmentOptions.find((option) => option.value === slug)?.label

  return formatEquipmentGrantSentence(equipmentGrantFromFormRow(row), resolveEquipmentName)
}
