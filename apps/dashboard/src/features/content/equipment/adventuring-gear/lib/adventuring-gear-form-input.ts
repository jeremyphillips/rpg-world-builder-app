import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'
import { parseNewlineList } from '../../lib/parse-newline-list'

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
