import type { FieldLabelPosition } from '../../components/ui/field.variants'
import type { FieldDigits } from '../../components/ui/field-digit-metrics'
import type { FieldWidth } from '../../components/ui/field-control.variants'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
} from '../../components/ui/rich-text-link-picker.client'

import type {
  BaseFieldConfig,
  OptionalDisclosureConfig,
  TrailingFieldActionConfig,
} from './field-base.types'
import type { FieldDynamicSuggestions } from './field-dynamic.types'

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text'
  placeholder?: string
  optionalDisclosure?: OptionalDisclosureConfig
  /** Native input type for the text control (e.g. `email`, `password`). */
  inputType?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search'
  autoComplete?: string
  defaultValue?: string
  trailingAction?: TrailingFieldActionConfig
}

export interface TextSuggestionsFieldConfig extends BaseFieldConfig {
  type: 'textSuggestions'
  placeholder?: string
  defaultValue?: string
  suggestions: FieldDynamicSuggestions
  optionalDisclosure?: OptionalDisclosureConfig
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number'
  placeholder?: string
  /** Bounds for Zod/schema validation — not applied as HTML `min`/`max` (allows in-progress edits). */
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  /**
   * Value written when an empty stepper is incremented. Omitted steppers still
   * seed from `min`.
   */
  emptySeed?: number
  /**
   * Max-width applied to the `<input>` element itself, independent of the
   * container's layout `width`. Use intrinsic tokens (`xs`–`xl`, `auto`).
   */
  inputWidth?: FieldWidth
  /** Visual digit capacity for the numeric input (sets input width from ch-based tokens). */
  digits?: FieldDigits
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
  /**
   * `input` (default) keeps the text number field.
   * `stepper` renders the shared `NumberStepper` for small bounded integers.
   */
  control?: 'input' | 'stepper'
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea'
  placeholder?: string
  rows?: number
  defaultValue?: string
  optionalDisclosure?: OptionalDisclosureConfig
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
  optionalDisclosure?: OptionalDisclosureConfig
  /** Opt in to the link toolbar button + extension (off by default). */
  linkable?: boolean
  /** Opt in to inline/code-block marks, toolbar buttons, and backtick input rules (off by default). */
  codeBlocks?: boolean
  /** Opt in to structured table embed blocks and the Table toolbar button (off by default). */
  tables?: boolean
  /** Internal link targets shown in the rich-text link picker. */
  internalLinkOptions?: RichTextLinkPickerInternalOption[]
  /** Content type filter options for the rich-text link picker. */
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  defaultValue?: string
}

export interface MarkdownFieldConfig extends BaseFieldConfig {
  type: 'markdown'
  placeholder?: string
  rows?: number
  defaultValue?: string
}

/** Remote preview for a stored asset key — passed at the form level, not in the schema. */
export interface FileFieldRemotePreview {
  /** Resolved URL for an already-uploaded image (e.g. via `getAssetUrl(key)`). */
  existingImageUrl?: string
  /** Label shown beside the remote preview row. */
  existingImageLabel?: string
  /** Called when the user removes the stored image without selecting a new file. */
  onClearExisting?: () => void
}

/** Per-field remote preview overrides keyed by form field name. */
export type FileFieldPropsMap = Partial<Record<string, FileFieldRemotePreview>>

export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file'
  /**
   * Accepted MIME types or file extensions (e.g. `['image/*']`, `['.pdf']`).
   * Defaults to `['image/*']`.
   */
  accept?: string[]
  /** Allow selecting multiple files. Defaults to `false`. */
  multiple?: boolean
  /** Maximum number of files when `multiple` is true. */
  maxFiles?: number
  /** Maximum size per file in bytes. */
  maxSize?: number
}
