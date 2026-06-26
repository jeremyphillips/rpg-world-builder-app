import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'

function parseCrafts(text: string | undefined): string[] | undefined {
  if (!text?.trim()) return undefined
  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

/** Maps tool form values to a create/update API input fragment. */
export function buildToolInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  const crafts = parseCrafts(values.craftsText)

  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'tool',
    toolCategory: values.toolCategory ?? 'other',
    ability: values.ability ?? 'int',
    utilizes: values.utilizes ?? [],
    ...(weight && { weight }),
    ...(crafts && { crafts }),
  })
}
