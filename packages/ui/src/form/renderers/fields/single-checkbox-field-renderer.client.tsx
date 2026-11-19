'use client'

import { CheckboxField } from '../../../components/ui/checkbox-field'
import type { BooleanFieldConfig, CheckboxFieldConfig, FieldConfig } from '../../field-config'
import type { RenderArgs } from '../field-renderer-adapters.client'
import { buildFieldShellProps } from '../field-shell-props.lib'

const checkboxFieldShell = { sizes: 'both', label: 'visible' } as const

type SingleCheckboxConfig = BooleanFieldConfig | CheckboxFieldConfig

function isBooleanConfig(config: FieldConfig): config is BooleanFieldConfig {
  return config.type === 'boolean'
}

export function SingleCheckboxFieldRenderer({
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
}: RenderArgs<SingleCheckboxConfig['type']> & { config: SingleCheckboxConfig }) {
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
    checkboxFieldShell,
  )

  return (
    <CheckboxField
      {...shell}
      shell={isBooleanConfig(config) ? config.shell : undefined}
      tone={isBooleanConfig(config) ? config.tone : undefined}
      checked={field.value === true}
      disabled={config.disabled}
      onCheckedChange={(checked) => field.onChange(checked)}
      onBlur={field.onBlur}
    />
  )
}
