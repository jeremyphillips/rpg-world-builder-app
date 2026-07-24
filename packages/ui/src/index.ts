export {
  ThemeProvider,
  useTheme,
  ThemeContext,
  type ThemeContextValue,
  THEME_STORAGE_KEY,
} from './providers/theme-provider.client'
export { ThemeSwitch } from './components/ui/theme-switch.client'

export { cn } from './lib/utils'
export { sanitizeHtml } from './lib/sanitize-html'
export {
  matchTier,
  rankItems,
  scoreField,
  scoreItem,
  normalizeSearchQuery,
  type MatchTier,
  type SearchableItem,
  type SearchFieldRole,
  type WeightedSearchField,
} from './lib/search'
export { Heading, type HeadingProps } from './components/ui/heading'
export { headingVariants, type HeadingVariantProps } from './components/ui/heading.variants'
export { Text, type TextProps } from './components/ui/text'
export { textVariants, type TextVariantProps } from './components/ui/text.variants'
export {
  SemanticText,
  semanticTextVariants,
  type SemanticTextEmphasis,
  type SemanticTextProps,
  type SemanticTextTone,
} from './components/ui/semantic-text/semantic-text'
export {
  EmphasisDetailLine,
  type EmphasisDetailLineProps,
} from './components/ui/emphasis-detail-line'
export { Alert, type AlertProps, type AlertVariant } from './components/ui/alert'
export {
  alertVariants,
  alertTitleVariants,
  alertDescriptionVariants,
  ALERT_VARIANTS,
  type AlertVariantProps,
} from './components/ui/alert.variants'
export { RichTextContent, type RichTextContentProps } from './components/ui/rich-text-content'
export { MarkdownContent, type MarkdownContentProps } from './components/ui/markdown-content'
export {
  richTextContentVariants,
  richTextEditorProseClasses,
  richTextProseSizeClasses,
  type RichTextContentVariantProps,
} from './components/ui/rich-text-content.variants'
export {
  extractRichTextContent,
  looksLikeRichTextHtml,
  normalizeRichTextHtml,
  richTextHtmlEquals,
} from './components/ui/rich-text-html'
export { Avatar, type AvatarProps } from './components/ui/avatar.client'
export { eyebrowVariants, type EyebrowVariantProps } from './components/ui/eyebrow.variants'
export { Eyebrow, type EyebrowProps } from './components/ui/eyebrow'
export { NavSection, type NavSectionProps } from './components/ui/nav-section'
export { Button, type ButtonProps } from './components/ui/button.client'
export { buttonVariants } from './components/ui/button.variants'
export { Input, type InputProps } from './components/ui/input.client'
export {
  NumberInput,
  type NumberInputDigits,
  type NumberInputProps,
} from './components/ui/number-input.client'
export {
  NumberStepper,
  type NumberStepperDigits,
  type NumberStepperProps,
} from './components/ui/number-stepper.client'
export { Textarea, type TextareaProps } from './components/ui/textarea.client'
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card'

export {
  fieldControlVariants,
  textareaVariants,
  fieldWidthVariants,
  type FieldControlVariantProps,
  type TextareaVariantProps,
  type FieldWidthVariantProps,
  type FieldWidth,
} from './components/ui/field-control.variants'
export {
  fieldControlSizeClasses,
  fieldDigitSizeClasses,
  fieldDigitTrailingColumnClasses,
  fieldDigitTrailingIconClasses,
  fieldDigitTrailingPaddingClasses,
  fieldGroupedControlSizeClasses,
  buttonSizeToComboboxFieldSize,
  fieldSizeToArrayAddButtonSize,
  resolveArrayAddButtonSize,
  fieldSizeToBadgeSize,
  fieldSizeToChipSize,
  fieldSizeTypographyClasses,
  fieldTextareaSizeClasses,
  type FieldSizeToken,
} from './components/ui/field-sizing.variants'
export {
  Field,
  type FieldSize,
  type FieldRootProps,
  type FieldLabelProps,
  type FieldControlProps,
  type FieldHintProps,
  type FieldErrorProps,
} from './components/ui/field.client'

