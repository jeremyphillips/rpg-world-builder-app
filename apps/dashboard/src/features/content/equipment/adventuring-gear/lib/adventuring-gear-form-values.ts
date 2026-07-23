import { type AdventuringGearEquipment, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  parseEquipmentCreateInput,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import { parseNewlineList } from '../../lib/parse-newline-list'
import type { AdventuringGearEquipmentFormValues } from '../../lib/equipment-form-fields'

type AdventuringGearInput = Extract<CreateEquipmentInput, { kind: 'adventuring_gear' }>

/** Joins mechanical property lines for the unified equipment form textarea. */
export function formatPropertiesText(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

export function adventuringGearFormValuesFromEntity(
  item: AdventuringGearEquipment,
): Pick<
  AdventuringGearEquipmentFormValues,
  | 'gearKind'
  | 'spellcastingGearKind'
  | 'bundleSize'
  | 'storage'
  | 'propertiesText'
  | 'capacity'
  | 'holySymbolUsage'
  | 'alsoWeaponSlug'
> {
  return {
    gearKind: item.gearKind,
    spellcastingGearKind: item.spellcastingGearKind,
    bundleSize: item.bundleSize,
    storage: item.storage,
    propertiesText: formatPropertiesText(item.properties),
    capacity: item.capacity,
    holySymbolUsage: item.holySymbolUsage,
    alsoWeaponSlug: item.alsoWeaponSlug,
  }
}

function optionalGearKind(
  values: EquipmentInputBuildCtx<'adventuring_gear'>['values'],
  isDraft: boolean,
): Partial<AdventuringGearInput> {
  if (values.gearKind) return { gearKind: values.gearKind }
  if (isDraft) return {}
  return { gearKind: 'general' }
}

function optionalAdventuringGearFields(
  values: EquipmentInputBuildCtx<'adventuring_gear'>['values'],
): Partial<AdventuringGearInput> {
  const properties = parseNewlineList(values.propertiesText)
  return {
    ...(values.spellcastingGearKind && { spellcastingGearKind: values.spellcastingGearKind }),
    ...(values.bundleSize !== undefined && { bundleSize: values.bundleSize }),
    ...(values.storage && { storage: values.storage }),
    ...(properties && { properties }),
    ...(values.capacity && { capacity: values.capacity }),
    ...(values.holySymbolUsage?.length && { holySymbolUsage: values.holySymbolUsage }),
    ...(values.alsoWeaponSlug && { alsoWeaponSlug: values.alsoWeaponSlug }),
  }
}

/** Maps adventuring gear form values to a create/update API input fragment. */
export function buildAdventuringGearInput({
  values,
  ctx,
  weight,
  validationIntent = 'publish',
}: EquipmentInputBuildCtx<'adventuring_gear'>): CreateEquipmentInput {
  const isDraft = validationIntent === 'draft'

  return parseEquipmentCreateInput(
    {
      ...equipmentInputBase(values, ctx, validationIntent),
      kind: 'adventuring_gear',
      ...optionalGearKind(values, isDraft),
      ...(weight && { weight }),
      ...optionalAdventuringGearFields(values),
    },
    validationIntent,
  )
}
