import type { ReactNode } from 'react'

import type { FormIssue, FormIssueScope, FormIssueSeverity } from './errors/form-issue.types'

import type {
  DiceFormulaLabelPosition,
  DiceFormulaModifierMode,
  DiceFormulaTailOperator,
  DiceFormulaValue,
} from '../components/ui/dice-formula-field.lib'
import { defaultDiceFormulaForMode } from '../components/ui/dice-formula-field.lib'
import type {
  EditableGridTemplates,
  EditableGridValue,
} from '../components/ui/editable-grid.client'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
} from '../components/ui/rich-text-link-picker.client'
import type { ButtonVariantProps } from '../components/ui/button.variants'
import type { FieldSize } from '../components/ui/field.client'
import type { ComboboxRenderSelectedItem } from '../components/ui/combobox-field.types'
import type { FieldChrome } from '../components/ui/field-chrome.variants'
import type { FieldWidth } from '../components/ui/field-control.variants'
import type { FieldDigits } from '../components/ui/field-digit-metrics'
import { isInlineSentenceBoundSegment } from '../components/ui/inline-sentence-field.lib'
import type {
  InlineSentenceBelowChips,
  InlineSentenceSegment,
} from '../components/ui/inline-sentence-field.types'
import type {
  FieldDependentsScope,
  FieldStatusTone,
  FieldSurfaceVariant,
} from '../components/ui/field-dependent.variants'
import type { FieldGroupFieldsChrome } from '../components/ui/field-group-chrome.variants'
import type { ArrayAddMenuConfig } from './config/array/array-add-menu.lib'
import type {
  FieldHintPosition,
  FieldGroupLegendSize,
  FieldLabelPosition,
  FieldSeparator,
  FieldRhythm,
} from '../components/ui/field.variants'

export type { FieldGroupFieldsChrome } from '../components/ui/field-group-chrome.variants'
export type { FieldChrome } from '../components/ui/field-chrome.variants'

/** The set of control types the schema-driven `<Form>` renderer can render. */
export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'radioCard'
  | 'checkbox'
  | 'switch'
  | 'json'
  | 'richtext'
  | 'markdown'
  | 'file'
  | 'chips'
  | 'combobox'
  | 'editableGrid'
  | 'diceFormula'
  | 'inputSelect'
  | 'inputUnit'
  | 'chooseFromChips'
  | 'inlineChooseCount'
  | 'inlineSentence'
  | 'levelRange'
  | 'rollValue'

/** Option for the `select`, `radio`, `radioCard`, `chips`, and `combobox` field types. */
export interface FieldOption {
  label: string
  value: string
  disabled?: boolean
  /** Secondary line text (e.g. source badge copy). Included in combobox search matching. */
  description?: string
  /** Feature chips rendered by `radioCard` fields; ignored by other option controls. */
  meta?: string[]
  /** Inline title badge rendered by `radioCard` fields; ignored by other option controls. */
  badge?: string
}

/** Labeled option group for `select` fields (rendered as `<optgroup>`-style sections). */
export interface FieldOptionGroup {
  kind: 'group'
  label: string
  options: FieldOption[]
}

export type SelectFieldOptionListItem = FieldOption | FieldOptionGroup

export function isFieldOptionGroup(item: SelectFieldOptionListItem): item is FieldOptionGroup {
  return 'kind' in item && item.kind === 'group'
}

/** Flattens grouped select config items to a plain option list. */
export function flattenSelectFieldOptions(
  options: readonly SelectFieldOptionListItem[],
): FieldOption[] {
  return options.flatMap((item) => (isFieldOptionGroup(item) ? item.options : [item]))
}

/** Context passed to `presentation.readOnlyWhen` for option-backed fields. */
export type FieldReadOnlyContext = {
  options: FieldOption[]
}

/** Presentation overrides that swap an editable control for read-only chrome. */
export type FieldPresentationConfig = {
  readOnlyWhen?: (context: FieldReadOnlyContext) => boolean
}

/**
 * Builds `FieldOption[]` from a value list (typically a contract enum constant)
 * and a label map. Keying the labels by the value union makes a missing or
 * stale label a type error when the contract enum changes.
 */
export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): FieldOption[] {
  return values.map((value) => ({ value, label: labels[value] }))
}

/**
 * Conditional-visibility contract. `dependsOn` lists the field names the
 * predicate reads so the renderer can subscribe to *only* those values
 * (`useWatch`) instead of re-rendering the whole form. A field is required only
 * while visible — hidden fields are stripped before validation (see `<Form>`).
 */
export interface FieldVisibility {
  /** Field names whose values `visibleWhen` reads. */
  dependsOn: string[]
  /** Given the watched values, return whether this field should render. */
  visibleWhen: (watched: Record<string, unknown>) => boolean
}

/** Merges two visibility predicates with OR semantics and a deduped `dependsOn` list. */
export function combineFieldVisibility(a: FieldVisibility, b: FieldVisibility): FieldVisibility {
  return {
    dependsOn: [...new Set([...a.dependsOn, ...b.dependsOn])],
    visibleWhen: (values) => a.visibleWhen(values) || b.visibleWhen(values),
  }
}