export {
  FieldLabelContent,
  FieldRadiogroupLabel,
  type FieldLabelContentProps,
  type FieldRadiogroupLabelProps,
} from './components/ui/field-label-content'
export { FormField } from './components/ui/form-field'
export { FieldLayout, type FieldLayoutProps } from './components/ui/field-layout'
export { TextField, type TextFieldProps } from './components/ui/text-field'
export { TextareaField, type TextareaFieldProps } from './components/ui/textarea-field'
export {
  OptionalFieldDisclosure,
  type OptionalFieldDisclosureProps,
} from './components/ui/optional-field-disclosure.client'
export { NumberField, type NumberFieldProps } from './components/ui/number-field'
export {
  DiceFormulaField,
  type DiceFormulaFieldProps,
} from './components/ui/dice-formula-field.client'
export {
  DEFAULT_DICE_FORMULA_VALUE,
  DEFAULT_DICE_FORMULA_WITH_MODIFIER,
  DICE_FORMULA_OPERATORS,
  defaultDiceFormulaForMode,
  formatDiceFormula,
  resolveDiceFormulaValue,
  type DiceFormulaLabelPosition,
  type DiceFormulaModifier,
  type DiceFormulaModifierMode,
  type DiceFormulaOperator,
  type DiceFormulaValue,
} from './components/ui/dice-formula-field.lib'
export {
  ARRAY_ITEM_HEADER_DIVIDER,
  ARRAY_ITEM_TEXT_SEPARATOR,
  joinArrayItemSummaryParts,
} from './form/config/array/array-item-config.lib'
export {
  SelectField,
  type SelectFieldProps,
  type SelectFieldOption,
  type SelectLabelPosition,
} from './components/ui/select-field'
export {
  FieldReadOnlyValue,
  FieldReadOnlyValueField,
  type FieldReadOnlyValueProps,
  type FieldReadOnlyValueFieldProps,
} from './components/ui/field-read-only-value.client'
export { CheckboxField, type CheckboxFieldProps } from './components/ui/checkbox-field'
export { SwitchField, type SwitchFieldProps } from './components/ui/switch-field'
export {
  RadioGroupField,
  type RadioGroupFieldProps,
  type RadioGroupFieldOption,
} from './components/ui/radio-group-field'
export {
  radioCardCompactBodyInsetClasses,
  radioCardCompactPanelPaddingClasses,
  radioCardCompactPaddingRightClasses,
  radioCardCompactPaddingXClasses,
} from './components/ui/radio-card.variants'
export {
  RadioCard,
  RadioCardItem,
  radioCardVariants,
  RADIO_CARD_DEFAULT_DETAILS_LABEL,
  RADIO_CARD_SUMMARY_SEPARATOR,
  type RadioCardDensity,
  type RadioCardVariant,
  type RadioCardEmbeddedSlotTone,
  type RadioCardOption,
  type RadioCardProps,
  type RadioCardItemProps,
} from './components/ui/radio-card.client'
export {
  AttentionFrame,
  ATTENTION_FRAME_DURATION_MS,
  ATTENTION_FRAME_REDUCED_MOTION_HOLD_MS,
  type AttentionFrameProps,
} from './components/ui/attention-frame.client'
export { attentionFrameVariants } from './components/ui/attention-frame.variants'
export {
  InsetPanel,
  InsetPanelText,
  type InsetPanelProps,
  type InsetPanelTextProps,
} from './components/ui/inset-panel.client'
export {
  DEFAULT_INSET_PANEL_SURFACE,
  INSET_PANEL_ALIGNS,
  INSET_PANEL_BORDER_STYLES,
  INSET_PANEL_SIZES,
  insetPanelClassNames,
  insetPanelEmptyStateClasses,
  insetPanelEmptyStateVariants,
  insetPanelGateClasses,
  insetPanelGateVariants,
  insetPanelSunkenShadowClasses,
  insetPanelTextVariantBySize,
  insetPanelVariants,
  resolveInsetPanelSurfaceClasses,
  resolveInsetPanelTextVariant,
  type InsetPanelAlign,
  type InsetPanelBorderStyle,
  type InsetPanelSize,
  type InsetPanelVariantProps,
} from './components/ui/inset-panel.variants'
export { RadioCardField, type RadioCardFieldProps } from './components/ui/radio-card-field'
export { JsonField, type JsonFieldProps } from './components/ui/json-field.client'
export { RichTextField, type RichTextFieldProps } from './components/ui/rich-text-field'
export { MarkdownField, type MarkdownFieldProps } from './components/ui/markdown-field.client'

