import {
  createEquipmentInputSchema,
  type AdventuringGearEquipment,
  type CreateEquipmentInput,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import { parseNewlineList } from '../../lib/parse-newline-list'
import type { EquipmentFormValues } from '../../lib/equipment-form-fields'

/** Joins mechanical property lines for the unified equipment form textarea. */
export function formatPropertiesText(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

export function adventuringGearFormValuesFromEntity(
  item: AdventuringGearEquipment,
): Pick<
  EquipmentFormValues,
  | 'gearKind'
  | 'bundleSize'
  | 'storage'
  | 'propertiesText'
  | 'capacity'
  | 'holySymbolUsage'
  | 'alsoWeaponSlug'
> {
  return {
    gearKind: item.gearKind,
    bundleSize: item.bundleSize,
    storage: item.storage,
    propertiesText: formatPropertiesText(item.properties),
    capacity: item.capacity,
    holySymbolUsage: item.holySymbolUsage,
    alsoWeaponSlug: item.alsoWeaponSlug,
  }
}

/** Maps adventuring gear form values to a create/update API input fragment. */
export function buildAdventuringGearInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'adventuring_gear',
    gearKind: values.gearKind ?? 'general',
    ...(weight && { weight }),
    ...(values.bundleSize !== undefined && { bundleSize: values.bundleSize }),
    ...(values.storage && { storage: values.storage }),
    ...(parseNewlineList(values.propertiesText) && {
      properties: parseNewlineList(values.propertiesText),
    }),
    ...(values.capacity && { capacity: values.capacity }),
    ...(values.holySymbolUsage?.length && { holySymbolUsage: values.holySymbolUsage }),
    ...(values.alsoWeaponSlug && { alsoWeaponSlug: values.alsoWeaponSlug }),
  })
}
