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
  ArrayItemPresentationContext,
  resolveErrorPlacement,
  type ArrayItemPresentationContextValue,
  type ErrorPlacement,
} from './context/array-item-presentation.context'
export {
  FormUiContext,
  FormUiProvider,
  useFormUiContext,
  type FormUiContextValue,
  type FormValidationPresentation,
  type ValidationSessionExpandKey,
} from './context/form-ui.context'
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
  combineFieldVisibilityAll,
  resolveDependentsVisibility,
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
  type FormIssue,
  type FormIssueSeverity,
  type ArrayPatternConfig,
  type ArrayErrorFocusContext,
} from './field-config'
export { makeFieldErrorMap, type RawZodIssueLike } from './config/field-error-map'
export {
  flattenFormIssues,
  classifyFormIssue,
  classifyFormIssues,
  groupIssuesForItemPrefix,
  filterIssuesForItemPrefix,
  sortFormIssues,
  countInvalidArrayItems,
  indexArrayItemIssues,
  collectArraySections,
  resolveIssueFocusControlId,
  resolveIssueFocusFieldName,
  buildValidationSessionExpandKey,
  resolveInvalidSubmitNavigation,
  prepareFormIssues,
  type ArrayItemIssueGroup,
  type ArraySectionMeta,
} from './errors'
export {
  useFormValidationPresentation,
  useArrayItemIssues,
  useDebouncedArrayItemValidationTrigger,
  useDebouncedArrayValidationTrigger,
} from './hooks/use-form-validation-presentation.client'
export {
  ARRAY_ITEM_HEADER_DIVIDER,
  ARRAY_ITEM_TEXT_SEPARATOR,
  joinArrayItemSummaryParts,
} from './config/array-item-config.lib'
export {
  buildItemKeysByFieldId,
  collapsedIdsFromSnapshot,
  createArrayItemCollapseSnapshot,
  isArrayItemCollapsed,
  pruneArrayItemCollapseOverrides,
  resolveArrayItemCollapseKey,
  serializeArrayItemCollapseOverrides,
  toggleArrayItemCollapseOverride,
  type ArrayItemCollapseOverride,
  type ArrayItemCollapseSnapshot,
} from './config/array-item-collapse.lib'
export {
  buildArrayItemCollapseStorageKey,
  readArrayItemCollapseOverrides,
  writeArrayItemCollapseOverrides,
  type ArrayItemCollapseStoredValue,
} from './config/array-item-collapse-storage.lib'
export { useArrayItemCollapseState } from './hooks/use-array-item-collapse-state.client'
export type {
  FieldGroupLegendSize,
  FieldSeparator,
  FieldStackLayout,
  FieldStackRhythm,
} from '../components/ui/field.variants'
export type {
  FieldStackDependentsChromeScope,
  FieldStackDependentsTone,
} from '../components/ui/field-stack.variants'