/** Merges two visibility predicates with AND semantics and a deduped `dependsOn` list. */
export function combineFieldVisibilityAll(a: FieldVisibility, b: FieldVisibility): FieldVisibility {
  return {
    dependsOn: [...new Set([...a.dependsOn, ...b.dependsOn])],
    visibleWhen: (values) => a.visibleWhen(values) && b.visibleWhen(values),
  }
}

/**
 * Per-option enablement keyed on other field values. Disabled options stay
 * selectable in the current value but cannot be toggled on (tier-2 UX).
 */
export interface FieldOptionAvailability {
  dependsOn: string[]
  enabledWhen: (values: Record<string, unknown>, optionValue: string) => boolean
}

/**
 * Contextual helper text derived from other field values. When `hintWhen`
 * returns `undefined`, the static `hint` on the field config is used instead.
 */
export interface FieldDynamicHint {
  dependsOn: string[]
  hintWhen: (values: Record<string, unknown>) => string | undefined
}

/** Static and dynamic hint configuration on leaf fields. */
export interface FieldHintConfig {
  text?: string
  position?: FieldHintPosition
  resolve?: FieldDynamicHint
}

/**
 * Patches form values when watched driver fields change (after initial mount).
 * Used to remove dependent selections when a mode or category changes.
 */
export interface FormValueSync {
  dependsOn: string[]
  apply: (
    values: Record<string, unknown>,
    changedKeys: string[],
  ) => Partial<Record<string, unknown>> | undefined
}

/** Properties shared by every leaf field config. */
interface BaseFieldConfig {
  /** Form value key; also the basis of the generated control id. */
  name: string
  label: string
  /**
   * Control + label scale (`sm` | `md` | `lg`). Inherits form rhythm when omitted
   * (`sm` for compact, `md` for comfortable top-level forms).
   */
  size?: FieldSize
  /**
   * Width of the field wrapper within its container — see `FIELD_WIDTHS`.
   *
   * **Intrinsic** (`xs` ~64px, `sm`, `md`, `lg`, `xl`, `auto`): capped width; use
   * `auto` or fractions inside a `kind: 'row'`. Standalone fields with `digits`
   * usually keep `full` so label and hint span the column.
   *
   * **Row fractions** (`full`, `1/2`, `1/3`, `2/3`, `1/4`, `3/4`): meaningful
   * only inside `kind: 'row'` — distributes flex grow weight on a base-12 scale.
   *
   * @default full
   */
  width?: FieldWidth
  hint?: string | FieldHintConfig
  /** Renders the label `[i]` InfoTooltip. */
  info?: ReactNode
  required?: boolean
  disabled?: boolean
  /**
   * Conditional rendering — field is required only while visible. List every
   * field name `visibleWhen` reads in `dependsOn` so the renderer can subscribe
   * narrowly via `useWatch`.
   */
  visibility?: FieldVisibility
  /** Trailing divider after this field — `subtle` | `default` | `strong` (border ladder). */
  separator?: FieldSeparator
  /**
   * Visual shell around the full field anatomy (label + control + messages).
   * Discriminated union — not a flat enum:
   *
   * - `{ variant: 'plain' }` — default, no extra shell
   * - `{ variant: 'panel', tone? }` — filled panel wash
   * - `{ variant: 'outline', tone? }` — border-only inset
   *
   * Distinct from container `surface` / `status` chrome on arrays and dependents.
   */
  chrome?: FieldChrome
  /**
   * Presentation overrides for option-backed fields (`select`, `combobox`, …).
   * `readOnlyWhen` swaps the control for read-only chrome when it returns true
   * (e.g. only one option remains).
   */
  presentation?: FieldPresentationConfig
}

/** Field kinds that may use `optionalDisclosure` when renderer support lands. */
export const OPTIONAL_DISCLOSURE_FIELD_KINDS = ['text', 'textarea', 'richtext'] as const
export type OptionalDisclosureFieldKind = (typeof OPTIONAL_DISCLOSURE_FIELD_KINDS)[number]

/** Collapse empty optional prose fields behind an add control (v1: textarea only). */
export type OptionalDisclosureConfig = {
  addLabel: string
  removeLabel?: string
  /** When true (default), populated values keep the field expanded. */
  expandWhenPopulated?: boolean
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text'
  // TODO(text): add optionalDisclosure when OptionalFieldDisclosure supports single-line fields.
  placeholder?: string
  /** Native input type for the text control (e.g. `email`, `password`). */
  inputType?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search'
  autoComplete?: string
  defaultValue?: string
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number'
  placeholder?: string
  /** Bounds for Zod/schema validation — not applied as HTML `min`/`max` (allows in-progress edits). */
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  /**
   * Max-width applied to the `<input>` element itself, independent of the
   * container's layout `width`. Use intrinsic tokens (`xs`–`xl`, `auto`).
   */
  inputWidth?: FieldWidth
  /** Visual digit capacity for the numeric input (sets input width from ch-based tokens). */
  digits?: FieldDigits
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea'
  placeholder?: string
  rows?: number
  defaultValue?: string
  optionalDisclosure?: OptionalDisclosureConfig
}

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
  options: SelectFieldOptionListItem[]
  placeholder?: string
  defaultValue?: string
  /** Disables individual options when `enabledWhen` is false for the current values. */
  optionAvailability?: FieldOptionAvailability
  /**
   * Visual digit capacity for the select trigger (sets width from ch-based tokens).
   * Keep `width` at `full` (default) on standalone fields so label and hint are not
   * compressed; use row `width` tokens only when sharing a `FieldRow`.
   */
  digits?: FieldDigits
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
  labelHidden?: boolean
}

