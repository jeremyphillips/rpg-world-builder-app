// Public surface of the `@rpg/ui/form` subpath: the schema-driven, RHF-aware
// form layer — the `<Form>` renderer plus the config types + pure helpers.

export { Form, type FormProps } from './form.client'
export { TabbedForm, type TabbedFormProps, type TabbedFormTab } from './tabbed-form.client'
export { FormSaveFooter, type FormSaveFooterProps } from './form-save-footer'
export { FormActionsBar, type FormActionsBarProps } from './form-actions-bar'
export { WizardStepForm, type WizardStepFormProps } from './wizard-step-form.client'

export {
  flattenFields,
  fieldDefaultValue,
  buildDefaultValues,
  buildItemDefaultValues,
  editableGridDependsOn,
  isContainer,
  toOptions,
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
  type FileFieldRemotePreview,
  type FileFieldPropsMap,
  type ChipsFieldConfig,
  type ComboboxFieldConfig,
  type EditableGridColumnConfig,
  type EditableGridFieldConfig,
  type FieldConfig,
  type RowConfig,
  type GroupConfig,
  type ArrayConfig,
  type FormItem,
} from './field-config'
