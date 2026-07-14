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
import type { FieldSize } from '../components/ui/field.client'
import type { ComboboxRenderSelectedItem } from '../components/ui/combobox-field.types'
import type { WeightedSearchField } from '../lib/search'
import type { FieldWidth } from '../components/ui/field-control.variants'
import type { FieldDigits } from '../components/ui/field-digit-metrics'
import { isInlineSentenceBoundSegment } from '../components/ui/inline-sentence-field.lib'
import type {
  InlineSentenceBelowChips,
  InlineSentenceSegment,
} from '../components/ui/inline-sentence-field.types'
import type {
  FieldStackDependentsChromeScope,
  FieldStackDependentsTone,
} from '../components/ui/field-stack.variants'
import type { FieldGroupFieldsChrome } from '../components/ui/field-group-chrome.variants'
import type {
  FieldRowLayout,
  FieldHintPosition,
  FieldGroupLegendSize,
  FieldLabelPosition,
  FieldSeparator,
  FieldStackLayout,
  FieldStackRhythm,
} from '../components/ui/field.variants'

export type { FieldGroupFieldsChrome } from '../components/ui/field-group-chrome.variants'

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
  size?: FieldSize
  width?: FieldWidth
  hint?: string
  /** Helper text placement relative to the label and control. Default `below-label`. */
  hintPosition?: FieldHintPosition
  /** Renders the label `[i]` InfoTooltip. */
  info?: ReactNode
  required?: boolean
  disabled?: boolean
  /** Optional conditional rendering; omit for always-visible fields. */
  visibility?: FieldVisibility
  /** Optional helper text derived from other field values. */
  dynamicHint?: FieldDynamicHint
  /** Trailing divider after this field within a group/stack rhythm. */
  separator?: FieldSeparator
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text'
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
}

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

