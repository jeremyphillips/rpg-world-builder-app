// Public surface of the `@rpg/ui/form` subpath: the schema-driven, RHF-aware
// form layer. Config types + pure helpers are exported here; the `<Form>`
// renderer (a client component) is added in a later phase.

export {
  flattenFields,
  fieldDefaultValue,
  buildDefaultValues,
  type FieldType,
  type FieldOption,
  type FieldVisibility,
  type TextFieldConfig,
  type NumberFieldConfig,
  type TextareaFieldConfig,
  type SelectFieldConfig,
  type RadioFieldConfig,
  type CheckboxFieldConfig,
  type SwitchFieldConfig,
  type JsonFieldConfig,
  type RichTextFieldConfig,
  type FieldConfig,
  type RowConfig,
  type GroupConfig,
  type FormItem,
} from './field-config'