export interface RadioCardFieldConfig extends BaseFieldConfig {
  type: 'radioCard'
  options: FieldOption[]
  defaultValue?: string
  /** Visually hide the label while keeping it available to screen readers. */
  labelHidden?: boolean
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

export interface JsonFieldConfig extends BaseFieldConfig {
  type: 'json'
  placeholder?: string
  /** Sample value; surfaces an "Insert example" button in the control. */
  example?: unknown
  defaultValue?: string
}

export interface RichTextFieldConfig extends BaseFieldConfig {
  type: 'richtext'
  // TODO(richtext): add optionalDisclosure when empty-HTML detection + header wiring land.
  /** Opt in to the link toolbar button + extension (off by default). */
  linkable?: boolean
  /** Opt in to inline/code-block marks, toolbar buttons, and backtick input rules (off by default). */
  codeBlocks?: boolean
  /** Internal link targets shown in the rich-text link picker. */
  internalLinkOptions?: RichTextLinkPickerInternalOption[]
  /** Content type filter options for the rich-text link picker. */
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  defaultValue?: string
}

export interface MarkdownFieldConfig extends BaseFieldConfig {
  type: 'markdown'
  placeholder?: string
  rows?: number
  defaultValue?: string
}

/** Remote preview for a stored asset key — passed at the form level, not in the schema. */
export interface FileFieldRemotePreview {
  /** Resolved URL for an already-uploaded image (e.g. via `getAssetUrl(key)`). */
  existingImageUrl?: string
  /** Label shown beside the remote preview row. */
  existingImageLabel?: string
  /** Called when the user removes the stored image without selecting a new file. */
  onClearExisting?: () => void
}

/** Per-field remote preview overrides keyed by form field name. */
export type FileFieldPropsMap = Partial<Record<string, FileFieldRemotePreview>>

export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file'
  /**
   * Accepted MIME types or file extensions (e.g. `['image/*']`, `['.pdf']`).
   * Defaults to `['image/*']`.
   */
  accept?: string[]
  /** Allow selecting multiple files. Defaults to `false`. */
  multiple?: boolean
  /** Maximum number of files when `multiple` is true. */
  maxFiles?: number
  /** Maximum size per file in bytes. */
  maxSize?: number
}

/**
 * A set of pill-shaped toggle buttons.
 * `multiple: true` (default) → value is `string[]`; pick any number.
 * `multiple: false` → value is `string`; acts as a styled single-select.
 */
export interface ChipsFieldConfig extends BaseFieldConfig {
  type: 'chips'
  options: FieldOption[]
  /** Disables individual options when `enabledWhen` is false for the current values. */
  optionAvailability?: FieldOptionAvailability
  /**
   * Allow selecting more than one option. Defaults to `true`.
   * Set to `false` for mutually-exclusive choices (e.g. Magic Level, Difficulty).
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  /** Pill padding/type scale. Label uses `size` (default field scale). Defaults to `size`. */
  chipSize?: FieldSize
  defaultValue?: string | string[]
}

export type {
  InlineSentenceBelowChips,
  InlineSentenceNumberSegment,
  InlineSentenceSegment,
  InlineSentenceSelectSegment,
  InlineSentenceTextSegment,
} from '../components/ui/inline-sentence-field.types'

/**
 * Composable inline prose + bound controls (`type: 'inlineSentence'`).
 *
 * Common options: `segments`, `below`, `hideLabel`, `chipSize`, `visibility`, `required`.
 *
 * Prefer over deprecated `chooseFromChips` / `inlineChooseCount` for new authoring.
 * Use `defineInlineSentenceField()` for variant-specific completion.
 *
 * @example
 * defineInlineSentenceField({
 *   type: 'inlineSentence',
 *   name: 'movement',
 *   label: 'Speed',
 *   segments: [
 *     { kind: 'text', value: 'Walk' },
 *     { kind: 'number', name: 'walk', digits: 'sm' },
 *     { kind: 'text', value: 'ft.' },
 *   ],
 * })
 */
export interface InlineSentenceFieldConfig extends BaseFieldConfig {
  type: 'inlineSentence'
  /**
   * Inline prose + bound controls. Segment kinds:
   *
   * - `text` — static fragment (`value`, optional `tone`: `label` | `prose` | `mono`)
   * - `number` — bound numeric input (`name`, `digits`, `min`/`max`, optional `visibility`)
   * - `select` — bound dropdown (`name`, `options`, `width`, optional `visibility`)
   *
   * Optional `below: { kind: 'chips', … }` for chip pickers under the sentence.
   *
   * @see [field-types.md](../../docs/forms/field-types.md#inline-sentence-inlinesentence)
   */
  segments: InlineSentenceSegment[]
  below?: InlineSentenceBelowChips
  /** When true, the legend is visually hidden but kept for assistive tech. */
  hideLabel?: boolean
  /** Pill scale for `below` chips; defaults to field `size`. */
  chipSize?: FieldSize
}

