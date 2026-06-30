'use client'

import type { ControllerRenderProps } from 'react-hook-form'

import { InlineChooseCountField } from '../components/ui/inline-choose-count-field.client'
import type { InlineChooseCountFieldConfig } from './field-config'

export interface InlineChooseCountFieldRendererProps {
  config: InlineChooseCountFieldConfig
  field: ControllerRenderProps
  id: string
  error?: string
}

/** RHF adapter for `InlineChooseCountField`. */
export function InlineChooseCountFieldRenderer({
  config,
  field,
  id,
  error,
}: InlineChooseCountFieldRendererProps) {
  return (
    <InlineChooseCountField
      id={id}
      label={config.label}
      value={typeof field.value === 'number' ? field.value : undefined}
      onChange={field.onChange}
      onBlur={field.onBlur}
      chooseMin={config.chooseMin}
      chooseMax={config.chooseMax}
      prefix={config.prefix}
      suffix={config.suffix}
      digits={config.digits}
      error={error}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={config.size}
      width={config.width}
      hideLabel={config.hideLabel}
    />
  )
}
