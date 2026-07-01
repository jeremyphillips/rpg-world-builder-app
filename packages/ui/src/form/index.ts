// Public surface of the `@rpg/ui/form` subpath: the schema-driven, RHF-aware
// form layer — the `<Form>` renderer plus the config types + pure helpers.

export { Form, type FormProps } from './shells/form.client'
export {
  FormItems,
  type FormItemsProps,
  SlotFieldRenderer,
  type SlotFieldRendererProps,
} from './containers/form-items.client'
export {
  FormSectionProvider,
  useFormSectionContext,
  type FormSectionProviderProps,
} from './context/form-section.context'
export {
  TabbedForm,
  type TabbedFormFooterWrapperProps,
  type TabbedFormProps,
  type TabbedFormTab,
} from './shells/tabbed-form.client'
export { FormSaveFooter, type FormSaveFooterProps } from './chrome/form-save-footer'
export { FormFooterActions, type FormFooterActionsProps } from './chrome/form-footer-actions'
export { FormActionsBar, type FormActionsBarProps } from './chrome/form-actions-bar'
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
} from './chrome/form-chrome.variants'
export { WizardStepForm, type WizardStepFormProps } from './shells/wizard-step-form.client'

export {
  flattenFields,
  fieldDefaultValue,
  buildDefaultValues,
  buildItemDefaultValues,
  editableGridDependsOn,
  isContainer,
  toOptions,
  combineFieldVisibility,
  resolveFieldHint,
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  type FieldType,
  type FieldOption,
  type FieldOptionGroup,
  type SelectFieldOptionListItem,
  isFieldOptionGroup,
  type FieldVisibility,
  type FieldOptionAvailability,
  type FieldDynamicHint,
  type FormValueSync,
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
  type ComboboxRenderSelectedItem,
  type EditableGridColumnConfig,
  type EditableGridFieldConfig,
  type DiceFormulaFieldConfig,
  type InputSelectFieldConfig,
  type InputUnitFieldConfig,
  type FieldConfig,
  type RowConfig,
  type GroupConfig,
  type GroupFieldItem,
  type StackConfig,
  type ArrayConfig,
  type ArrayItemHeaderConfig,
  type ArrayItemReorder,
  type ArrayItemVariant,
  type SlotConfig,
  type FormItem,
} from './field-config'
export type {
  FieldGroupLegendSize,
  FieldSeparator,
  FieldStackLayout,
  FieldStackRhythm,
} from '../components/ui/field.variants'
export type { FieldStackDependentsTone } from '../components/ui/field-stack.variants'