/**
 * Inline “Choose [N] … from:” sentence plus chip options — e.g. class skill proficiencies.
 * `name` is the chip selection path; `chooseName` is the numeric count path.
 *
 * @deprecated Prefer `inlineSentence` with a `below` chips segment.
 */
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
  /** When true, the legend is visually hidden but kept for assistive tech. */
  hideLabel?: boolean
  defaultValue?: number
  /** Optional trailing select bound to a second RHF path (same pattern as `chooseFromChips.chooseName`). */
  selectName?: string
  selectOptions?: FieldOption[]
  /** sr-only label for the trailing select. */
  selectLabel?: string
  selectDefaultValue?: string
  selectRequired?: boolean
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
  options: FieldOption[]
  /**
   * Single vs multi selection. Defaults to `true` (`string[]` value).
   * Set `false` for a single `string` value (optional enums use `undefined`, not `''`).
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. Omits the ceiling when unset. */
  max?: number
  placeholder?: string
  defaultValue?: string | string[]
  /**
   * Custom selected-value renderer in multi-select mode.
   * Defaults to removable `Chip` pills. Use for links, badges, or compact summaries.
   */
  renderSelectedItem?: ComboboxRenderSelectedItem
}

export type { ComboboxRenderSelectedItem } from '../components/ui/combobox-field.types'

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
 */
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
}

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

/**
 * Discriminated union of every leaf field, keyed by `type`.
 *
 * Simple types (`text`, `number`, `checkbox`, …) need no authoring helper — use plain
 * object literals. Complex types have `define*Field()` helpers in `form-authoring.ts`
 * (`defineSelectField`, `defineComboboxField`, `defineInlineSentenceField`, …).
 */
export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | RadioFieldConfig
  | RadioCardFieldConfig
  | CheckboxFieldConfig
  | SwitchFieldConfig
  | JsonFieldConfig
  | RichTextFieldConfig
  | MarkdownFieldConfig
  | FileFieldConfig
  | ChipsFieldConfig
  | ChooseFromChipsFieldConfig
  | InlineChooseCountFieldConfig
  | InlineSentenceFieldConfig
  | LevelRangeFieldConfig
  | ComboboxFieldConfig
  | EditableGridFieldConfig
  | DiceFormulaFieldConfig
  | RollValueFieldConfig
  | InputSelectFieldConfig
  | InputUnitFieldConfig

/** Leaf fields and slots allowed inside a horizontal `kind: 'row'`. */
export type RowFieldItem = FieldConfig | SlotConfig

export function isRowSlotItem(item: RowFieldItem): item is SlotConfig {
  return 'kind' in item && item.kind === 'slot'
}

export interface RowConfig {
  kind: 'row'
  fields: RowFieldItem[]
  className?: string
  /** Trailing divider after this row within a group/stack rhythm. */
  separator?: FieldSeparator
  /** When hidden, the whole row unmounts. */
  visibility?: FieldVisibility
  /**
   * Where visible field errors render — `auto` suppresses per-field text on
   * horizontal rows; `row` always surfaces a joined row summary instead.
   */
  errorPlacement?: 'auto' | 'field' | 'row'
}

/** Fields allowed inside a `group` or `dependent` — may nest one level or more. */
export type GroupFieldItem =
  | FieldConfig
  | RowConfig
  | SlotConfig
  | GroupConfig
  | DependentConfig
  | ArrayConfig

export interface DependentDependentsConfig {
  fields: GroupFieldItem[]
  /**
   * Gates dependent fields: when false, dependents unmount and values clear.
   * When omitted and the controller is a switch, defaults to "switch is true".
   */
  visibility?: FieldVisibility
  surface?: FieldSurfaceVariant
  status?: FieldStatusTone
  /**
   * Where dependent chrome applies.
   *
   * - `wrapper` (default) — chrome on the dependents container.
   * - `arrayItems` — chrome on nested array item shells only.
   *
   * @default wrapper
   */
  scope?: FieldDependentsScope
}

/**
 * Controller field plus gated dependents (`kind: 'dependent'`).
 *
 * Use `defineDependentField()` for completion.
 *
 * @example
 * defineDependentField({
 *   kind: 'dependent',
 *   controller: { type: 'switch', name: 'enabled', label: 'Custom rule' },
 *   dependents: {
 *     fields: [{ type: 'text', name: 'formula', label: 'Formula' }],
 *   },
 * })
 */
export interface DependentConfig {
  kind: 'dependent'
  controller: FieldConfig
  dependents: DependentDependentsConfig
  /**
   * Vertical gap between controller and dependents. `compact` (default) — dense
   * settings panels; `comfortable` — matches group rhythm for multi-field blocks.
   */
  rhythm?: FieldRhythm
  visibility?: FieldVisibility
  /** Trailing divider after this dependent section within parent rhythm. */
  separator?: FieldSeparator
  className?: string
  /** Optional DOM id on the dependent wrapper — for in-page scroll anchors. */
  id?: string
}

