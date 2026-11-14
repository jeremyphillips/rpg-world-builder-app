import type {
  DiceFormulaLabelPosition,
  DiceFormulaModifierMode,
  DiceFormulaTailOperator,
  DiceFormulaValue,
} from '../../components/ui/dice-formula-field.lib'

import type { BaseFieldConfig, OptionalDisclosureConfig } from './field-base.types'
import type { FieldOption } from './field-options'

export interface DiceFormulaFieldConfig extends BaseFieldConfig {
  type: 'diceFormula'
  labelPosition?: DiceFormulaLabelPosition
  /**
   * Tail modifier behavior — `none` strips modifier on change; `optional` shows add/remove;
   * `required` always renders the tail group.
   *
   * @default optional
   */
  modifierMode?: DiceFormulaModifierMode
  /**
   * Allowed die faces for the faces select. Defaults to standard RPG die set when omitted.
   * Pass a subset (e.g. `[4, 6, 8]`) to constrain authoring surfaces.
   */
  faces?: readonly number[]
  countMin?: number
  countMax?: number
  modifierMin?: number
  modifierMax?: number
  /**
   * Allowed tail operators (`DICE_FORMULA_TAIL_OPERATORS`: `'+'` | `'-'` | `'×'` | `'÷'`).
   * A single entry renders a static glyph instead of an operator select.
   * Defaults to `DICE_FORMULA_OPERATORS` (`['+', '-']`) when omitted.
   */
  modifierOperators?: readonly DiceFormulaTailOperator[]
  /** sr-only / aria label for the tail amount input (e.g. "Multiplier"). */
  modifierAmountLabel?: string
  /** Optional currency select rendered after the tail amount in the modifier group. */
  currencyUnit?: {
    /** Relative field name under the same parent object (default `currency`). */
    name?: string
    options: FieldOption[]
    defaultValue: string
  }
  defaultValue?: DiceFormulaValue
}

export interface RollValueFieldConfig extends BaseFieldConfig {
  type: 'rollValue'
  faces?: readonly number[]
  countMin?: number
  countMax?: number
  modifierMin?: number
  modifierMax?: number
  defaultCount?: number
  defaultFaces?: number
  optionalDisclosure?: OptionalDisclosureConfig
}
