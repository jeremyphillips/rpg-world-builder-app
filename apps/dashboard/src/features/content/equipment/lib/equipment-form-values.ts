import {
  type ArmorClassRules,
  type ContentValidationIntent,
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'

import { weightFromForm, weightToForm } from '../../lib/forms/fields/content-economy-form-fields'
import { finalizeContentInput } from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import { costToForm } from './equipment-economy-form-values'
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
import type { EquipmentFormValues, EquipmentFormValuesFor } from './equipment-form-fields'
import type { EquipmentInputBuildCtx } from './equipment-form-values-base'

function sharedWeightToForm(
  entity: Equipment,
): EquipmentFormValuesFor<'weapon'>['weight'] | undefined {
  if (entity.kind === 'service') return undefined
  return weightToForm(entity.weight)
}

function sharedFormValues(entity: Equipment): Pick<
  EquipmentFormValues,
  'name' | 'slug' | 'description' | 'kind' | 'hasMarketPrice' | 'cost'
> & {
  weight?: EquipmentFormValuesFor<'weapon'>['weight']
} {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    kind: entity.kind,
    ...costToForm(entity.cost, entity.kind),
    weight: sharedWeightToForm(entity),
  }
}

type KindFormExtractor = (
  entity: Equipment,
  rules?: ArmorClassRules,
) => Partial<EquipmentFormValues>

const kindFormValueExtractors: Record<EquipmentKind, KindFormExtractor> = {
  weapon: (entity) => weaponFormValuesFromEntity(entity as Extract<Equipment, { kind: 'weapon' }>),
  armor: (entity, rules) =>
    armorFormValuesFromEntity(entity as Extract<Equipment, { kind: 'armor' }>, rules),
  adventuring_gear: (entity) =>
    adventuringGearFormValuesFromEntity(entity as Extract<Equipment, { kind: 'adventuring_gear' }>),
  tool: (entity) => toolFormValuesFromEntity(entity as Extract<Equipment, { kind: 'tool' }>),
  mount: (entity) => mountFormValuesFromEntity(entity as Extract<Equipment, { kind: 'mount' }>),
  vehicle: (entity, rules) =>
    vehicleFormValuesFromEntity(entity as Extract<Equipment, { kind: 'vehicle' }>, rules),
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
    const spellcastingGearKind =
      focusType === 'holy'
        ? 'holy_symbol'
        : focusType === 'druidic'
          ? 'druidic_focus'
          : 'arcane_focus'
    return {
      kind: 'adventuring_gear',
      gearKind: 'spellcasting',
      spellcastingGearKind,
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

function kindFormValues(entity: Equipment, rules?: ArmorClassRules): Partial<EquipmentFormValues> {
  const extractor = kindFormValueExtractors[entity.kind as EquipmentKind]
  return extractor ? extractor(entity, rules) : legacyKindFormValues(entity)
}

export function equipmentToFormValues(
  entity: Equipment,
  ctx?: { armorClassRules?: ArmorClassRules },
) {
  return {
    ...sharedFormValues(entity),
    ...kindFormValues(entity, ctx?.armorClassRules),
  }
}

function equipmentInputWeight(
  kind: EquipmentKind,
  values: EquipmentFormValues,
): ReturnType<typeof weightFromForm> {
  if (kind === 'service') return undefined
  return weightFromForm((values as EquipmentFormValuesFor<typeof kind>).weight)
}

type KindInputBuilder = (ctx: EquipmentInputBuildCtx<EquipmentKind>) => CreateEquipmentInput

const kindInputBuilders: Record<EquipmentKind, KindInputBuilder> = {
  weapon: (ctx) => buildWeaponInput(ctx as EquipmentInputBuildCtx<'weapon'>),
  armor: (ctx) => buildArmorInput(ctx as EquipmentInputBuildCtx<'armor'>),
  adventuring_gear: (ctx) =>
    buildAdventuringGearInput(ctx as EquipmentInputBuildCtx<'adventuring_gear'>),
  tool: (ctx) => buildToolInput(ctx as EquipmentInputBuildCtx<'tool'>),
  mount: (ctx) => buildMountInput(ctx as EquipmentInputBuildCtx<'mount'>),
  vehicle: (ctx) => buildVehicleInput(ctx as EquipmentInputBuildCtx<'vehicle'>),
  service: (ctx) => buildServiceInput(ctx as EquipmentInputBuildCtx<'service'>),
  magic_item: (ctx) => buildMagicItemInput(ctx as EquipmentInputBuildCtx<'magic_item'>),
}

/** Maps unified equipment form values to a create/update API input. */
export function equipmentFormToInput(
  values: EquipmentFormValues,
  ctx?: ContentFormInputCtx<Equipment>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateEquipmentInput {
  const kind = ctx?.equipmentKind ?? values.kind
  const buildCtx = {
    values: values as EquipmentFormValuesFor<typeof kind>,
    ctx,
    weight: equipmentInputWeight(kind, values),
    validationIntent,
  } as EquipmentInputBuildCtx<typeof kind>

  const input = kindInputBuilders[kind](buildCtx)
  return finalizeContentInput(input, ctx) as CreateEquipmentInput
}
