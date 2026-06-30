import { type CreateEquipmentInput, type Equipment } from '@rpg/contracts'

import { costToFormDefaults } from '../../lib/content-economy-form-fields'
import { contentFormRegistry, type ContentFormDef } from '../../lib/content-form-registry'
import { useEquipment, equipmentQueryKey } from '../hooks/use-equipment'
import {
  buildEquipmentFields,
  equipmentFormSchema,
  type EquipmentFormValues,
} from './equipment-form-fields'
import { equipmentFormToInput, equipmentToFormValues } from './equipment-form-values'

const equipmentFormDef: ContentFormDef<Equipment, EquipmentFormValues, CreateEquipmentInput> = {
  routeKey: 'equipment',
  schema: equipmentFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: {
    kind: 'adventuring_gear',
    gearKind: 'general',
    cost: costToFormDefaults(),
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
