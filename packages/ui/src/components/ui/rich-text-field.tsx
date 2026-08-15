import type { ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { RichTextEditor } from './rich-text-editor.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
} from './rich-text-link-picker.client'

import type { FieldChromeProps } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'

export interface RichTextFieldProps
  extends FieldValidationProps, FieldChromeProps, FieldLabelPresentationProps {
  id: string
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
  labelVisibility = 'visible',
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
  chrome,
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
          <FormFieldLabel
            label={label}
            labelVisibility={labelVisibility}
            info={info}
            required={required}
          />
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
        chrome={chrome}
        size={size}
        controlBand="content-sized"
      />
    </Field.Root>
  )
}