/** Composable inline prose + bound controls (number, select) with optional chips below. */
export interface InlineSentenceFieldConfig extends BaseFieldConfig {
  type: 'inlineSentence'
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
 * Searchable dropdown for picking one or many values from a large option list.
 * `multiple: true` (default) → value is `string[]`; selected values render as removable badges.
 * `multiple: false` → value is `string`; picking an option closes the panel.
 */
export interface ComboboxFieldConfig extends BaseFieldConfig {
  type: 'combobox'
  options: FieldOption[]
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  placeholder?: string
  defaultValue?: string | string[]
  /** Custom selected-value renderer in multi-select mode; defaults to `Chip mode="removable"`. */
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

export interface DiceFormulaFieldConfig extends BaseFieldConfig {
  type: 'diceFormula'
  labelPosition?: DiceFormulaLabelPosition
  modifierMode?: DiceFormulaModifierMode
  faces?: readonly number[]
  countMin?: number
  countMax?: number
  modifierMin?: number
  modifierMax?: number
  /** Allowed tail operators — single entry renders a static glyph instead of a select. */
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

/** Discriminated union of every leaf field, keyed by `type`. */
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
export interface RowConfig {
  kind: 'row'
  fields: FieldConfig[]
  /** Preferred display recipe. Use `className` only for one-off escape hatches. */
  layout?: FieldRowLayout
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

/** Fields allowed inside a `group` or `stack` — may nest one level or more. */
export type GroupFieldItem =
  | FieldConfig
  | RowConfig
  | SlotConfig
  | GroupConfig
  | StackConfig
  | ArrayConfig

/** Layout-only container for controller + dependent fields (no fieldset legend). */
export interface StackConfig {
  kind: 'stack'
  layout?: FieldStackLayout
  /**
   * Gates fields [1..]: when false, dependents unmount and values clear.
   * When omitted and fields[0] is a switch, defaults to "switch is true".
   */
  dependentsVisibility?: FieldVisibility
  /** Border/bg inset around dependents only (index ≥ 1). Omit for plain stack. */
  dependentsChrome?: FieldStackDependentsTone
  /**
   * Where `dependentsChrome` applies. Default `wrapper`. Use `arrayItems` when
   * dependents include repeatable lists to avoid double borders on array shells.
   */
  dependentsChromeScope?: FieldStackDependentsChromeScope
  /**
   * Vertical gap between stack siblings. `compact` (default) — dense settings panels;
   * `comfortable` — matches `fieldGroupStackClasses` rhythm for multi-field blocks.
   */
  rhythm?: FieldStackRhythm
  fields: GroupFieldItem[]
  visibility?: FieldVisibility
  /** Trailing divider after this stack (controller + dependents) within parent rhythm. */
  separator?: FieldSeparator
  className?: string
  /** Optional DOM id on the stack wrapper — for in-page scroll anchors. */
  id?: string
}

/** A semantic fieldset/legend grouping, mapped to `FieldGroup`. */
export interface GroupConfig {
  kind: 'group'
  legend: string
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
  rhythm?: FieldStackRhythm
  /** When hidden, the whole group unmounts and nested field values clear. */
  visibility?: FieldVisibility
  /** Visual treatment for legend + field stack — variants are mutually exclusive. */
  fieldsChrome?: FieldGroupFieldsChrome
}

/** Layout profile for repeatable array item chrome. */
export type ArrayItemVariant = 'auto' | 'compact' | 'detailed'

/** How array items may be reordered. Defaults to `dragHandle`. */
export type ArrayItemReorder = false | 'dragHandle'

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

/** Per-item header chrome for detailed and compact array rows. */
export interface ArrayItemHeaderConfig {
  /** Relative field name watched for the primary label (e.g. `'label'`). */
  primaryField?: string
  /** Optional formatter when `primaryField` is set. */
  formatPrimary?: (value: unknown, values: Record<string, unknown>) => string | undefined
  /** Computed primary label; overrides `primaryField` when set. */
  primary?: (values: Record<string, unknown>, index: number) => string | undefined
  fallback: (index: number) => string
  /** Shown on its own row below the header title on detailed items. */
  summary?: (
    values: Record<string, unknown>,
    index: number,
    watchedContext?: Record<string, unknown>,
  ) => string
  /** Root-relative field paths whose values are passed as `watchedContext` to `summary`. */
  summaryDependsOn?: string[]
  /**
   * When true, appends ` · {fallback}` after the primary label in the header title.
   * Defaults to false — fallback still drives aria labels and empty-primary titles.
   */
  showFallbackInHeader?: boolean
  /** Renders a divider between primary and fallback when `showFallbackInHeader` is true. */
  showDivider?: boolean
  /** When true, primary label is visually hidden but available to assistive tech. */
  srOnly?: boolean
}

/**
 * A repeatable field array backed by `useFieldArray`. Item `fields` use
 * **relative** names (`name`, `description`) — the renderer prefixes them with
 * the array name and item index at render time (e.g. `traits.0.name`).
 */
export interface ArrayConfig {
  kind: 'array'
  /** Top-level field name that holds the array value (e.g. `'traits'`). */
  name: string
  /** Heading rendered as the `<fieldset>` legend for the whole array. */
  legend: string
  /**
   * Legend scale — defaults to `array` (18px). Use `section` when the array is
   * the primary top-level section heading.
   */
  legendSize?: FieldGroupLegendSize
  /**
   * Vertical gap between array items and inside each item. Defaults to `compact`
   * (`gap-2`); pass `comfortable` for multi-field item blocks.
   */
  rhythm?: FieldStackRhythm
  /**
   * Control + label scale for fields inside the array. Defaults to `sm`; pass
   * `md` or `lg` when item fields should match the parent form scale.
   */
  size?: FieldSize
  /** Field configs for each item; names are relative to the item, not the root. */
  fields: FormItem[]
  /** Label for the "Add" button. Defaults to `"Add item"`. */
  addLabel?: string
  /** Minimum item count; removes the "Remove" button while at the floor. */
  min?: number
  /** Maximum item count; hides the "Add" button once reached. */
  max?: number
  /** Item row layout — `auto` picks compact when item fields fit a single row. */
  itemVariant?: ArrayItemVariant
  /**
   * Border/background tone on each item shell (`main` | `elevated` | `subtle` | `medium` |
   * `warning` | `error`). Overrides inherited stack `dependentsChrome` when
   * `dependentsChromeScope` is `arrayItems`.
   */
  itemChrome?: FieldStackDependentsTone
  /** Header labels and optional collapsed summary for each item row. */
  itemHeader?: ArrayItemHeaderConfig
  /** When true, detailed items collapse to their header row. Ignored for compact/nested. */
  itemCollapsible?: boolean
  /**
   * Relative field name used to persist collapse overrides across navigation.
   * Defaults to `'id'`; falls back to `index:${index}` when absent on a row.
   */
  itemCollapseKey?: string
  /** Reorder control — defaults to `dragHandle`; pass `false` for fixed order. */
  reorder?: ArrayItemReorder
  /**
   * Item-scoped conditional visibility (same contract as leaf fields). When hidden,
   * the array unmounts and RHF clears its value via `shouldUnregister`.
   */
  visibility?: FieldVisibility