export {
  FieldGroup,
  type FieldGroupChrome,
  type FieldGroupDisclosure,
  type FieldGroupLegendDisclosure,
  type FieldGroupSummary,
  type FieldGroupSummaryDisclosure,
  type FieldGroupLegendSize,
  type FieldGroupProps,
} from './components/ui/field-group'
export {
  resolveChromeAccentClasses,
  resolveChromeCalloutClasses,
  resolveChromeClasses,
  resolveChromeOutlineClasses,
  resolveChromePanelClasses,
  resolveChromeShellClasses,
  isSupportedSemanticChrome,
} from './components/ui/chrome.variants'
export { resolveSurfaceClasses } from './components/ui/surface.variants'
export type {
  ChromeBorderAccent,
  ChromeConfig,
  ChromeVariant,
  ContentTone,
  SemanticTone,
  SurfaceConfig,
  SurfaceElevation,
  SupportedSemanticChrome,
  VisualEmphasis,
} from './components/ui/visual-vocabulary.types'
export type { FieldChrome } from './components/ui/field-chrome.variants'
export {
  fieldArrayItemClasses,
  fieldArrayItemListClasses,
  fieldArrayItemVariants,
  fieldGroupBottomMarginClasses,
  fieldGroupFlexStackClasses,
  fieldGroupStackClasses,
  fieldInlineCheckboxControlColumnClasses,
  fieldInlineControlRowClasses,
  fieldInlineSentenceClasses,
  fieldInlineSwitchControlColumnClasses,
  fieldInlineToggleRowClasses,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
  fieldRowLayoutClasses,
  fieldSeparatorVariants,
  fieldStackRhythmVariants,
  fieldSettingsRowClasses,
  fieldToggleDependentIndentClasses,
  fieldToggleDependentStackClasses,
  type FieldHintPosition,
  type FieldLabelPlacement,
  type FieldLabelPosition,
  type FieldSeparator,
  type FieldStackLayout,
  type FieldStackRhythm,
} from './components/ui/field.variants'
export {
  resolveFieldDependentsChromeClasses,
  type FieldDependentsScope,
} from './components/ui/field-dependent.variants'
export { FieldRow, type FieldRowProps } from './components/ui/field-row'

export { FormCard, formCardContentClass } from './components/ui/form-card'
export { SubmitButton, type SubmitButtonProps } from './components/ui/submit-button'
export { SidebarTrigger, type SidebarTriggerProps } from './components/ui/sidebar-trigger.client'

export { RichTextEditor, type RichTextEditorProps } from './components/ui/rich-text-editor.client'
export {
  RichTextLinkPicker,
  type RichTextLinkPickerProps,
  type RichTextLinkPickerValue,
  type RichTextLinkPickerInternalOption,
  type RichTextLinkPickerContentTypeOption,
} from './components/ui/rich-text-link-picker.client'
export { PreviewCard, type PreviewCardProps } from './components/ui/preview-card.client'
export {
  ButtonDropdown,
  type ButtonDropdownGroup,
  type ButtonDropdownItem,
  type ButtonDropdownProps,
} from './components/ui/button-dropdown.client'
export {
  previewCardRootVariants,
  previewCardBodyVariants,
  previewCardTitleVariants,
  previewCardDescriptionVariants,
  type PreviewCardRootVariantProps,
  type PreviewCardLayout,
} from './components/ui/preview-card.variants'
export {
  RichTextLinkPreviewCard,
  type RichTextLinkPreviewCardProps,
} from './components/ui/rich-text-link-preview-card.client'
export {
  richTextLinkPreviewCardRootVariants,
  richTextLinkPreviewCardTitleVariants,
  richTextLinkPreviewCardMetaVariants,
  type RichTextLinkPreviewCardRootVariantProps,
} from './components/ui/rich-text-link-preview-card.variants'

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  InfoTooltip,
  type InfoTooltipProps,
} from './components/ui/tooltip.client'

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './components/ui/select.client'
export { Checkbox } from './components/ui/checkbox.client'
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group.client'
export { Switch } from './components/ui/switch.client'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/ui/dropdown-menu.client'
export {
  UserMenuTrigger,
  type UserMenuTriggerProps,
} from './components/ui/user-menu-trigger.client'

