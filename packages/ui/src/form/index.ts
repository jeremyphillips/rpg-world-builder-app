// Public surface of the `@rpg/ui/form` subpath: the schema-driven, RHF-aware
// form layer — the `<Form>` renderer plus the config types + pure helpers.

export { Form, type FormProps } from './form.client'
export {
  FormItems,
  type FormItemsProps,
  SlotFieldRenderer,
  type SlotFieldRendererProps,
} from './form-items.client'
export {
  TabbedForm,
  type TabbedFormFooterWrapperProps,
  type TabbedFormProps,
  type TabbedFormTab,
} from './tabbed-form.client'
export { FormSaveFooter, type FormSaveFooterProps } from './form-save-footer'
export { FormFooterActions, type FormFooterActionsProps } from './form-footer-actions'
export { FormActionsBar, type FormActionsBarProps } from './form-actions-bar'
export {
  formActionsBarActionsRowClasses,
  formActionsBarLeadingGroupClasses,
  formActionsBarPrimaryGroupClasses,
  formFooterSpacingClasses,
  formStickyActionsBarClasses,
  formStickyActionsBarTransparentClasses,
  formStickyTabsClasses,
  formStickyTabsTransparentClasses,
  formTabPanelsBottomPaddingClasses,
} from './form-chrome.variants'
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
  type FieldOptionGroup,
  type SelectFieldOptionListItem,
  isFieldOptionGroup,
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
  type ChooseFromChipsFieldConfig,
  type InlineChooseCountFieldConfig,
  type ComboboxFieldConfig,
  type EditableGridColumnConfig,
  type EditableGridFieldConfig,
  type DiceFormulaFieldConfig,
  type InputSelectFieldConfig,
  type FieldConfig,
  type RowConfig,
  type GroupConfig,
  type GroupFieldItem,
  type ArrayConfig,
  type SlotConfig,
  type FormItem,
} from './field-config'
