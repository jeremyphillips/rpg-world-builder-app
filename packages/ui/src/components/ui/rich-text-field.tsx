import type { ReactNode } from 'react'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { RichTextEditor } from './rich-text-editor.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type {
  RichTextLinkPickerContentTypeOption,
  RichTextLinkPickerInternalOption,
} from './rich-text-link-picker.client'

export interface RichTextFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
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
  hint,
  hintPosition,
  info,
  required,
  width,
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
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
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
