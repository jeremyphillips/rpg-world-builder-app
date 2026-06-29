import type { ReactNode } from 'react'

import type {
  DiceFormulaLabelPosition,
  DiceFormulaModifierMode,
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
import type { FieldWidth } from '../components/ui/field-control.variants'
import type { FieldDigits } from '../components/ui/field-digit-metrics'
import type { FieldRowLayout } from '../components/ui/field.variants'

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
  | 'chooseFromChips'
  | 'inlineChooseCount'

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

/** Properties shared by every leaf field config. */
interface BaseFieldConfig {
  /** Form value key; also the basis of the generated control id. */
  name: string
  label: string
  size?: FieldSize
  width?: FieldWidth
  hint?: string
  /** Renders the label `[i]` InfoTooltip. */
  info?: ReactNode
  required?: boolean
  disabled?: boolean
  /** Optional conditional rendering; omit for always-visible fields. */
  visibility?: FieldVisibility
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
  /**
   * Visual digit capacity for the select trigger (sets width from ch-based tokens).
   * Keep `width` at `full` (default) on standalone fields so label and hint are not
   * compressed; use row `width` tokens only when sharing a `FieldRow`.
   */
  digits?: FieldDigits
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
  /** `inline` (default) — switch and label on one row. `above` — label over the switch. */
  labelPosition?: 'above' | 'inline'
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
  /**
   * Allow selecting more than one option. Defaults to `true`.
   * Set to `false` for mutually-exclusive choices (e.g. Magic Level, Difficulty).
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  /** Pill padding/type scale. Label uses `size` (default field scale). Defaults to `sm`. */
  chipSize?: FieldSize
  defaultValue?: string | string[]
}

/**
 * Inline “Choose [N] … from:” sentence plus chip options — e.g. class skill proficiencies.
 * `name` is the chip selection path; `chooseName` is the numeric count path.
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
  /** Pill padding/type scale. Label uses `size` (default field scale). Defaults to `sm`. */
  chipSize?: FieldSize
  defaultValue?: string[]
  chooseDefaultValue?: number
}

/** Inline “Choose [N] …” sentence with a numeric count input only. */
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
}

/**
 * Searchable dropdown for picking one or many values from a large option list.
 * `multiple: true` (default) → value is `string[]`; selected values render as removable chips.
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
  /** Custom selected-value renderer in multi-select mode; defaults to removable chips. */
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
  defaultValue?: DiceFormulaValue
}

/**
 * Value + unit composite bound to a nested object field (e.g. `{ amount, currency }`).
 * `valueKey` / `unitKey` name the object properties the control reads and writes.
 */
export interface InputSelectFieldConfig extends BaseFieldConfig {
  type: 'inputSelect'
  inputType: 'text' | 'number'
  options: FieldOption[]
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
  defaultValue?: Record<string, unknown>
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
  | ComboboxFieldConfig
  | EditableGridFieldConfig
  | DiceFormulaFieldConfig
  | InputSelectFieldConfig

/** A responsive row of fields, mapped to `FieldRow` by the renderer. */
export interface RowConfig {
  kind: 'row'
  fields: FieldConfig[]
  /** Preferred display recipe. Use `className` only for one-off escape hatches. */
  layout?: FieldRowLayout
  className?: string
}

/** Fields allowed inside a `group` — groups may nest one level or more. */
export type GroupFieldItem = FieldConfig | RowConfig | SlotConfig | GroupConfig

/** A semantic fieldset/legend grouping, mapped to `FieldGroup`. */
export interface GroupConfig {
  kind: 'group'
  legend: string
  description?: string
  fields: GroupFieldItem[]
  className?: string
  /** When false, renders as a plain fieldset even when form collapsible sections are enabled. */
  collapsible?: boolean
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
  /** Field configs for each item; names are relative to the item, not the root. */
  fields: FormItem[]
  /** Label for the "Add" button. Defaults to `"Add item"`. */
  addLabel?: string
  /** Minimum item count; removes the "Remove" button while at the floor. */
  min?: number
  /** Maximum item count; hides the "Add" button once reached. */
  max?: number
  /**
   * Optional heading per item row. Receives the item's current values (keyed
   * by relative field names) and the 0-based index.
   */
  itemTitle?: (values: Record<string, unknown>, index: number) => string
  /** When false, renders as a plain fieldset even when form collapsible sections are enabled. */
  collapsible?: boolean
  /**
   * Item-scoped conditional visibility (same contract as leaf fields). When hidden,
   * the array unmounts and RHF clears its value via `shouldUnregister`.
   */
  visibility?: FieldVisibility
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
  render: () => ReactNode
  /** When false, renders inline even when form collapsible sections are enabled. */
  collapsible?: boolean
}

/** Any item allowed at the top level of a form's `fields` array. */
export type FormItem = FieldConfig | RowConfig | GroupConfig | ArrayConfig | SlotConfig

/** Narrows a `FormItem` to a container (row/group/array/slot) vs. a leaf field. */
export function isContainer(
  item: FormItem,
): item is RowConfig | GroupConfig | ArrayConfig | SlotConfig {
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
      fields.push(item)
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
    values[field.name] = fieldDefaultValue(field)
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
  chooseFromChips: [],
  inlineChooseCount: undefined,
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
    return multiField.multiple === false ? '' : []
  }
  if (field.type === 'editableGrid') {
    const gridField = field as EditableGridFieldConfig
    return emptyEditableGridValue(gridField.columns, gridField.rowCount)
  }
  if (field.type === 'diceFormula') {
    const diceField = field as DiceFormulaFieldConfig
    return defaultDiceFormulaForMode(diceField.modifierMode ?? 'optional')
  }
  return TYPE_DEFAULTS[field.type]
}

function assignFieldDefaultValues(field: FieldConfig, values: Record<string, unknown>): void {
  values[field.name] = fieldDefaultValue(field)
  if (field.type === 'chooseFromChips') {
    const chooseField = field as ChooseFromChipsFieldConfig
    values[chooseField.chooseName] = chooseField.chooseDefaultValue ?? TYPE_DEFAULTS.number
  }
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
    } else if (item.kind === 'group') {
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
