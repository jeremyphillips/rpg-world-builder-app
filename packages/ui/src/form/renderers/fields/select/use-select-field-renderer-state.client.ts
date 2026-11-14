'use client'

import { useEffect, useMemo } from 'react'
import { useController } from 'react-hook-form'

import {
  applyArrayFilterSelectOptions,
  useArrayFieldContext,
} from '../../../context/array-field.context'
import { useFieldErrorPresentation } from '../../../context/array-item-presentation.context'
import type { FieldSize } from '../../../../components/ui/field.client'
import type { FieldHintPosition } from '../../../../components/ui/field.variants'
import type { SelectFieldConfig } from '../../../field-config'
import {
  fieldDefaultValue,
  filterSelectFieldOptionList,
  flattenSelectFieldOptions,
  isSelectFieldReadOnly,
  resolveSelectFieldDisplayLabel,
} from '../../../field-config'
import { soleSelectOptionValue } from './select-field-renderer.lib'

/** Parent-resolved select config. Array filtering and read-only commit stay in this hook. */
export type SelectFieldResolvedStateInput = {
  config: SelectFieldConfig
  presentationSize: FieldSize
  controlSize: FieldSize
  hint?: string
  hintPosition?: FieldHintPosition
  fullName: string
  namePrefix?: string
}

export function useSelectFieldRendererState({
  config,
  presentationSize,
  controlSize,
  hint,
  hintPosition,
  fullName,
}: SelectFieldResolvedStateInput) {
  const arrayContext = useArrayFieldContext()
  const renderConfig = config

  const { field, fieldState } = useController({
    name: fullName,
    defaultValue: fieldDefaultValue(config),
  })
  const validation = useFieldErrorPresentation(fieldState.error?.message, fullName)

  const resolvedOptions = useMemo(
    () =>
      filterSelectFieldOptionList(renderConfig.options ?? [], (options) =>
        applyArrayFilterSelectOptions(options, renderConfig.name, arrayContext),
      ),
    [arrayContext, renderConfig.name, renderConfig.options],
  )
  const flatOptions = useMemo(() => flattenSelectFieldOptions(resolvedOptions), [resolvedOptions])

  const isReadOnly = isSelectFieldReadOnly(renderConfig, flatOptions)
  const readOnlyValue = soleSelectOptionValue(flatOptions)

  useEffect(() => {
    if (!isReadOnly || readOnlyValue == null || field.value === readOnlyValue) return
    field.onChange(readOnlyValue)
  }, [field, isReadOnly, readOnlyValue])

  const displayValue =
    resolveSelectFieldDisplayLabel(field.value, flatOptions) ?? String(field.value ?? '')

  return {
    renderConfig,
    presentationSize,
    controlSize,
    hint,
    hintPosition,
    field,
    validation,
    resolvedOptions,
    flatOptions,
    isReadOnly,
    displayValue,
  }
}
