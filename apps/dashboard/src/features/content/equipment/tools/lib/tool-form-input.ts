import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'
import { parseNewlineList } from '../../lib/parse-newline-list'

/** Maps tool form values to a create/update API input fragment. */
export function buildToolInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  const crafts = parseNewlineList(values.craftsText)

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
