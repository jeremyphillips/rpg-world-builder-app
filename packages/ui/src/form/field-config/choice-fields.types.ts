import type { ReactNode } from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import type { FieldLabelPosition } from '../../components/ui/field.variants'
import type { FieldDigits } from '../../components/ui/field-digit-metrics'
import type { ComboboxRenderSelectedItem } from '../../components/ui/combobox-field.types'
import type { FieldLabelVisibility } from '../form-heading.lib'

import type { BaseFieldConfig, OptionalDisclosureConfig } from './field-base.types'
import type {
  FieldDynamicComboboxFilterSelects,
  FieldDynamicComboboxOptions,
  FieldDynamicRecommendation,
  FieldDynamicSelectOptions,
  ComboboxFilterDimensionConfig,
} from './field-dynamic.types'
import type { FieldLayoutRecommendation } from '../../components/ui/field-recommendation.types'
import type {
  FieldOption,
  FieldOptionAvailability,
  SelectFieldOptionListItem,
} from './field-options'

export type { ComboboxRenderSelectedItem } from '../../components/ui/combobox-field.types'

/**
 * Dropdown bound to a single string value (`type: 'select'`).
 *
 * Common options: `options`, `placeholder`, `optionAvailability`, `digits`, `labelPosition`,
 * `visibility`, `required`.
 *
 * Use `defineSelectField()` for variant-specific completion, or a plain object literal.
 *
 * @example
 * defineSelectField({
 *   type: 'select',
 *   name: 'status',
 *   label: 'Status',
 *   options: toOptions(STATUSES, STATUS_LABELS),
 *   required: true,
 * })
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select'
  /** Static options — omit when `optionsResolve` supplies the list at render time. */
  options?: SelectFieldOptionListItem[]
  /** Dynamic options resolved from watched values; replaces `options` when set. */
  optionsResolve?: FieldDynamicSelectOptions
  placeholder?: string
  defaultValue?: string
  /** Inline clear control when a value is selected — clears to `undefined` in form state. */
  clearable?: boolean
  /** Accessible name for the clear control — defaults to `Clear ${label}`. */
  clearAccessibleName?: string
  optionalDisclosure?: OptionalDisclosureConfig
  /** Disables individual options when `enabledWhen` is false for the current values. */
  optionAvailability?: FieldOptionAvailability
  /**
   * Visual digit capacity for the select trigger (sets width from ch-based tokens).
   * Keep `width` at `full` (default) on standalone fields so label and hint are not
   * compressed; use row `width` tokens only when sharing a `FieldRow`.
   */
  digits?: FieldDigits
  /**
   * Compact text trigger width from this label string (grid ghost). Mutually exclusive
   * with `digits` / `sizingLabels`. Prefer `sizingLabels` from option labels when the set is known.
   */
  sizingLabel?: string
  /**
   * Compact text trigger width from overlapping CSS ghosts for every option label. Mutually
   * exclusive with `digits` / `sizingLabel`.
   */
  sizingLabels?: readonly string[]
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
}

export interface RadioFieldConfig extends BaseFieldConfig {
  type: 'radio'
  options: FieldOption[]
  defaultValue?: string
  /** When `'horizontal'`, options lay out in a row (default `'vertical'`). */
  orientation?: 'horizontal' | 'vertical'
  /** Visually hide the label while keeping it available to screen readers. */
  labelVisibility?: FieldLabelVisibility
}

export interface SegmentedControlFieldConfig extends BaseFieldConfig {
  type: 'segmentedControl'
  options: FieldOption[]
  defaultValue?: string
  labelVisibility?: FieldLabelVisibility
  /** Stretch the control to the field column; segments share width equally when true. */
  fullWidth?: boolean
}

export interface RadioCardFieldConfig extends BaseFieldConfig {
  type: 'radioCard'
  options: FieldOption[]
  defaultValue?: string
  /** Visually hide the label while keeping it available to screen readers. */
  labelVisibility?: FieldLabelVisibility
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox'
  defaultValue?: boolean
}

export interface SwitchFieldConfig extends BaseFieldConfig {
  type: 'switch'
  defaultValue?: boolean
  /**
   * `inline` (default) — switch left, label right.
   * `above` — label over the switch.
   * `settings` — label + hint left, switch right (dense settings panels).
   */
  labelPosition?: 'above' | 'inline' | 'settings'
}
/**
 * A set of pill-shaped toggle buttons.
 * `multiple: true` (default) → value is `string[]`; pick any number.
 * `multiple: false` → value is `string`; acts as a styled single-select.
 */
