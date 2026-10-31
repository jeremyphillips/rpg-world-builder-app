'use client'

import { useState } from 'react'

import { Button } from '../../../components/ui/button.client'
import { FieldReadOnlyValueField } from '../../../components/ui/field-read-only-value.client'
import { SelectField } from '../../../components/ui/select-field'
import type { SelectFieldConfig } from '../../field-config'
import { resolveFieldCopyContext } from '../../config/field-copy-context.lib'
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
  const copyContext = resolveFieldCopyContext(state.renderConfig)
  const chrome = pickSelectFieldChromeProps(state.renderConfig, {
    hint: state.hint,
    hintPosition: state.hintPosition,
    size: state.controlSize,
  })
  const changeLabel = state.renderConfig.presentation?.changeLabel
  const [changing, setChanging] = useState(false)
  const value = normalizedSelectFieldValue(state.field.value)
  const showEditor = !changeLabel || changing || value === ''

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

  if (changeLabel && !showEditor) {
    return (
      <div className="flex min-w-0 items-end gap-2">
        <div className="min-w-0">
          <FieldReadOnlyValueField
            id={id}
            displayValue={state.displayValue}
            {...chrome}
            {...state.validation}
          />
        </div>
        <Button
          type="button"
          variant="text"
          size="sm"
          className="shrink-0 font-normal"
          aria-label={`${changeLabel} ${state.renderConfig.label}`}
          onClick={() => setChanging(true)}
        >
          {changeLabel}
        </Button>
      </div>
    )
  }

  return (
    <SelectField
      id={id}
      options={state.resolvedOptions}
      placeholder={state.renderConfig.placeholder}
      noun={copyContext.noun}
      digits={state.renderConfig.digits}
      sizingLabel={state.renderConfig.sizingLabel}
      sizingLabels={state.renderConfig.sizingLabels}
      name={state.field.name}
      disabled={state.renderConfig.disabled}
      value={value}
      onValueChange={(next) => {
        state.field.onChange(next)
        if (changeLabel && next) setChanging(false)
      }}
      onBlur={() => {
        state.field.onBlur()
        if (changeLabel && value) setChanging(false)
      }}
      clearable={state.renderConfig.clearable}
      clearAccessibleName={state.renderConfig.clearAccessibleName}
      onClear={() => state.field.onChange('', { shouldDirty: true })}
      {...chrome}
      {...state.validation}
    />
  )
}