/**
 * Named fieldset subsection (`kind: 'group'`).
 *
 * Common options: `legend`, `fields`, `legendSize`, `rhythm`, `fieldsChrome`,
 * `description`, `visibility`.
 *
 * Nested groups inside another group often use `legendSize: 'subsection'`.
 * Use `defineGroupField()` for completion.
 *
 * @example
 * defineGroupField({
 *   kind: 'group',
 *   legend: 'Damage',
 *   fields: [
 *     { type: 'text', name: 'dice', label: 'Dice', required: true },
 *   ],
 * })
 */
export interface GroupConfig {
  kind: 'group'
  /** When omitted, renders as a layout/visibility wrapper without a legend. */
  legend?: string
  description?: string
  fields: GroupFieldItem[]
  className?: string
  /** Optional DOM id on the fieldset — for in-page scroll anchors. */
  id?: string
  /** Legend scale — `subsection` (20px) for nested groups inside another group. */
  legendSize?: FieldGroupLegendSize
  /**
   * Vertical gap between sibling fields. Inherits form rhythm when omitted;
   * defaults to `comfortable` on standalone `FieldGroup`.
   */
  rhythm?: FieldRhythm
  /** When hidden, the whole group unmounts and nested field values clear. */
  visibility?: FieldVisibility
  /**
   * Visual treatment for the legend + field stack — variants are mutually exclusive.
   * Shapes: `inset`, `panel`, `outline`, `divider`, `callout`, `accent`, `collapsible`.
   * Tones vary by variant — see [containers.md](../../docs/forms/containers.md#group-fieldschrome).
   */
  fieldsChrome?: FieldGroupFieldsChrome
}

/** Layout profile for repeatable array item chrome. */
export type ArrayItemVariant = 'auto' | 'compact' | 'detailed'

/** Vertical alignment for compact inline rows (grip, fields, embedded actions). */
export type ArrayCompactInlineAlign = 'start' | 'center'

/** How array items may be reordered. Defaults to `dragHandle`. */
export type ArrayItemReorder = false | 'dragHandle'

/** Placement of the array add control relative to the section legend. */
export type ArrayAddActionLayout = 'stacked' | 'inline'

export type { FormIssue, FormIssueScope, FormIssueSeverity } from './errors/form-issue.types'

/** Context for mapping a row-level/cross-row issue to a focusable field name. */
export type ArrayErrorFocusContext = {
  issue: FormIssue
  itemIndex: number
  levelKeys?: { min: string; max: string }
}

/** Optional domain hooks for array validation navigation and severity. */
export type ArrayPatternConfig = {
  kind: string
  levelKeys?: { min: string; max: string }
  getErrorFocusTarget?: (ctx: ArrayErrorFocusContext) => string | undefined
  classifyIssueSeverity?: (issue: FormIssue) => FormIssueSeverity
  classifyIssueScope?: (issue: FormIssue) => FormIssueScope
} & Record<string, unknown>

/**
 * Per-item header chrome for detailed and compact array rows.
 *
 * Title resolution order: `primary` → `formatPrimary(primaryField)` → `primaryField`
 * raw value → `fallback(index)`. Use `primaryField` for a single watched column;
 * use `primary` when the label is derived from multiple fields or domain formatters.
 *
 * @see [Array field authoring guide](../../docs/forms/array-field-authoring.md)
 */
export interface ArrayItemHeaderConfig {
  /**
   * Relative field name watched for the primary label (e.g. `'name'`, `'path'`).
   * Prefer this over `primary` when one column drives the title.
   */
  primaryField?: string
  /** Optional formatter when `primaryField` is set. */
  formatPrimary?: (value: unknown, values: Record<string, unknown>) => string | undefined
  /**
   * Computed primary label; overrides `primaryField` when set.
   * Use for grant rows, tier summaries, or multi-field titles.
   */
  primary?: (values: Record<string, unknown>, index: number) => string | undefined
  /**
   * Fallback title when the primary is empty — also used for aria labels.
   * Required; typically `Item ${index + 1}` or a domain label like `Grant ${index + 1}`.
   */
  fallback: (index: number) => string
  /**
   * Shown on its own row below the header title on **detailed** items only.
   * Pair with `summaryDependsOn` when the summary reads root-level context.
   */
  summary?: (
    values: Record<string, unknown>,
    index: number,
    watchedContext?: Record<string, unknown>,
  ) => string
  /** Root-relative field paths whose values are passed as `watchedContext` to `summary`. */
  summaryDependsOn?: string[]
  /**
   * When true, appends ` · {fallback}` after the primary label in the header title.
   *
   * @default false — fallback still drives aria labels and empty-primary titles.
   */
  showFallbackInHeader?: boolean
  /** Renders a divider between primary and fallback when `showFallbackInHeader` is true. */
  showDivider?: boolean
  /** When true, primary label is visually hidden but available to assistive tech. */
  srOnly?: boolean
}

export interface ArrayAddActionConfig {
  label?: string
  /** @default true */
  icon?: boolean
  variant?: NonNullable<ButtonVariantProps['variant']>
  layout?: ArrayAddActionLayout
  size?: NonNullable<ButtonVariantProps['size']>
  menu?: ArrayAddMenuConfig
}

export interface ArrayItemConfig {
  variant?: ArrayItemVariant
  /** @default raised */
  surface?: FieldSurfaceVariant
  status?: FieldStatusTone
  header?: ArrayItemHeaderConfig
  collapsible?: boolean
  collapseKey?: string
  inlineAlign?: ArrayCompactInlineAlign
  /** @default dragHandle */
  reorder?: ArrayItemReorder
  /** @default true */
  removable?: boolean
  removeSlot?: Pick<SlotConfig, 'name' | 'render' | 'visibility'>
}