export {
  FileDropzone,
  type FileDropzoneProps,
  DEFAULT_ACCEPT,
} from './components/ui/file-dropzone.client'
export { FileField, type FileFieldProps } from './components/ui/file-field.client'

export { Modal, type ModalContentProps, type ModalHeaderProps } from './components/ui/modal.client'
export {
  modalOverlayVariants,
  modalContentVariants,
  type ModalContentVariantProps,
  type ModalSize,
} from './components/ui/modal.variants'
export { ConfirmDialog, type ConfirmDialogProps } from './components/ui/confirm-dialog.client'
export { Sheet, type SheetContentProps, type SheetHeaderProps } from './components/ui/sheet.client'
export {
  BuilderOptionDetailsSheet,
  type BuilderOptionDetailsSheetProps,
  type BuilderOptionDetailsMetadata,
  type BuilderOptionDetailsSection,
  type BuilderOptionDetailsSectionItem,
} from './components/ui/builder-option-details-sheet.client'
export type { BuilderOptionPrimaryActionPlacement } from './components/ui/builder-option-details-sheet.variants'
export {
  CollapsibleListItem,
  CollapsibleListItemActions,
  CollapsibleListItemBody,
  CollapsibleListItemCollapseButton,
  CollapsibleListItemDragHandle,
  CollapsibleListItemShell,
  CollapsibleListItemToolbar,
  collapsibleListItemBodyClasses,
  type CollapsibleListItemActionsProps,
  type CollapsibleListItemBodyProps,
  type CollapsibleListItemCollapseButtonProps,
  type CollapsibleListItemDragHandleConfig,
  type CollapsibleListItemDragHandleProps,
  type CollapsibleListItemProps,
  type CollapsibleListItemActionsAlign,
  type CollapsibleListItemShellProps,
  type CollapsibleListItemShellPreset,
  type CollapsibleListItemToolbarProps,
} from './components/ui/collapsible-list-item'
export {
  CatalogPickerSheet,
  type CatalogPickerSheetProps,
  type CatalogPickerSheetActionsHelpers,
  type CatalogPickerTab,
  type CatalogToolbarProps,
  type CatalogToolbarSearch,
  type CatalogToolbarTab,
  type CatalogToolbarTabs,
} from './components/ui/catalog-picker-sheet.client'
export { CatalogToolbar } from './components/ui/catalog-toolbar.client'
export {
  CatalogFilterChips,
  type CatalogFilterChipsOption,
  type CatalogFilterChipsProps,
  type CatalogFilterChipsSize,
} from './components/ui/catalog-filter-chips.client'
export {
  FilterPopover,
  type FilterPopoverGroup,
  type FilterPopoverProps,
} from './components/ui/filter-popover.client'
export {
  FilterToolbar,
  type FilterFieldConfig,
  type FilterToolbarLabelLayout,
  type FilterToolbarOption,
  type FilterToolbarProps,
  type SelectFilterFieldConfig,
} from './components/ui/filter-toolbar.client'
export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
} from './components/ui/segmented-control.client'
export {
  sheetBodyVariants,
  sheetContentVariants,
  type SheetContentVariantProps,
  type SheetSide,
} from './components/ui/sheet.variants'
export { useModal, type UseModalOptions, type UseModalReturn } from './hooks/use-modal'

export {
  Wizard,
  WizardStepNav,
  WizardFooter,
  useWizard,
  type WizardProps,
  type WizardStepDef,
  type WizardFooterProps,
} from './components/ui/wizard.client'

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
} from './components/ui/tabs.client'
export {
  tabsListVariants,
  tabsTriggerVariants,
  type TabsVariant,
} from './components/ui/tabs.variants'

