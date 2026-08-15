// Public surface of the `@rpg/ui/form` subpath: the schema-driven, RHF-aware
// form layer — the `<Form>` renderer plus the config types + pure helpers.

export { Form, type FormProps } from './shells/form.client'
export {
  useSchemaFormSubmit,
  type SchemaFormSubmitHandler,
} from './shells/schema-form-shell.client'
export {
  FormItems,
  type FormItemsProps,
  SlotFieldRenderer,
  type SlotFieldRendererProps,
} from './containers/form-items.client'
export { FormFieldStack, type FormFieldStackProps } from './containers/form-field-stack.client'
export { FieldNode, buildFieldControlId } from './containers/form-conditional.client'
export {
  FormSectionProvider,
  FormRhythmStack,
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
  useFieldControlSize,
  type FormSectionContextOverrides,
  type FormSectionContextValue,
  type FormRhythmStackProps,
  type FormSectionProviderProps,
} from './context/form-section.context'
export {
  DEFAULT_ARRAY_SECTION_DENSITY,
  DEFAULT_FORM_DENSITY,
  resolveFormDensity,
  resolveSectionDensity,
  type FormDensity,
} from './form-density'
export { resolveFieldControlSize } from './resolve-field-control-size.lib'
export {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
  useFieldErrorPresentation,
  type ArrayItemPresentationContextValue,
  type ErrorPlacement,
} from './context/array-item-presentation.context'
export {
  ArrayFieldContext,
  useArrayFieldContext,
  applyArrayFilterSelectOptions,
  type ArrayFieldContextValue,
  type FilterSelectOptionsContext,
} from './context/array-field.context'
export {
  FormUiContext,
  FormUiProvider,
  useFormUiContext,
  type FormUiContextValue,
  type FormValidationPresentation,
  type ValidateSilently,
  type ValidationSessionExpandKey,
} from './context/form-ui.context'
export {
  TabbedForm,
  collectTabbedFormResolverItems,
  type TabbedFormProps,
  type TabbedFormTab,
} from './shells/tabbed-form.client'
export { useTabbedFormChrome } from './shells/tabbed-form-chrome.context'
export { FormSaveFooter, type FormSaveFooterProps } from './chrome/form-save-footer'
export { FormFooterActions, type FormFooterActionsProps } from './chrome/form-footer-actions'
export { FormActionsBar, type FormActionsBarProps } from './chrome/form-actions-bar'
export {
  FormShellFooterScope,
  FormShellFooterSlot,
  FormShellFooterContent,
  FormShellFooterPublisher,
  useFormShellFooterModel,
  useFormShellFooterFormId,
  type FormShellFooterModel,
  type FormShellFooterContentProps,
  type FormShellFooterPublisherProps,
} from './chrome/form-shell-footer.context'
export {
  FormShellSubmitButton,
  type FormShellSubmitButtonProps,
} from './chrome/form-shell-submit-button'
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
  formTabbedChromeRhythmStackClasses,
  formSheetScrollRegionClasses,
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
  areVisibilityDependenciesKnown,
  resolveDependentsVisibility,
  resolveFieldHint,
  normalizeFieldHint,
  resolveFieldHintPosition,
  resolveFieldHintPresentation,
  collectFieldDynamicDependsOn,
  resolveRowFieldAlign,
  resolveRowFieldGap,
  rowFieldReservesDerivedMeta,
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  flattenSelectFieldOptions,
  resolveSelectFieldConfigOptions,
  resolveSelectFieldFlatOptions,
  resolveSelectFieldDisplayLabel,
  isSelectFieldReadOnly,
  type FieldReadOnlyContext,
  type FieldPresentationConfig,
  type FieldType,
  type FieldOption,
  type FieldOptionGroup,
  type SelectFieldOptionListItem,
  isFieldOptionGroup,
  type FieldVisibility,
  type FieldOptionAvailability,
  type FieldDynamicHint,
  type FieldDynamicSelectOptions,
  type FieldDynamicSuggestions,
  type FieldDerivedMeta,
  type FieldDerivedMetaConfig,
  type FieldDerivedMetaRow,
  type FormValueSync,
  type TrailingFieldActionConfig,
  type TextFieldConfig,
  type TextSuggestionsFieldConfig,
  type NumberFieldConfig,
  type TextareaFieldConfig,
  type OptionalDisclosureConfig,
  type OptionalDisclosureFieldKind,
  OPTIONAL_DISCLOSURE_FIELD_KINDS,
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
  type InlineSentenceFieldConfig,
  type InlineSentenceSegment,
  type ComboboxFieldConfig,
  type ComboboxRenderSelectedItem,
  type EditableGridColumnConfig,
  type EditableGridFieldConfig,
  type DiceFormulaFieldConfig,
  type RollValueFieldConfig,
  type InputSelectFieldConfig,
  type InputUnitFieldConfig,
  type FieldConfig,
  type RowConfig,
  type RowSpacing,
  type RowFieldItem,
  type GroupConfig,
  type GroupFieldItem,
  type FieldGroupChrome,
  type FieldGroupDisclosure,
  type FieldGroupSummary,
  type FieldGroupSummaryDisclosure,
  type ChromeConfig,
  type ChromeVariant,
  type ContentTone,
  type SemanticTone,
  type SurfaceConfig,
  type SurfaceElevation,
  type SupportedSemanticChrome,
  type VisualEmphasis,
  type FieldChrome,
  type FieldHintConfig,
  type FormHeading,
  type FormHeadingTier,
  type FieldLabelVisibility,
  type DependentChrome,
  type DependentConfig,
  type DependentDependentsConfig,
  type ArrayAddActionConfig,
  type ArrayItemConfig,
  type ArrayFilterSelectConfig,
  type ArrayFilterSelectFn,
  type ArrayConfig,
  type ArrayItemHeaderConfig,
  type ArrayItemReorder,
  type ArrayAddActionLayout,
  type ArrayItemVariant,
  type ArrayCompactInlineAlign,
  type SlotConfig,
  type FormItem,
  type FormIssue,
  type FormIssueSeverity,
  type ArrayPatternConfig,
  type ArrayErrorFocusContext,
} from './field-config'
export {
  resolveChromeAccentClasses,
  resolveChromeClasses,
  resolveChromeShellClasses,
  isSupportedSemanticChrome,
} from '../components/ui/chrome.variants'
export {
  defineArrayField,
  defineComboboxField,
  defineDiceFormulaField,
  defineForm,
  defineFormItems,
  defineGroupField,
  defineInlineSentenceField,
  defineSelectField,
  defineDependentField,
} from './form-authoring'
export { isRowSlotItem } from './field-config'
export { FIELD_WIDTHS, type FieldWidth } from '../components/ui/field-control.variants'
export {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_DEPENDENT_SURFACE,
  DEFAULT_PANEL_SURFACE,
  SEMANTIC_SURFACE_TONES,
  type SemanticSurfaceTone,
  resolveFieldDependentsChromeClasses,
  resolveSurfaceClasses,
  type FieldDependentsScope,
} from '../components/ui/field-dependent.variants'
export {
  DICE_FORMULA_TAIL_OPERATORS,
  DICE_FORMULA_OPERATORS,
  type DiceFormulaTailOperator,
} from '../components/ui/dice-formula-field.lib'
export type { FieldSize } from '../components/ui/field.client'
export { makeFieldErrorMap, type RawZodIssueLike } from './config/field-error-map'
export {
  makeResolver,
  createValidateSilently,
  type SilentValidationResult,
} from './config/form-resolver'
export { navigateInvalidSubmit } from './config/navigate-invalid-submit.client'
export { navigateTabbedFormInvalidSubmit } from './shells/navigate-tabbed-form-invalid-submit.client'
export { performInvalidSubmitFocus } from './config/navigate-invalid-submit-focus.lib'
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
  resolveArrayItemFieldOrder,
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
  useSilentFormValidity,
  type UseSilentFormValidityOptions,
  type UseSilentFormValidityResult,
} from './hooks/use-silent-form-validity.client'
export {
  useSubmitHandler,
  type FormSubmitHandler,
  type UseSubmitHandlerOptions,
  type UseSubmitHandlerResult,
} from './hooks/use-submit-handler.client'
export {
  ARRAY_ITEM_HEADER_DIVIDER,
  ARRAY_ITEM_TEXT_SEPARATOR,
  joinArrayItemSummaryParts,
  type ResolvedArrayItemHeader,
} from './config/array/array-item-config.lib'
export type { ArrayItemShellRenderProps } from './config/array/array-item-shell-render.types'
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
} from './config/array/array-item-collapse.lib'
export {
  buildArrayItemCollapseStorageKey,
  readArrayItemCollapseOverrides,
  writeArrayItemCollapseOverrides,
  type ArrayItemCollapseStoredValue,
} from './config/array/array-item-collapse-storage.lib'
export {
  getArrayFieldMutators,
  registerArrayFieldMutators,
  type ArrayFieldMutators,
} from './context/array-field-mutators.registry'
export { useArrayItemCollapseState } from './hooks/use-array-item-collapse-state.client'
export {
  ArrayItemActionsRail,
  ArrayItemRemoveButton,
  ArrayItemShell,
  type ArrayItemActionsRailProps,
  type ArrayItemRemoveButtonProps,
  type ArrayItemShellProps,
} from './renderers/array/array-item-shell.client'
export {
  ArrayItemLeadingChromeColumn,
  type ArrayItemLeadingChromeColumnProps,
} from './renderers/array/array-item-leading-chrome-column.client'
export {
  ArrayItemInlineRow,
  type ArrayItemInlineRowProps,
} from './renderers/array/array-item-inline-row.client'
export {
  ArrayItemRowShell,
  type ArrayItemRowShellProps,
} from './renderers/array/array-item-row-shell.client'
export {
  useArrayItemRowState,
  type UseArrayItemRowStateArgs,
} from './renderers/array/use-array-item-row-state.client'
export {
  ArrayItemIssueSummary,
  type ArrayItemIssueSummaryProps,
} from './renderers/array/array-item-issue.client'
export { buildFieldRendererIds } from './renderers/field-renderer-config.lib'
export {
  fieldArrayItemListClasses,
  type FieldGroupLegendSize,
  type FieldSeparator,
  type FieldRhythm,
} from '../components/ui/field.variants'
