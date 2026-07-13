import { DIE_FACES } from '@rpg/contracts/primitives'
import type {
  FieldConfig,
  FieldVisibility,
  FormItem,
  InlineSentenceFieldConfig,
} from '@rpg/ui/form'

const dieFaceOptions = DIE_FACES.map((face) => ({
  value: String(face),
  label: `d${face}`,
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
      { kind: 'text', value: 'd', tone: 'label' },
      {
        kind: 'select',
        name: `${namePrefix}.dice.faces`,
        options: dieFaceOptions,
        width: 'auto',
        digits: 2,
        defaultValue: '6',
        ariaLabel: 'Die faces',
      },
    ],
  }
}

/**
 * Composable atoms bound directly to RollValue paths (`dice.count`, `dice.faces`, `flat`).
 * Prefer this over DiceFormulaValue adapters for contract-shaped rolls.
 */
export function rollValueFieldConfigs(options: RollValueFieldsOptions): FieldConfig[] {
  const { namePrefix, label, visibility, required } = options

  return [
    rollDiceInlineSentence({ namePrefix, label, visibility, required }),
    {
      type: 'number',
      name: `${namePrefix}.flat`,
      label: 'Flat modifier',
      hint: 'Optional signed flat bonus or penalty (e.g. +1 or -1).',
      hintPosition: 'below-control',
      digits: 3,
      width: 'auto',
      visibility,
    },
  ]
}

/** Form-item wrapper when roll atoms are not placed inside a row. */
export function rollValueFields(options: RollValueFieldsOptions): FormItem[] {
  return rollValueFieldConfigs(options)
}
