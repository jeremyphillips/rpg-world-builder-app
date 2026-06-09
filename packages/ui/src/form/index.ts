// Public surface of the `@rpg/ui/form` subpath: the schema-driven, RHF-aware
// form layer — the `<Form>` renderer plus the config types + pure helpers.

export { Form, type FormProps } from './form.client'
export { TabbedForm, type TabbedFormProps, type TabbedFormTab } from './tabbed-form.client'

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
  type FileFieldConfig,
  type ChipsFieldConfig,
  type FieldConfig,
  type RowConfig,
  type GroupConfig,
  type FormItem,
} from './field-config'