export type ArrayFilterSelectFn = (ctx: {
  arrayItems: unknown[]
  rowIndex: number
  fieldName: string
  options: FieldOption[]
  watchedValues: Record<string, unknown>
}) => FieldOption[]

export interface ArrayFilterSelectConfig {
  dependsOn?: string[]
  filter: ArrayFilterSelectFn
}

/**
 * Repeatable list section (`kind: 'array'`).
 *
 * @see [Array field authoring guide](../../docs/forms/array-field-authoring.md)
 *
 * @example
 * defineArrayField({
 *   kind: 'array',
 *   name: 'traits',
 *   legend: 'Traits',
 *   addAction: { label: 'Add trait' },
 *   item: {
 *     header: { fallback: (i) => `Trait ${i + 1}`, primaryField: 'name' },
 *   },
 *   fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
 * })
 */
export interface ArrayConfig {
  kind: 'array'
  name: string
  legend: string
  legendSize?: FieldGroupLegendSize
  rhythm?: FieldRhythm
  size?: FieldSize
  fields: FormItem[]
  addAction?: false | ArrayAddActionConfig
  min?: number
  max?: number
  item?: ArrayItemConfig
  visibility?: FieldVisibility
  arrayPattern?: ArrayPatternConfig
  appendDefaults?: (items: unknown[]) => Record<string, unknown>
  filterSelect?: ArrayFilterSelectConfig
  id?: string
  className?: string
  separator?: FieldSeparator
  errorPlacement?: 'auto' | 'field' | 'row'
}

/**
 * Custom field region rendered inside `FormProvider`. The slot `name` aligns with
 * a form value key managed by `render()` (via `useFormContext` / `useFieldArray`);
 * defaults are supplied through the form's `defaultValues`, not synthesized here.
 */
export interface SlotConfig {
  kind: 'slot'
  name: string
  label?: string
  hint?: string
  className?: string
  /** When hidden, the slot unmounts and any registered values clear with `shouldUnregister`. */
  visibility?: FieldVisibility
  render: () => ReactNode
  /**
   * Vertical gap between slot content siblings. Defaults to `compact` array rhythm
   * (`gap-2`).
   */
  rhythm?: FieldRhythm
  /**
   * Control + label scale for slot content. Defaults to `sm` (array section default).
   */
  size?: FieldSize
  /** Trailing divider after this slot within a group/stack rhythm. */
  separator?: FieldSeparator
  /** Panel or outline shell around slot content. */
  chrome?: FieldChrome
}

/**
 * Any item allowed at the top level of a form's `fields` array (or a tab panel).
 *
 * Leaf fields (`FieldConfig`), horizontal rows (`kind: 'row'`), and containers
 * (`group`, `dependent`, `array`, `slot`). Wrap trees with `defineForm()` or reusable
 * sections with `defineFormItems()` — plain arrays remain valid.
 */
export type FormItem =
  | FieldConfig
  | RowConfig
  | GroupConfig
  | DependentConfig
  | ArrayConfig
  | SlotConfig

/** Narrows a `FormItem` to a container (row/group/dependent/array/slot) vs. a leaf field. */
export function isContainer(
  item: FormItem,
): item is RowConfig | GroupConfig | DependentConfig | ArrayConfig | SlotConfig {
  return 'kind' in item
}

/**
 * Flattens groups/rows into the ordered list of leaf fields, so callers can
 * iterate fields without re-walking the container tree.
 *
 * `ArrayConfig` and `SlotConfig` items are **skipped** — arrays are managed at
 * runtime by `useFieldArray`; slots render custom controls bound to the parent form.
 */
export function flattenFields(items: Array<FormItem | RowConfig>): FieldConfig[] {
  const fields: FieldConfig[] = []
  for (const item of items) {
    if (!('kind' in item)) {
      if (item.type !== 'levelRange') {
        fields.push(item)
      }
    } else if (item.kind === 'array' || item.kind === 'slot') {
      // Intentionally skipped — see JSDoc above.
    } else if (item.kind === 'dependent') {
      fields.push(item.controller)
      fields.push(...flattenFields(item.dependents.fields as Array<FormItem | RowConfig>))
    } else {
      fields.push(...flattenFields(item.fields as Array<FormItem | RowConfig>))
    }
  }
  return fields
}

/**
 * Builds the default values for one array item from its field configs.
 * Pass the result to `useFieldArray`'s `append()` when adding a new row.
 */
export function buildItemDefaultValues(itemFields: FormItem[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of flattenFields(itemFields)) {
    assignFieldDefaultValues(field, values)
  }
  return values
}

/**
 * Fallback value per field type when no explicit `defaultValue` is given:
 * `false` for booleans, `undefined` for numbers, and `''` for every
 * string-valued control — preventing uncontrolled→controlled warnings.
 */
