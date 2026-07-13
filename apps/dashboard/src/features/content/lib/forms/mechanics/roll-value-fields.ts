import { DIE_FACES } from '@rpg/contracts/primitives'
import type {
  FieldConfig,
  FieldVisibility,
  FormItem,
  InlineSentenceFieldConfig,
} from '@rpg/ui/form'

import { ROLL_FLAT_OPERATORS } from './roll-form-values'

const dieFaceOptions = DIE_FACES.map((face) => ({
  value: String(face),
  label: String(face),
}))

const rollFlatOperatorOptions = ROLL_FLAT_OPERATORS.map((operator) => ({
  value: operator,
  label: operator,
}))

export type RollValueFieldsOptions = {
  /** RHF path prefix for the RollValue object (e.g. `damage` or `roll`). */
  namePrefix: string
  label?: string
  visibility?: FieldVisibility
  required?: boolean
}

function rollDiceInlineSentence({
  namePrefix,
  label = 'Roll',
  visibility,
  required,
}: RollValueFieldsOptions): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: namePrefix,
    label,
    width: 'auto',
    visibility,
    required,
    segments: [
      {
        kind: 'number',
        name: `${namePrefix}.dice.count`,
        min: 1,
        digits: 2,
        defaultValue: 1,
        ariaLabel: 'Dice count',
      },
      { kind: 'text', value: 'd', tone: 'mono' },
      {
        kind: 'select',
        name: `${namePrefix}.dice.faces`,
        options: dieFaceOptions,
        digits: 3,
        defaultValue: '6',
        ariaLabel: 'Die faces',
      },
      {
        kind: 'select',
        name: `${namePrefix}.flatOperator`,
        options: rollFlatOperatorOptions,
        defaultValue: '+',
        ariaLabel: 'Flat sign',
        width: 'auto',
        digits: 1,
      },
      {
        kind: 'number',
        name: `${namePrefix}.flatAmount`,
        min: 0,
        digits: 3,
        defaultValue: 0,
        ariaLabel: 'Flat modifier',
      },
    ],
  }
}

/**
 * Composable atoms bound directly to RollValue paths (`dice.count`, `dice.faces`, `flat`).
 * Prefer this over DiceFormulaValue adapters for contract-shaped rolls.
 */
export function rollValueFieldConfigs(options: RollValueFieldsOptions): FieldConfig[] {
  return [rollDiceInlineSentence(options)]
}

/** Form-item wrapper when roll atoms are not placed inside a row. */
export function rollValueFields(options: RollValueFieldsOptions): FormItem[] {
  return rollValueFieldConfigs(options)
}
