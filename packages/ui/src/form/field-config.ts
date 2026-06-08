import type { ReactNode } from 'react'

import type { FieldSize } from '../components/ui/field.client'
import type { FieldWidth } from '../components/ui/field-control.variants'

/** The set of control types the schema-driven `<Form>` renderer can render. */
export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'json'
  | 'richtext'

/** Option for the `select` and `radio` field types. */
export interface FieldOption {
  label: string
  value: string
  disabled?: boolean
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
  min?: number
  max?: number
  step?: number
  defaultValue?: number
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea'
  placeholder?: string
  rows?: number
  defaultValue?: string
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select'
  options: FieldOption[]
  placeholder?: string
  defaultValue?: string
}

export interface RadioFieldConfig extends BaseFieldConfig {
  type: 'radio'
  options: FieldOption[]
  defaultValue?: string
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox'
  defaultValue?: boolean
}

export interface SwitchFieldConfig extends BaseFieldConfig {
  type: 'switch'
  defaultValue?: boolean
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
  defaultValue?: string
}

/** Discriminated union of every leaf field, keyed by `type`. */
export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | RadioFieldConfig
  | CheckboxFieldConfig
  | SwitchFieldConfig
  | JsonFieldConfig
  | RichTextFieldConfig

/** A responsive row of fields, mapped to `FieldRow` by the renderer. */
export interface RowConfig {
  kind: 'row'
  fields: FieldConfig[]
  className?: string
}

/** A semantic fieldset/legend grouping, mapped to `FieldGroup`. */
export interface GroupConfig {
  kind: 'group'
  legend: string
  fields: Array<FieldConfig | RowConfig>
  className?: string
}

/** Any item allowed at the top level of a form's `fields` array. */
export type FormItem = FieldConfig | RowConfig | GroupConfig

function isContainer(item: FormItem): item is RowConfig | GroupConfig {
  return 'kind' in item
}

/**
 * Flattens groups/rows into the ordered list of leaf fields, so callers can
 * iterate fields without re-walking the container tree.
 */
export function flattenFields(items: Array<FormItem | RowConfig>): FieldConfig[] {
  const fields: FieldConfig[] = []
  for (const item of items) {
    if (isContainer(item)) {
      fields.push(...flattenFields(item.fields))
    } else {
      fields.push(item)
    }
  }
  return fields
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
  checkbox: false,
  switch: false,
  json: '',
  richtext: '',
}

/** Type-appropriate default for a single field; an explicit `defaultValue` wins. */
export function fieldDefaultValue(field: FieldConfig): unknown {
  return field.defaultValue !== undefined ? field.defaultValue : TYPE_DEFAULTS[field.type]
}

/** Builds the `defaultValues` object RHF needs from a form's items. */
export function buildDefaultValues(items: FormItem[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of flattenFields(items)) {
    values[field.name] = fieldDefaultValue(field)
  }
  return values
}
