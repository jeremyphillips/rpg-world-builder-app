import type { Equipment, EquipmentModifier, MonsterBody } from '@rpg/contracts'
import { isArmorEquipment, isWeaponEquipment } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../content.service'
import { equipmentRegistration } from '../equipment/equipment.config'
import type { ContentWriteContext } from '../lib/content-write-config'

function asMonsterBody(input: Record<string, unknown>): MonsterBody {
  return input as MonsterBody
}

function countArmorClassModifiers(modifiers: readonly EquipmentModifier[] | undefined): number {
  return modifiers?.filter((modifier) => modifier.kind === 'armor_class').length ?? 0
}

function validateEquipmentEntry(
  entry: MonsterBody['equipment'][number],
  item: Equipment | undefined,
): number {
  if (!item) {
    throw new Error(`Unknown equipment id: ${entry.equipmentId}`)
  }
  if (countArmorClassModifiers(entry.modifiers) > 1) {
    throw new Error('At most one armor_class modifier per equipment instance.')
  }
  if (
    entry.modifiers?.some((modifier) => modifier.kind === 'armor_class') &&
    !isArmorEquipment(item)
  ) {
    throw new Error('armor_class modifiers are only allowed on armor or shields.')
  }
  if (entry.equipped && isArmorEquipment(item) && item.category !== 'shields') {
    return 1
  }
  return 0
}

function validateBodyArmorPolicy(body: MonsterBody, equippedBodyArmor: number): void {
  if (body.armorClass?.kind === 'equipment' && equippedBodyArmor !== 1) {
    throw new Error('equipment armor class requires exactly one equipped body armor piece.')
  }
  if (
    (body.armorClass?.kind === 'unarmored' || body.armorClass?.kind === 'natural') &&
    equippedBodyArmor > 0
  ) {
    throw new Error('unarmored and natural armor cannot have equipped body armor.')
  }
}

function validateWeaponActions(body: MonsterBody, equipmentById: Map<string, Equipment>): void {
  for (const action of body.actions ?? []) {
    if (action.kind !== 'weapon') continue
    const item = body.equipment?.find((entry) => entry.entryId === action.equipmentEntryId)
    const equipment = item ? equipmentById.get(item.equipmentId) : undefined
    if (!equipment || !isWeaponEquipment(equipment)) {
      throw new Error(`Weapon action ${action.id} must reference a weapon equipment entry.`)
    }
  }
}

export async function monstersValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const body = asMonsterBody(
    ctx.mode === 'update' && ctx.existing
      ? { ...(ctx.existing as Record<string, unknown>), ...ctx.input }
      : ctx.input,
  )

  const equipmentCatalog = await resolveCatalogForCampaign(
    equipmentRegistration.read,
    ctx.campaignId,
  )
  const equipmentById = new Map(equipmentCatalog.map((row) => [row.id, row]))

  let equippedBodyArmor = 0
  for (const entry of body.equipment ?? []) {
    equippedBodyArmor += validateEquipmentEntry(entry, equipmentById.get(entry.equipmentId))
  }

  validateBodyArmorPolicy(body, equippedBodyArmor)
  validateWeaponActions(body, equipmentById)
}
