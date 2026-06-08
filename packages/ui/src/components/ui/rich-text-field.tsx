import type { ReactNode } from 'react'

import { Field } from './field.client'
import { InfoTooltip } from './tooltip.client'
import { RichTextEditor } from './rich-text-editor.client'
import type { FieldWidth } from './field-control.variants'

export interface RichTextFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  linkable?: boolean
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
  info,
  required,
  width,
  linkable,
  disabled,
  value,
  onChange,
  onBlur,
}: RichTextFieldProps) {
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <Field.Label>
        {label}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </Field.Label>
      <Field.Control>
        <RichTextEditor
          aria-label={label}
          linkable={linkable}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
