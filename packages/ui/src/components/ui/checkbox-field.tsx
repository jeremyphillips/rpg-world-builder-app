import type { ComponentProps, ReactNode } from 'react'

import { Field } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { Checkbox } from './checkbox.client'
import { fieldLabelHintStackClasses } from './field.variants'
import type { FieldWidth } from './field-control.variants'

export interface CheckboxFieldProps extends Omit<ComponentProps<typeof Checkbox>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
}

/** A single checkbox with an inline label, bound to the compound `Field`. */
export function CheckboxField({
  id,
  label,
  error,
  hint,
  info,
  required,
  width,
  ...checkboxProps
}: CheckboxFieldProps) {
  const labelNode = (
    <Field.Label className="font-normal">
      <FieldLabelContent label={label} info={info} />
    </Field.Label>
  )

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <div className="flex items-start gap-2">
        <Field.Control>
          <Checkbox {...checkboxProps} />
        </Field.Control>
        <div className={fieldLabelHintStackClasses}>
          {labelNode}
          <Field.Hint />
        </div>
      </div>
      <Field.Error />
    </Field.Root>
  )
}
