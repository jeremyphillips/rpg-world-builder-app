'use client'

import { FieldReadOnlyValueField } from '../../../components/ui/field-read-only-value.client'
import { SelectField } from '../../../components/ui/select-field'
import type { SelectFieldConfig } from '../../field-config'
import { normalizedSelectFieldValue, pickSelectFieldChromeProps } from './select-field-renderer.lib'
import { useSelectFieldRendererState } from './use-select-field-renderer-state.client'

export interface SelectFieldRendererProps {
  config: SelectFieldConfig
  fullName: string
  id: string
  namePrefix?: string
}

/** RHF adapter for `SelectField` with array filtering and read-only presentation. */
export function SelectFieldRenderer({
  config,
  fullName,
  id,
  namePrefix,
}: SelectFieldRendererProps) {
  const state = useSelectFieldRendererState(config, fullName, namePrefix)
  const chrome = pickSelectFieldChromeProps(state.renderConfig)

  if (state.isReadOnly) {
    return (
      <FieldReadOnlyValueField
        id={id}
        displayValue={state.displayValue}
        {...chrome}
        {...state.validation}
      />
    )
  }

  return (
    <SelectField
      id={id}
      options={state.resolvedOptions}
      placeholder={state.renderConfig.placeholder}
      name={state.field.name}
      disabled={state.renderConfig.disabled}
      value={normalizedSelectFieldValue(state.field.value)}
      onValueChange={state.field.onChange}
      onBlur={state.field.onBlur}
      {...chrome}
      {...state.validation}
    />
  )
}