const TYPE_DEFAULTS: Record<FieldType, unknown> = {
  text: '',
  number: undefined,
  textarea: '',
  select: '',
  radio: '',
  radioCard: '',
  checkbox: false,
  switch: false,
  json: '',
  richtext: '',
  markdown: '',
  file: [],
  chips: [],
  combobox: [],
  editableGrid: {},
  diceFormula: defaultDiceFormulaForMode('optional'),
  inputSelect: {},
  inputUnit: undefined,
  chooseFromChips: [],
  inlineChooseCount: undefined,
  inlineSentence: undefined,
  levelRange: undefined,
  rollValue: undefined,
}

function assignInlineSentenceDefaults(
  field: InlineSentenceFieldConfig,
  values: Record<string, unknown>,
): void {
  for (const segment of field.segments) {
    if (!isInlineSentenceBoundSegment(segment)) continue
    const explicit = segment.defaultValue
    if (segment.kind === 'number') {
      values[segment.name] = explicit ?? TYPE_DEFAULTS.number
      continue
    }
    values[segment.name] = explicit ?? TYPE_DEFAULTS.select
  }

  if (field.below) {
    values[field.below.name] = field.below.defaultValue ?? TYPE_DEFAULTS.chips
  }
}

function emptyEditableGridValue(
  columns: EditableGridColumnConfig[],
  rowCount: number,
): EditableGridValue {
  return Object.fromEntries(
    columns.map((column) => [column.key, Array.from({ length: rowCount }, () => null)]),
  )
}

/** Names every column-level `useWatch` subscription for an editable grid field. */
export function editableGridDependsOn(columns: EditableGridColumnConfig[]): string[] {
  const deps = new Set<string>()
  for (const column of columns) {
    column.visibility?.dependsOn.forEach((name) => deps.add(name))
    if (typeof column.label === 'function') {
      const labelDeps = column.labelDependsOn ?? column.visibility?.dependsOn ?? []
      labelDeps.forEach((name) => deps.add(name))
    }
  }
  return [...deps]
}

/** Type-appropriate default for a single field; an explicit `defaultValue` wins. */
export function fieldDefaultValue(field: FieldConfig): unknown {
  const explicit = (field as { defaultValue?: unknown }).defaultValue
  if (explicit !== undefined) return explicit
  if (field.type === 'chips' || field.type === 'combobox') {
    const multiField = field as ChipsFieldConfig | ComboboxFieldConfig
    if (multiField.multiple === false) {
      // Optional single-select controls use `undefined` (not `''`) so optional
      // Zod enums validate; required fields keep the empty-string sentinel.
      return field.required ? '' : undefined
    }
    return []
  }
  if (field.type === 'editableGrid') {
    const gridField = field as EditableGridFieldConfig
    return emptyEditableGridValue(gridField.columns, gridField.rowCount)
  }
  if (field.type === 'diceFormula') {
    const diceField = field as DiceFormulaFieldConfig
    return defaultDiceFormulaForMode(
      diceField.modifierMode ?? 'optional',
      diceField.modifierOperators,
    )
  }
  return TYPE_DEFAULTS[field.type]
}

function assignLevelRangeDefaults(
  field: LevelRangeFieldConfig,
  values: Record<string, unknown>,
): void {
  const minName = field.minName ?? field.name
  const maxName = field.maxName ?? 'maxLevel'
  values[minName] = field.defaultMinValue ?? TYPE_DEFAULTS.number
  values[maxName] = field.defaultMaxValue ?? TYPE_DEFAULTS.number
}

function assignDependentFieldDefaults(field: FieldConfig, values: Record<string, unknown>): void {
  if (field.type === 'chooseFromChips') {
    const chooseField = field as ChooseFromChipsFieldConfig
    values[chooseField.chooseName] = chooseField.chooseDefaultValue ?? TYPE_DEFAULTS.number
    return
  }

  if (field.type !== 'inlineChooseCount') return

  const inlineField = field as InlineChooseCountFieldConfig
  const selectName = inlineField.selectName
  if (!selectName) return

  values[selectName] =
    inlineField.selectDefaultValue ?? (inlineField.selectRequired ? '' : undefined)
}

function assignRollValueDefaults(
  field: RollValueFieldConfig,
  values: Record<string, unknown>,
): void {
  const base = field.name
  values[`${base}.dice.count`] = field.defaultCount ?? 1
  values[`${base}.dice.faces`] = field.defaultFaces ?? 6
}

function assignFieldDefaultValues(field: FieldConfig, values: Record<string, unknown>): void {
  if (field.type === 'inlineSentence') {
    assignInlineSentenceDefaults(field, values)
    return
  }

  if (field.type === 'levelRange') {
    assignLevelRangeDefaults(field as LevelRangeFieldConfig, values)
    return
  }

  if (field.type === 'rollValue') {
    assignRollValueDefaults(field as RollValueFieldConfig, values)
    return
  }

  values[field.name] = fieldDefaultValue(field)
  assignDependentFieldDefaults(field, values)
}

/** Builds the `defaultValues` object RHF needs from a form's items. */
export function buildDefaultValues(items: FormItem[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const item of items) {
    if (!('kind' in item)) {
      assignFieldDefaultValues(item, values)
    } else if (item.kind === 'row') {
      for (const field of item.fields) {
        if (isRowSlotItem(field)) continue
        assignFieldDefaultValues(field, values)
      }
    } else if (item.kind === 'group') {
      Object.assign(values, buildDefaultValues(item.fields as FormItem[]))
    } else if (item.kind === 'dependent') {
      assignFieldDefaultValues(item.controller, values)
      Object.assign(values, buildDefaultValues(item.dependents.fields as FormItem[]))
    } else if (item.kind === 'array') {
      values[item.name] = []
    } else if (item.kind === 'slot') {
      // Slot values come from the form's defaultValues.
    }
  }
  return values
}