  /** Domain pattern hooks for validation navigation, focus, and severity classification. */
  arrayPattern?: ArrayPatternConfig

  /** Supplies default values for a newly appended row. */
  appendDefaults?: (items: unknown[]) => Record<string, unknown>

  /** When true, hides the default array add control (use an external slot instead). */
  hideAddControl?: boolean

  /** When true, omits the default per-item remove control (use `itemRemoveSlot` instead). */
  hideItemRemove?: boolean

  /**
   * Custom per-item remove control rendered in the header actions rail instead of the
   * default RHF `remove(index)` button. Pair with `hideItemRemove: true` when the slot
   * fully replaces generic removal.
   */
  itemRemoveSlot?: Pick<SlotConfig, 'name' | 'render' | 'visibility'>

  /** Searchable template menu for the add control; replaces the plain add button when set. */
  addMenu?: {
    groups: { id: string; label: string }[]
    items: {
      id: string
      label: string
      description?: string
      groupId?: string
      searchTerms?: WeightedSearchField[]
      appendDefaults: Record<string, unknown> | (() => Record<string, unknown>)
      isDuplicate?: (items: unknown[]) => boolean
      duplicatePolicy?: 'allow' | 'warn' | 'block'
    }[]
    enableSearch?: boolean
  }

  /** Field names whose values are passed to `filterSelectOptions` as `watchedValues`. */
  filterSelectDependsOn?: string[]

  /** Cross-row select option filtering inside array items. */
  filterSelectOptions?: (ctx: {
    arrayItems: unknown[]
    rowIndex: number
    fieldName: string
    options: FieldOption[]
    watchedValues: Record<string, unknown>
  }) => FieldOption[]
  /** Optional DOM id on the array fieldset — for in-page scroll anchors. */
  id?: string
  /** Classes merged onto the array fieldset wrapper. */
  className?: string
  /**
   * Where visible field errors render — `auto` suppresses per-field text on
   * compact items; `row` always surfaces a joined row summary instead.
   */
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
  rhythm?: FieldStackRhythm
  /**
   * Control + label scale for slot content. Defaults to `sm` (array section default).
   */
  size?: FieldSize
}

/** Any item allowed at the top level of a form's `fields` array. */
export type FormItem =
  | FieldConfig
  | RowConfig
  | GroupConfig
  | StackConfig
  | ArrayConfig
  | SlotConfig

/** Narrows a `FormItem` to a container (row/group/stack/array/slot) vs. a leaf field. */
export function isContainer(
  item: FormItem,
): item is RowConfig | GroupConfig | StackConfig | ArrayConfig | SlotConfig {
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
        assignFieldDefaultValues(field, values)
      }
    } else if (item.kind === 'group' || item.kind === 'stack') {
      Object.assign(values, buildDefaultValues(item.fields as FormItem[]))
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

/** Resolves static and dynamic hint text for a field config. */
export function resolveFieldHint(
  field: Pick<BaseFieldConfig, 'hint' | 'dynamicHint'>,
  values: Record<string, unknown>,
): string | undefined {
  return field.dynamicHint?.hintWhen(values) ?? field.hint
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
 * Resolves the visibility gate for dependent stack fields [1..].
 * Switch controllers auto-gate on truthy when `dependentsVisibility` is omitted.
 */
export function resolveDependentsVisibility(
  stack: Pick<StackConfig, 'dependentsVisibility'>,
  controller: GroupFieldItem | undefined,
): FieldVisibility | null {
  if (stack.dependentsVisibility) {
    return stack.dependentsVisibility
  }
  if (controller && !('kind' in controller) && controller.type === 'switch') {
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