export {
  ChipsField,
  ChipsFieldOptions,
  type ChipsFieldProps,
  type ChipsFieldOptionsProps,
} from './components/ui/chips-field.client'
export {
  ChooseFromChipsField,
  type ChooseFromChipsFieldProps,
} from './components/ui/choose-from-chips-field.client'
export type { CompactLabelSize as ChipSize } from './components/ui/compact-label.lib'
export {
  ComboboxField,
  type ComboboxFieldProps,
  type ComboboxFieldOption,
  type ComboboxRenderSelectedItem,
  type ComboboxSelectedItemRenderContext,
} from './components/ui/combobox-field.client'

export {
  EditableGrid,
  createEditableGridValue,
  type EditableGridProps,
  type EditableGridColumn,
  type EditableGridTemplate,
  type EditableGridTemplates,
  type EditableGridValue,
} from './components/ui/editable-grid.client'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/ui/table'
export {
  Badge,
  badgeVariants,
  type BadgeAppearance,
  type BadgeProps,
  type BadgeSize,
  type BadgeTone,
} from './components/ui/badge'
export {
  Chip,
  type ChipProps,
  type ChipSelectableProps,
  type ChipRemovableProps,
} from './components/ui/chip.client'
export { ChipGroup, type ChipGroupProps } from './components/ui/chip-group.client'
export { Spinner, type SpinnerProps } from './components/ui/spinner'
export { spinnerVariants, type SpinnerVariantProps } from './components/ui/spinner.variants'
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './components/ui/collapsible.client'
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
} from './components/ui/accordion.client'
export {
  accordionItemVariants,
  accordionTriggerVariants,
  accordionContentVariants,
  type AccordionVariant,
} from './components/ui/accordion.variants'

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb.client'

export {
  areColumnChangeStatesEqual,
  areColumnOrdersEqual,
  areVisibilityStatesEqual,
  createColumnChangeSnapshot,
  createPersistedColumnChangeState,
  isInternalDataTableColumnId,
  normalizeColumnOrderForPersist,
  normalizeColumnVisibilityForPersist,
} from './components/ui/data-table-column-change.lib'
export {
  BooleanCell,
  DataTable,
  NameCell,
  DataTableImageCell,
  RowActionsMenu,
  SortableHeader,
  TableBadgeCell,
} from './components/ui/data-table.client'
export type {
  BooleanCellProps,
  NameCellProps,
  DataTableImageCellProps,
  RowActionsMenuLinkProps,
  RowActionsMenuProps,
  TableBadgeCellProps,
} from './components/ui/data-table.client'
export {
  dataTableCellTypography,
  dataTableColumnMeta,
  dataTableColumnWidths,
  dataTableTypographyMeta,
  dataTableWidthMeta,
} from './components/ui/data-table-meta'
export type { DataTableCellTypography, DataTableColumnWidth } from './components/ui/data-table-meta'
export type {
  ColumnChangeState,
  DataTableEmptyStateContext,
  DataTableProps,
} from './components/ui/data-table.types'
export type { ColumnDef } from '@tanstack/react-table'
export {
  dataTableRootVariants,
  dataTableToolbarVariants,
  dataTableFilterGroupVariants,
  dataTableFilterControlVariants,
  dataTableAdvancedPanelVariants,
  dataTableAdvancedInnerVariants,
  dataTablePaginationVariants,
  dataTableTableVariants,
  dataTableTableWrapVariants,
  dataTableColumnPanelVariants,
  dataTableColumnItemVariants,
  dataTableColumnDragHandleVariants,
  dataTableEmptyPanelVariants,
  dataTableEmptyStateVariants,
  dataTableFilterChipVariants,
  dataTableFilterNoticeVariants,
  dataTableLockedColumnVariants,
  dataTableResetColumnVariants,
  dataTableCellTextVariants,
  dataTableImageVariants,
  dataTableNameCellVariants,
  dataTableNameLinkCellVariants,
  dataTableRowUnavailableVariants,
  dataTableRowUnavailableRailVariants,
  dataTableRowVariants,
  dataTableBodyCellPaddingVariants,
  dataTableBodyCellVariants,
  dataTableCaptionVariants,
  dataTableHeaderCellVariants,
  dataTableSortIconVariants,
} from './components/ui/data-table.variants'