export interface ChipsFieldConfig extends BaseFieldConfig {
  type: 'chips'
  /**
   * Visible lead-in above the chip row when `label` stays sr-only or concise.
   * Does not replace the field legend / accessible name.
   */
  introText?: ReactNode
  options: FieldOption[]
  /** Disables individual options when `enabledWhen` is false for the current values. */
  optionAvailability?: FieldOptionAvailability
  /**
   * Allow selecting more than one option. Defaults to `true`.
   * Set to `false` for mutually-exclusive choices (e.g. Magic Level, Difficulty).
   */
  multiple?: boolean
  /** Minimum selections when `multiple` is true. */
  min?: number
  /** Maximum selections when `multiple` is true. */
  max?: number
  /** Pill padding/type scale. Label uses `size` (default field scale). Defaults to `size`. */
  chipSize?: FieldSize
  defaultValue?: string | string[]
}
export interface ChooseFromChipsFieldConfig extends BaseFieldConfig {
  type: 'chooseFromChips'
  chooseName: string
  options: FieldOption[]
  chooseMin?: number
  chooseMax?: number
  /** Leading sentence fragment before the count input. Defaults to `Choose`. */
  prefix?: string
  /** Trailing sentence fragment after the count input. Defaults to `skills from:`. */
  suffix?: string
  /** Pill padding/type scale. Label uses `size` (default field scale). Defaults to `size`. */
  chipSize?: FieldSize
  defaultValue?: string[]
  chooseDefaultValue?: number
}

/**
 * Inline “Choose [N] …” sentence with a numeric count input only.
 *
 * @deprecated Prefer `inlineSentence`.
 */
export interface InlineChooseCountFieldConfig extends BaseFieldConfig {
  type: 'inlineChooseCount'
  chooseMin?: number
  chooseMax?: number
  /** Leading sentence fragment before the count input. Defaults to `Choose`. */
  prefix?: string
  /** Trailing sentence fragment after the count input. Defaults to `from:`. */
  suffix?: string
  /** Visual digit capacity for the count input. Defaults to `1`. */
  digits?: FieldDigits
  defaultValue?: number
  /** Optional trailing select bound to a second RHF path (same pattern as `chooseFromChips.chooseName`). */
  selectName?: string
  selectOptions?: FieldOption[]
  /** sr-only label for the trailing select. */
  selectLabel?: string
  selectDefaultValue?: string
  selectRequired?: boolean
}
/**
 * Searchable option picker (`type: 'combobox'`) for large lists.
 *
 * Common options: `options`, `multiple`, `max`, `placeholder`, `renderSelectedItem`,
 * `visibility`, `required`.
 *
 * - `multiple: true` (default) — value is `string[]`; selections render as removable badges.
 * - `multiple: false` — value is `string`; picking closes the panel.
 *
 * Use `defineComboboxField()` for variant-specific completion.
 *
 * @example
 * defineComboboxField({
 *   type: 'combobox',
 *   name: 'tags',
 *   label: 'Tags',
 *   options: tagOptions,
 *   placeholder: 'Search tags…',
 * })
 */
export interface ComboboxFieldConfig extends BaseFieldConfig {
  type: 'combobox'
  /** Static options — omit when `optionsResolve` supplies the list at render time. */
  options?: FieldOption[]
  /** Dynamic options resolved from watched values; replaces `options` when set. */
  optionsResolve?: FieldDynamicComboboxOptions
  /**
   * Single vs multi selection. Defaults to `true` (`string[]` value).
   * Set `false` for a single `string` value (optional enums use `undefined`, not `''`).
   */
  multiple?: boolean
  /** Minimum selections when `multiple` is true. */
  min?: number
  /** Maximum selections when `multiple` is true. Omits the ceiling when unset. */
  max?: number
  placeholder?: string
  /**
   * Closed-state copy when `placeholder` is omitted — `add` uses `Add {singular}` and
   * requires explicit `noun`; default `choice` uses Choose vocabulary.
   */
  closedPlaceholderIntent?: 'choice' | 'add'
  defaultValue?: string | string[]
  /**
   * Custom selected-value renderer in multi-select mode.
   * Defaults to removable `Chip` pills. Use for links, badges, or compact summaries.
   */
  renderSelectedItem?: ComboboxRenderSelectedItem
  /**
   * Custom filter/rank for panel options. When omitted, the combobox uses default
   * substring matching in static `options` order. Selected values must stay visible.
   */
  resolveFilteredOptions?: (
    options: FieldOption[],
    query: string,
    selected: string[],
  ) => FieldOption[]
  /** Multi-dimension filter row in the combobox panel toolbar. */
  filterSelects?: readonly ComboboxFilterDimensionConfig[]
  /** Dynamic dimension filters resolved from watched values; replaces `filterSelects` when set. */
  filterSelectsResolve?: FieldDynamicComboboxFilterSelects
  /** Static inline or grouped recommendation in the field label band (above the control). */
  recommendation?: FieldLayoutRecommendation
  /** Dynamic recommendation; `dependsOn` triggers re-resolution. */
  recommendationResolve?: FieldDynamicRecommendation
  /** When false, omits the panel search row (keyboard nav targets the listbox). */
  enableSearch?: boolean
  /** Overrides generated `Search {plural}…` panel copy. */
  searchPlaceholder?: string
  optionAvailability?: FieldOptionAvailability
  /**
   * Resolves display labels for selected values that are not in the current `options`
   * list (stale slugs, catalog rows filtered from reference options, etc.).
   */
  resolveOptionLabel?: (value: string) => string | undefined
}
