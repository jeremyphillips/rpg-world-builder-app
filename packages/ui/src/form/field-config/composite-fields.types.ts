import type { FieldSize } from '../../components/ui/field.client'
import type { FieldDigits } from '../../components/ui/field-digit-metrics'
import type {
  EditableGridTemplates,
  EditableGridValue,
} from '../../components/ui/editable-grid.client'
import type {
  InlineSentenceBelowChips,
  InlineSentenceSegment,
} from '../../components/ui/inline-sentence-field.types'
import type {
  JoinedPairEndOccupantConfig,
  JoinedPairStartOccupantConfig,
} from '../../components/ui/joined-pair-field.types'

import type { BaseFieldConfig, OptionalDisclosureConfig } from './field-base.types'
import type { FieldDynamicSelectOptions } from './field-dynamic.types'
import type { FieldVisibility } from './field-visibility'
import type { FieldOption, SelectFieldOptionListItem } from './field-options'

export type {
  InlineSentenceBelowChips,
  InlineSentenceJoinedPairSegment,
  InlineSentenceNumberSegment,
  InlineSentenceSegment,
  InlineSentenceSelectSegment,
  InlineSentenceTextSegment,
} from '../../components/ui/inline-sentence-field.types'

export interface InlineSentenceFieldConfig extends BaseFieldConfig {
  type: 'inlineSentence'
  /**
   * Inline prose + bound controls. Segment kinds:
   *
   * - `text` — static fragment (`value`, optional `tone`: `label` | `prose` | `mono`)
   * - `number` — bound numeric input (`name`, `digits`, `min`/`max`, optional `visibility`)
   * - `select` — bound dropdown (`name`, `options`, `width`, optional `label` / `labelVisibility`)
   * - `joinedPair` — two-segment joined control (`start`, `end` occupants; optional visible
   *   `label` / `labelVisibility` above the pair; see field-types.md)
   *
   * Optional `below: { kind: 'chips', … }` for chip pickers under the sentence.
   *
   * @see [field-types.md](../../docs/forms/field-types.md#inline-sentence-inlinesentence)
   */
  segments: InlineSentenceSegment[]
  below?: InlineSentenceBelowChips
  /** Pill scale for `below` chips; defaults to field `size`. */
  chipSize?: FieldSize
  /** Dynamic options for bound select segments (typically the segment matching `name`). */
  optionsResolve?: FieldDynamicSelectOptions
}

/**
 * Two-segment joined control (`type: 'joinedPair'`) — value + unit chrome.
 *
 * RHF paths come from occupant `name` values only (no wrapper `name`). Use `controlId`
 * when control ids must differ from the primary bound path.
 *
 * @see [field-types.md](../../docs/forms/field-types.md#joined-pair-field-joinedpair)
 */
export interface JoinedPairFieldConfig extends Omit<BaseFieldConfig, 'name'> {
  type: 'joinedPair'
  /** Optional stable id segment for control ids; defaults to start occupant `name`. */
  controlId?: string
  start: JoinedPairStartOccupantConfig
  end: JoinedPairEndOccupantConfig
  /**
   * Replaces the start select options from the end unit's current value.
   * Keys are end-select values (`ft`, `mi`).
   */
  presetsByUnit?: Readonly<Record<string, readonly { value: number; label: string }[]>>
  /** Clears the start amount when the end unit changes. Does not convert the number. */
  clearAmountWhenUnitChanges?: boolean
  optionalDisclosure?: OptionalDisclosureConfig
}
export interface LevelRangeFieldConfig extends BaseFieldConfig {
  type: 'levelRange'
  /** Relative min-level field name within the parent object. Defaults to `minLevel`. */
  minName?: string
  /** Relative max-level field name within the parent object. Defaults to `maxLevel`. */
  maxName?: string
  options: SelectFieldOptionListItem[]
  /** Prose between min and max selects. Defaults to `through`. */
  connector?: string
  digits?: FieldDigits
  defaultMinValue?: number
  defaultMaxValue?: number
}
/** Column definition for `editableGrid` fields (may carry per-column conditionals). */
export interface EditableGridColumnConfig {
  key: string
  /** Static label, or a function of watched `dependsOn` values when the header is dynamic. */
  label: string | ((watched: Record<string, unknown>) => string)
  control: 'select' | 'number'
  min?: number
  max?: number
  /** Hide the column when the predicate is false; the underlying value is retained. */
  visibility?: FieldVisibility
  /**
   * Field names the dynamic `label` reads. Defaults to `visibility.dependsOn` when
   * omitted.
   */
  labelDependsOn?: string[]
}

export interface EditableGridFieldConfig extends BaseFieldConfig {
  type: 'editableGrid'
  rowCount: number
  columns: EditableGridColumnConfig[]
  templates?: EditableGridTemplates
  defaultValue?: EditableGridValue
}

/**
 * XdY dice notation with optional tail operand (`type: 'diceFormula'`).
 *
 * Common options: `modifierMode`, `modifierOperators`, `faces`, `countMin`/`countMax`,
 * `modifierMin`/`modifierMax`, `currencyUnit`.
 *
 * Use `defineDiceFormulaField()` for completion. Storybook: `Forms/DiceFormulaField`.
 *
 * @see [field-types.md](../../docs/forms/field-types.md#dice-formula-diceformula)
 *
 * @example
 * defineDiceFormulaField({
 *   type: 'diceFormula',
 *   name: 'formula',
 *   label: 'Roll',
 *   modifierMode: 'optional',
 *   modifierOperators: DICE_FORMULA_OPERATORS,
 * })
/**
 * Value + unit composite bound to a nested object field (e.g. `{ amount, currency }`).
 * `valueKey` / `unitKey` name the object properties the control reads and writes.
 */
export interface InputSelectFieldConfig extends BaseFieldConfig {
  type: 'inputSelect'
  inputType: 'text' | 'number'
  /** Required for select mode; omit when `fixedUnit` is set. */
  options?: FieldOption[]
  valueKey?: string
  unitKey?: string
  searchable?: boolean
  unitPlaceholder?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  valueDigits?: FieldDigits
  /** Watched field name used to resolve `valueDigits` from `valueDigitsLookup`. */
  valueDigitsDependsOn?: string
  valueDigitsLookup?: Record<string, FieldDigits>
  /** When true, formats the numeric value with en-US thousand separators. */
  formatGrouped?: boolean
  /** When true, only the unit segment is disabled (value input stays editable). */
  unitDisabled?: boolean
  /** Static unit label — renders label mode instead of a unit select (single-option composites). */
  fixedUnit?: string
  /** Stored unit enum value written to `unitKey` when `fixedUnit` is set. */
  unitValue?: string
  defaultValue?: Record<string, unknown>
}

/**
 * Scalar number + fixed unit label (walk speed, weapon range, spell distance, …).
 *
 * @deprecated Prefer `inlineSentence` with a number segment and trailing text.
 */
export interface InputUnitFieldConfig extends BaseFieldConfig {
  type: 'inputUnit'
  /** Defaults to `number`. */
  inputType?: 'number'
  unit: string
  min?: number
  max?: number
  step?: number
  valueDigits?: FieldDigits
  valueDigitsDependsOn?: string
  valueDigitsLookup?: Record<string, FieldDigits>
  formatGrouped?: boolean
  defaultValue?: number
}
