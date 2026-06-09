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
export { Avatar, type AvatarProps } from './components/ui/avatar.client'
export { Eyebrow, type EyebrowProps } from './components/ui/eyebrow'
export { NavSection, type NavSectionProps } from './components/ui/nav-section'
export { Button, type ButtonProps } from './components/ui/button.client'
export { buttonVariants } from './components/ui/button.variants'
export { Input, type InputProps } from './components/ui/input.client'
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
  Field,
  type FieldSize,
  type FieldRootProps,
  type FieldLabelProps,
  type FieldControlProps,
  type FieldHintProps,
  type FieldErrorProps,
} from './components/ui/field.client'

export { FormField } from './components/ui/form-field'
export { TextField, type TextFieldProps } from './components/ui/text-field'
export { TextareaField, type TextareaFieldProps } from './components/ui/textarea-field'
export { NumberField, type NumberFieldProps } from './components/ui/number-field'
export {
  SelectField,
  type SelectFieldProps,
  type SelectFieldOption,
} from './components/ui/select-field'
export { CheckboxField, type CheckboxFieldProps } from './components/ui/checkbox-field'
export { SwitchField, type SwitchFieldProps } from './components/ui/switch-field'
export {
  RadioGroupField,
  type RadioGroupFieldProps,
  type RadioGroupFieldOption,
} from './components/ui/radio-group-field'
export { JsonField, type JsonFieldProps } from './components/ui/json-field.client'
export { RichTextField, type RichTextFieldProps } from './components/ui/rich-text-field'

export { FieldGroup, type FieldGroupProps } from './components/ui/field-group'
export { FieldRow, type FieldRowProps } from './components/ui/field-row'

export { FormCard, formCardContentClass } from './components/ui/form-card'
export { SubmitButton, type SubmitButtonProps } from './components/ui/submit-button'
export { SidebarTrigger, type SidebarTriggerProps } from './components/ui/sidebar-trigger.client'

export { RichTextEditor, type RichTextEditorProps } from './components/ui/rich-text-editor.client'

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

export { Modal, type ModalContentProps, type ModalHeaderProps } from './components/ui/modal.client'
export {
  modalOverlayVariants,
  modalContentVariants,
  type ModalContentVariantProps,
  type ModalSize,
} from './components/ui/modal.variants'
export { ConfirmDialog, type ConfirmDialogProps } from './components/ui/confirm-dialog.client'
export { useModal, type UseModalOptions, type UseModalReturn } from './hooks/use-modal'
