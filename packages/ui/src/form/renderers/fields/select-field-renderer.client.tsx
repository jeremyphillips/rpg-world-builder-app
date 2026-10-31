'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '../../../components/ui/button.client'
import { FieldReadOnlyValueField } from '../../../components/ui/field-read-only-value.client'
import { SelectField } from '../../../components/ui/select-field'
import type { SelectFieldConfig } from '../../field-config'
import { resolveSelectFieldOptionLabel } from '../../field-config'
import { resolveFieldCopyContext } from '../../config/field-copy-context.lib'
import { formMicroActionButtonProps } from '../../form-micro-action'
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
  const changePresentation = state.renderConfig.presentation?.change
  const changeLabel = changePresentation?.label
  const [changing, setChanging] = useState(false)
  const changeButtonRef = useRef<HTMLButtonElement>(null)
  const selectWasOpenRef = useRef(false)
  const value = normalizedSelectFieldValue(state.field.value)
  const committedLabel = resolveSelectFieldOptionLabel(state.field.value, state.resolvedOptions)
  const showEditor =
    !changeLabel || changing || value === '' || (value !== '' && committedLabel == null)

  useEffect(() => {
    setChanging(false)
  }, [state.field.value])

  useEffect(() => {
    if (!changing || !changeLabel) return
    requestAnimationFrame(() => {
      document.getElementById(id)?.focus()
    })
  }, [changeLabel, changing, id])

  const focusChangeButton = () => {
    requestAnimationFrame(() => {
      changeButtonRef.current?.focus()
    })
  }

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
      <FieldReadOnlyValueField
        id={id}
        displayValue={committedLabel ?? state.displayValue}
        controlEnd={
          <Button
            {...formMicroActionButtonProps}
            ref={changeButtonRef}
            className="shrink-0 font-normal"
            disabled={state.renderConfig.disabled}
            aria-label={`${changeLabel} ${state.renderConfig.label}`}
            onClick={() => {
              selectWasOpenRef.current = false
              setChanging(true)
            }}
          >
            {changeLabel}
          </Button>
        }
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
      noun={copyContext.noun}
      digits={state.renderConfig.digits}
      sizingLabel={state.renderConfig.sizingLabel}
      sizingLabels={state.renderConfig.sizingLabels}
      name={state.field.name}
      disabled={state.renderConfig.disabled}
      value={value}
      onValueChange={(next) => {
        state.field.onChange(next)
        if (changeLabel && next) {
          selectWasOpenRef.current = false
          setChanging(false)
          focusChangeButton()
        }
      }}
      onBlur={() => {
        state.field.onBlur()
      }}
      onOpenChange={(open) => {
        if (open) {
          selectWasOpenRef.current = true
          return
        }
        if (changeLabel && selectWasOpenRef.current && value) {
          selectWasOpenRef.current = false
          setChanging(false)
          focusChangeButton()
        }
      }}
      clearable={state.renderConfig.clearable}
      clearAccessibleName={state.renderConfig.clearAccessibleName}
      onClear={() => state.field.onChange('', { shouldDirty: true })}
      {...chrome}
      {...state.validation}
    />
  )
}
