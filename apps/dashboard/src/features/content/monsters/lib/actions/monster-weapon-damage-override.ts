import {
  formatWeaponDamage,
  getDamageTypeLabel,
  isWeaponEquipment,
  joinInlineMetadata,
  type Equipment,
  type RollValue,
} from '@rpg/contracts'
import type { FieldConfig } from '@rpg/ui/form'

import { rollToFormShape } from '../../../lib/forms/mechanics/roll-form-values'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog } from '../monster-form-derivation'
import {
  MONSTER_BASE_DAMAGE_OVERRIDE_LABEL,
  MONSTER_DAMAGE_OVERRIDE_ADD_LABEL,
  MONSTER_DAMAGE_OVERRIDE_REMOVE_LABEL,
  MONSTER_WEAPON_DAMAGE_NONE_LABEL,
  MONSTER_WEAPON_DAMAGE_REPLACING_LABEL,
  MONSTER_WEAPON_DAMAGE_UNAVAILABLE_LABEL,
  MONSTER_WEAPON_DAMAGE_USING_LABEL,
} from '../monster-form-labels'
import { catalogBaseRoll } from './monster-weapon-damage-form'

const OVERRIDE_DEPENDS_ON = ['equipmentEntryId', '../../equipment'] as const

type EquipmentRef = { entryId?: string; equipmentId?: string }

function equipmentRows(value: unknown): readonly EquipmentRef[] {
  if (!Array.isArray(value)) return []
  return value.filter((row): row is EquipmentRef => Boolean(row) && typeof row === 'object')
}

function linkedWeapon(
  ctx: ContentFormCtx,
  equipment: readonly EquipmentRef[],
  equipmentEntryId: unknown,
): Extract<Equipment, { kind: 'weapon' }> | undefined {
  if (ctx.equipmentCatalogStatus !== 'ready') return undefined
  if (typeof equipmentEntryId !== 'string' || equipmentEntryId.length === 0) return undefined
  const entry = equipment.find((row) => row.entryId === equipmentEntryId)
  if (!entry?.equipmentId) return undefined
  const item = monsterEquipmentCatalog(ctx).get(entry.equipmentId)
  if (!item || !isWeaponEquipment(item)) return undefined
  return item
}

function damageTypePhrase(damageType: string | undefined): string | undefined {
  if (!damageType) return undefined
  const label = getDamageTypeLabel(damageType).trim()
  return label.length > 0 ? label.toLowerCase() : undefined
}

function inheritedRollPhrase(
  roll: RollValue,
  damageType: string | undefined,
  includeDamageType: boolean,
): string {
  const type = includeDamageType ? damageTypePhrase(damageType) : undefined
  return type ? `${formatWeaponDamage(roll)} ${type}` : formatWeaponDamage(roll)
}

export function monsterWeaponDamageOverrideSummary(
  ctx: ContentFormCtx,
  values: { equipmentEntryId?: unknown; equipment?: unknown },
  open: boolean,
): string {
  const weapon = linkedWeapon(ctx, equipmentRows(values.equipment), values.equipmentEntryId)
  if (!weapon) return MONSTER_WEAPON_DAMAGE_UNAVAILABLE_LABEL
  const base = catalogBaseRoll(weapon.damage)
  if (!base) return MONSTER_WEAPON_DAMAGE_NONE_LABEL
  const lead = open ? MONSTER_WEAPON_DAMAGE_REPLACING_LABEL : MONSTER_WEAPON_DAMAGE_USING_LABEL
  return joinInlineMetadata([lead, inheritedRollPhrase(base, weapon.damageType, !open)])
}

export function monsterWeaponDamageOverrideSeed(
  ctx: ContentFormCtx,
  values: { equipmentEntryId?: unknown; equipment?: unknown },
): Record<string, unknown> {
  const weapon = linkedWeapon(ctx, equipmentRows(values.equipment), values.equipmentEntryId)
  const base = weapon ? catalogBaseRoll(weapon.damage) : undefined
  if (!base) return {}
  return rollToFormShape(base) ?? {}
}

export function monsterWeaponDamageOverrideAddDisabled(
  ctx: ContentFormCtx,
  equipment: readonly EquipmentRef[],
  equipmentEntryId: unknown,
  damage: unknown,
): boolean {
  if (damage != null && typeof damage === 'object' && !Array.isArray(damage)) return false
  return linkedWeapon(ctx, equipment, equipmentEntryId) === undefined
}

export function monsterWeaponDamageOverrideField(args: {
  ctx: ContentFormCtx
  equipment: readonly EquipmentRef[]
  equipmentEntryId: unknown
  damage: unknown
}): FieldConfig {
  const { ctx } = args
  return {
    type: 'rollValue',
    name: 'damage',
    label: MONSTER_BASE_DAMAGE_OVERRIDE_LABEL,
    width: 'auto',
    optionalDisclosure: {
      labeled: true,
      addLabel: MONSTER_DAMAGE_OVERRIDE_ADD_LABEL,
      removeLabel: MONSTER_DAMAGE_OVERRIDE_REMOVE_LABEL,
      addDisabled: monsterWeaponDamageOverrideAddDisabled(
        ctx,
        args.equipment,
        args.equipmentEntryId,
        args.damage,
      ),
      summary: {
        dependsOn: OVERRIDE_DEPENDS_ON,
        resolve: (values, state) =>
          monsterWeaponDamageOverrideSummary(
            ctx,
            {
              equipmentEntryId: values.equipmentEntryId,
              equipment: values['../../equipment'],
            },
            state.open,
          ),
      },
      seedWhen: (values) =>
        monsterWeaponDamageOverrideSeed(ctx, {
          equipmentEntryId: values.equipmentEntryId,
          equipment: values['../../equipment'],
        }),
    },
  }
}
