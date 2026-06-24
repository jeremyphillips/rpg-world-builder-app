import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'

function parseProperties(text: string | undefined): string[] | undefined {
  if (!text?.trim()) return undefined
  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
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
    ...(parseProperties(values.propertiesText) && {
      properties: parseProperties(values.propertiesText),
    }),
    ...(values.capacity && { capacity: values.capacity }),
  })
}
