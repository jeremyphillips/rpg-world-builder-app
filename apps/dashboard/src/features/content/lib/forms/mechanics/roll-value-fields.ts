import type { FieldConfig, FormItem } from '@rpg/ui/form'

export type RollValueFieldsOptions = {
  /** RHF path prefix for the RollValue object (e.g. `damage` or `roll`). */
  namePrefix: string
  label?: string
  visibility?: FieldConfig['visibility']
  required?: boolean
  defaultFaces?: number
}

/**
 * Composable atoms bound directly to RollValue paths (`dice.count`, `dice.faces`, `flat`).
 * Prefer this over DiceFormulaValue adapters for contract-shaped rolls.
 */
export function rollValueFieldConfigs({
  namePrefix,
  label = 'Roll',
  visibility,
  required,
  defaultFaces,
}: RollValueFieldsOptions): FieldConfig[] {
  return [
    {
      type: 'rollValue',
      name: namePrefix,
      label,
      width: 'auto',
      visibility,
      required,
      defaultFaces,
    },
  ]
}

/** Form-item wrapper when roll atoms are not placed inside a row. */
export function rollValueFields(options: RollValueFieldsOptions): FormItem[] {
  return rollValueFieldConfigs(options)
}
