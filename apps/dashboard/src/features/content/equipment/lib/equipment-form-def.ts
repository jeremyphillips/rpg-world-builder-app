import type { ZodType } from 'zod'
import { type CreateEquipmentInput, type Equipment } from '@rpg/contracts'

import { contentFormRegistry, type ContentFormDef } from '../../lib/forms/content-form-registry'
import { useEquipment, equipmentQueryKey } from '../hooks/use-equipment'
import { equipmentEconomyFormDefaults } from './equipment-economy-form-values'
import {
  buildEquipmentFields,
  equipmentFormSchema,
  resolveEquipmentFormSchema,
  type EquipmentFormValues,
} from './equipment-form-fields'
import { equipmentFormToInput, equipmentToFormValues } from './equipment-form-values'

const equipmentFormDef: ContentFormDef<Equipment, EquipmentFormValues, CreateEquipmentInput> = {
  routeKey: 'equipment',
  schema: equipmentFormSchema as ZodType<EquipmentFormValues>,
  resolveSchema: resolveEquipmentFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: {
    kind: 'adventuring_gear',
    gearKind: 'general',
    ...equipmentEconomyFormDefaults('adventuring_gear'),
  },
  buildFields: buildEquipmentFields,
  toFormValues: equipmentToFormValues,
  toInput: equipmentFormToInput,
  useListQuery: useEquipment,
  queryKey: equipmentQueryKey,
}

contentFormRegistry['equipment'] = equipmentFormDef

export { equipmentFormDef, equipmentFormSchema }
export type { EquipmentFormValues }