/** Whether a field should render given the current values (always-visible if no `visibility`). */
export function isFieldVisible(field: FieldConfig, values: Record<string, unknown>): boolean {
  return field.visibility ? field.visibility.visibleWhen(values) : true
}

/** Names of fields currently hidden by their `visibility` predicate. */
export function hiddenFieldNames(items: FormItem[], values: Record<string, unknown>): string[] {
  return flattenFields(items)
    .filter((field) => !isFieldVisible(field, values))
    .map((field) => field.name)
}

/** Normalizes static and dynamic hint configuration. */
export function normalizeFieldHint(hint: string | FieldHintConfig | undefined): {
  text?: string
  position: FieldHintPosition
  resolve?: FieldDynamicHint
} {
  if (hint === undefined) {
    return { position: 'below-label' }
  }
  if (typeof hint === 'string') {
    return { text: hint, position: 'below-label' }
  }
  return {
    text: hint.text,
    position: hint.position ?? 'below-label',
    resolve: hint.resolve,
  }
}

/** Resolves static and dynamic hint text for a field config. */
export function resolveFieldHint(
  field: Pick<BaseFieldConfig, 'hint'>,
  values: Record<string, unknown>,
): string | undefined {
  const normalized = normalizeFieldHint(field.hint)
  return normalized.resolve?.hintWhen(values) ?? normalized.text
}

/** Resolves helper text placement for a field config. */
export function resolveFieldHintPosition(field: Pick<BaseFieldConfig, 'hint'>): FieldHintPosition {
  return normalizeFieldHint(field.hint).position
}

/** Resolves rendered hint text and placement for a field config. */
export function resolveFieldHintPresentation(
  field: Pick<BaseFieldConfig, 'hint'>,
  values: Record<string, unknown>,
): { text?: string; position: FieldHintPosition } {
  const normalized = normalizeFieldHint(field.hint)
  return {
    text: normalized.resolve?.hintWhen(values) ?? normalized.text,
    position: normalized.position,
  }
}

/** Applies `optionAvailability` to a flat option list without mutating the source. */
export function applyOptionAvailabilityToFieldOptions(
  options: readonly FieldOption[],
  availability: FieldOptionAvailability,
  values: Record<string, unknown>,
): FieldOption[] {
  return options.map((option) => ({
    ...option,
    disabled: Boolean(option.disabled) || !availability.enabledWhen(values, option.value),
  }))
}

/**
 * Resolves the visibility gate for dependent fields.
 * Switch controllers auto-gate on truthy when `dependents.visibility` is omitted.
 */
export function resolveDependentsVisibility(
  dependent: Pick<DependentConfig, 'dependents'>,
  controller: FieldConfig | undefined,
): FieldVisibility | null {
  if (dependent.dependents.visibility) {
    return dependent.dependents.visibility
  }
  if (!controller) {
    return null
  }
  if (controller.type === 'switch') {
    return {
      dependsOn: [controller.name],
      visibleWhen: (values) => values[controller.name] === true,
    }
  }
  return null
}

/** Applies `optionAvailability` to select options, including grouped sections. */
export function applyOptionAvailabilityToSelectOptions(
  options: readonly SelectFieldOptionListItem[],
  availability: FieldOptionAvailability,
  values: Record<string, unknown>,
): SelectFieldOptionListItem[] {
  return options.map((item) =>
    isFieldOptionGroup(item)
      ? {
          ...item,
          options: applyOptionAvailabilityToFieldOptions(item.options, availability, values),
        }
      : applyOptionAvailabilityToFieldOptions([item], availability, values)[0]!,
  )
}

/** Resolves a select field's flat option list after availability and array filters. */
export function resolveSelectFieldFlatOptions(
  config: SelectFieldConfig,
  optionValues: Record<string, unknown>,
  arrayFilter?: (options: FieldOption[], fieldName: string) => FieldOption[],
): FieldOption[] {
  let options = flattenSelectFieldOptions(config.options)
  if (config.optionAvailability) {
    options = applyOptionAvailabilityToFieldOptions(
      options,
      config.optionAvailability,
      optionValues,
    )
  }
  if (arrayFilter) {
    options = arrayFilter(options, config.name)
  }
  return options
}

export function isSelectFieldReadOnly(
  config: SelectFieldConfig,
  resolvedOptions: FieldOption[],
): boolean {
  return config.presentation?.readOnlyWhen?.({ options: resolvedOptions }) ?? false
}

/** Label for the current select value; falls back to the sole option when read-only. */
export function resolveSelectFieldDisplayLabel(
  value: unknown,
  options: FieldOption[],
): string | undefined {
  const normalized = value != null && value !== '' ? String(value) : undefined
  if (normalized) {
    const match = options.find((option) => option.value === normalized)
    if (match) return match.label
  }
  if (options.length === 1) return options[0]?.label
  return normalized
}
