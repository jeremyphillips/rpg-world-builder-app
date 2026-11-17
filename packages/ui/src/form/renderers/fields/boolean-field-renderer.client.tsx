'use client'

import { BooleanField } from '../../../components/ui/boolean-field.client'
import { FormField } from '../../../components/ui/form-field'
import type { RenderArgs } from '../field-renderer-adapters.client'
import { buildFieldShellProps } from '../field-shell-props.lib'

const booleanFieldShell = { sizes: 'both', label: 'visible' } as const

export function BooleanFieldRenderer({
  config,
  field,
  id,
  presentationSize,
  controlSize,
  hint,
  hintPosition,
  error,
  invalid,
  describedBy,
}: RenderArgs<'boolean'>) {
  const shell = buildFieldShellProps(
    {
      config,
      id,
      hint,
      hintPosition,
      presentationSize,
      controlSize,
    },
    { error, invalid, describedBy },
    booleanFieldShell,
  )

  return (
    <FormField {...shell} label="" labelVisibility="srOnly" controlBand="content-sized">
      <BooleanField
        id={id}
        label={config.label}
        checked={field.value === true}
        disabled={config.disabled}
        invalid={invalid}
        describedBy={describedBy}
        onCheckedChange={(checked) => field.onChange(checked)}
        onBlur={field.onBlur}
      />
    </FormField>
  )
}
