import {
  parseSpeedRateString,
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'

import { weightFromForm, weightToForm } from '../../lib/forms/fields/content-economy-form-fields'
import { finalizeContentInput } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import { armorFormValuesFromEntity, buildArmorInput } from '../armor/lib/armor-form-values'
import {
  adventuringGearFormValuesFromEntity,
  buildAdventuringGearInput,
  formatPropertiesText,
} from '../adventuring-gear/lib/adventuring-gear-form-values'
import {
  buildMagicItemInput,
  magicItemFormValuesFromEntity,
} from '../magic-items/lib/magic-item-form-values'
import { buildMountInput, mountFormValuesFromEntity } from '../mounts/lib/mount-form-values'
import { buildServiceInput, serviceFormValuesFromEntity } from '../services/lib/service-form-values'
import { buildToolInput, toolFormValuesFromEntity } from '../tools/lib/tool-form-values'
import { buildVehicleInput, vehicleFormValuesFromEntity } from '../vehicles/lib/vehicle-form-values'
import { buildWeaponInput, weaponFormValuesFromEntity } from '../weapons/lib/weapon-form-values'
import type { EquipmentFormValues } from './equipment-form-fields'
import type { EquipmentInputBuildCtx } from './equipment-form-values-base'

function sharedWeightToForm(entity: Equipment): EquipmentFormValues['weight'] {
  if (entity.kind === 'service') return undefined
  return weightToForm(entity.weight)
}

function sharedFormValues(
  entity: Equipment,
): Pick<EquipmentFormValues, 'name' | 'slug' | 'description' | 'kind' | 'cost' | 'weight'> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    kind: entity.kind,
    cost: entity.cost,
    weight: sharedWeightToForm(entity),
  }
}

type KindFormExtractor = (entity: Equipment) => Partial<EquipmentFormValues>

const kindFormValueExtractors: Record<EquipmentKind, KindFormExtractor> = {
  weapon: (entity) => weaponFormValuesFromEntity(entity as Extract<Equipment, { kind: 'weapon' }>),
  armor: (entity) => armorFormValuesFromEntity(entity as Extract<Equipment, { kind: 'armor' }>),
  adventuring_gear: (entity) =>
    adventuringGearFormValuesFromEntity(entity as Extract<Equipment, { kind: 'adventuring_gear' }>),
  tool: (entity) => toolFormValuesFromEntity(entity as Extract<Equipment, { kind: 'tool' }>),
  mount: (entity) => mountFormValuesFromEntity(entity as Extract<Equipment, { kind: 'mount' }>),
  vehicle: (entity) =>
    vehicleFormValuesFromEntity(entity as Extract<Equipment, { kind: 'vehicle' }>),
  service: (entity) =>
    serviceFormValuesFromEntity(entity as Extract<Equipment, { kind: 'service' }>),
  magic_item: (entity) =>
    magicItemFormValuesFromEntity(entity as Extract<Equipment, { kind: 'magic_item' }>),
}

function legacyKindFormValues(entity: Equipment): Partial<EquipmentFormValues> {
  const legacyKind = entity.kind as string
  const legacy = entity as Equipment & Record<string, unknown>
  if (legacyKind === 'gear') {
    return {
      kind: 'adventuring_gear',
      gearKind: 'general',
      propertiesText: formatPropertiesText((legacy as { properties?: string[] }).properties),
      capacity: (legacy as { capacity?: string }).capacity,
    }
  }
  if (legacyKind === 'ammunition') {
    return {
      kind: 'adventuring_gear',
      gearKind: 'ammunition',
      bundleSize: (legacy as { bundleSize?: number }).bundleSize,
      storage: (legacy as { storage?: string }).storage,
    }
  }
  if (legacyKind === 'focus') {
    const focusType = (legacy as { focusType?: string }).focusType
    return {
      kind: 'adventuring_gear',
      gearKind:
        focusType === 'holy'
          ? 'holy_symbol'
          : focusType === 'druidic'
            ? 'druidic_focus'
            : 'arcane_focus',
    }
  }
  if (legacyKind === 'ship') {
    const legacySpeed = (legacy as { speed?: string }).speed
    return {
      kind: 'vehicle',
      vehicleCategory: 'water',
      speed: legacySpeed ? parseSpeedRateString(legacySpeed) : undefined,
      crew: (legacy as { crew?: number }).crew,
      passengers: (legacy as { passengers?: number }).passengers,
      cargoCapacity: (() => {
        const cargoTons = (legacy as Record<string, unknown>).cargoTons
        return typeof cargoTons === 'number'
          ? { value: cargoTons, unit: 'ton' as const }
          : undefined
      })(),
      ac: (legacy as { ac?: number }).ac,
      hp: (legacy as { hp?: number }).hp,
      damageThreshold: (legacy as { damageThreshold?: number }).damageThreshold,
    }
  }
  if (legacyKind === 'misc') {
    return {
      kind: 'service',
      serviceCategory: 'other',
      notes: (legacy as { notes?: string }).notes,
    }
  }
  return {}
}

function kindFormValues(entity: Equipment): Partial<EquipmentFormValues> {
  const extractor = kindFormValueExtractors[entity.kind as EquipmentKind]
  return extractor ? extractor(entity) : legacyKindFormValues(entity)
}

export function equipmentToFormValues(entity: Equipment) {
  return {
    ...sharedFormValues(entity),
    ...kindFormValues(entity),
  }
}

const kindInputBuilders: Record<
  EquipmentKind,
  (ctx: EquipmentInputBuildCtx) => CreateEquipmentInput
> = {
  weapon: buildWeaponInput,
  armor: buildArmorInput,
  adventuring_gear: buildAdventuringGearInput,
  tool: buildToolInput,
  mount: buildMountInput,
  vehicle: buildVehicleInput,
  service: buildServiceInput,
  magic_item: buildMagicItemInput,
}

/** Maps unified equipment form values to a create/update API input. */
export function equipmentFormToInput(
  values: EquipmentFormValues,
  ctx?: ContentFormInputCtx<Equipment>,
): CreateEquipmentInput {
  const kind = ctx?.equipmentKind ?? values.kind
  const weight = kind !== 'service' ? weightFromForm(values.weight) : undefined
  const input = kindInputBuilders[kind]({ values: { ...values, kind }, ctx, weight })
  return finalizeContentInput(input, ctx) as CreateEquipmentInput
}
