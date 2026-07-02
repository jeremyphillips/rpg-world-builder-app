import type { ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { RichTextEditor } from './rich-text-editor.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
} from './rich-text-link-picker.client'

import type { FieldValidationProps } from './field-validation-props'

export interface RichTextFieldProps extends FieldValidationProps {
  id: string
  label: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  linkable?: boolean
  /** Opt in to inline/code-block marks, toolbar buttons, and backtick input rules (off by default). */
  codeBlocks?: boolean
  internalLinkOptions?: RichTextLinkPickerInternalOption[]
  contentTypeOptions?: RichTextLinkPickerContentTypeOption[]
  disabled?: boolean
  value?: string
  onChange?: (html: string) => void
  onBlur?: () => void
}

/**
 * Labelled rich-text field bound to the compound `Field`. The editable surface
 * is named via `aria-label` (a contenteditable is not a labelable element); id
 * and aria wiring are injected by `Field.Control`.
 */
export function RichTextField({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  width,
  size = 'md',
  linkable,
  codeBlocks,
  internalLinkOptions,
  contentTypeOptions,
  disabled,
  value,
  onChange,
  onBlur,
}: RichTextFieldProps) {
  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={width}
      size={size}
    >
      <FieldLayout
        hintPosition={hintPosition}
        label={
          <Field.Label>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={
          <RichTextEditor
            aria-label={label}
            size={size}
            linkable={linkable}
            codeBlocks={codeBlocks}
            internalLinkOptions={internalLinkOptions}
            contentTypeOptions={contentTypeOptions}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        }
      />
    </Field.Root>
  )
}
