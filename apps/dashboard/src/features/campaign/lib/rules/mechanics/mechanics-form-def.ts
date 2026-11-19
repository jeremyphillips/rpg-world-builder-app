import {
  buildMechanicsConfigFields,
  buildMechanicsValueSyncs,
  mechanicsValuesSchema,
  type MechanicsFieldOptions,
} from './mechanics-form-fields'

/** Mechanics rules config — schema, fields, and value syncs stay on one definition. */
export const mechanicsFormDef = {
  schema: mechanicsValuesSchema,
  buildFields: buildMechanicsConfigFields,
  valueSyncs: buildMechanicsValueSyncs,
} as const

export type MechanicsFormDefOptions = MechanicsFieldOptions
