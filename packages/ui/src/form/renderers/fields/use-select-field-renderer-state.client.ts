'use client'

import { useEffect, useMemo } from 'react'
import { useController, useFormState } from 'react-hook-form'

import {
  applyArrayFilterSelectOptions,
  useArrayFieldContext,
} from '../../context/array-field.context'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { useFormSectionContext } from '../../context/form-section.context'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { resolveNestedFieldErrorMessage } from '../../errors/resolve-field-error-message'
import type { SelectFieldConfig } from '../../field-config'
import {
  fieldDefaultValue,
  collectFieldDynamicDependsOn,
  isSelectFieldReadOnly,
  resolveSelectFieldDisplayLabel,
  resolveSelectFieldFlatOptions,
} from '../../field-config'
import { resolveFieldRenderConfig } from '../field-renderer-config.lib'
import { soleSelectOptionValue } from './select-field-renderer.lib'

export function useSelectFieldRendererState(
  config: SelectFieldConfig,
  fullName: string,
  namePrefix?: string,
) {
  const { size: inheritedSize } = useFormSectionContext()
  const arrayContext = useArrayFieldContext()
  const optionValues = useDependsOnValues(config.optionAvailability?.dependsOn ?? [], namePrefix)
  const dynamicValues = useDependsOnValues(collectFieldDynamicDependsOn(config), namePrefix)
  const resolved = resolveFieldRenderConfig(config, inheritedSize, dynamicValues, optionValues)
  const renderConfig = resolved.config as SelectFieldConfig

  const { field, fieldState } = useController({
    name: fullName,
    defaultValue: fieldDefaultValue(config),
  })
  const { errors } = useFormState()
  const validation = useFieldErrorPresentation(
    fieldState.error?.message ?? resolveNestedFieldErrorMessage(errors, fullName),
    fullName,
  )

  const resolvedOptions = useMemo(
    () =>
      resolveSelectFieldFlatOptions(
        renderConfig,
        optionValues,
        (options, fieldName) => applyArrayFilterSelectOptions(options, fieldName, arrayContext),
        dynamicValues,
      ),
    [arrayContext, dynamicValues, optionValues, renderConfig],
  )

  const isReadOnly = isSelectFieldReadOnly(renderConfig, resolvedOptions)
  const readOnlyValue = soleSelectOptionValue(resolvedOptions)

  useEffect(() => {
    if (!isReadOnly || readOnlyValue == null || field.value === readOnlyValue) return
    field.onChange(readOnlyValue)
  }, [field, isReadOnly, readOnlyValue])

  const displayValue =
    resolveSelectFieldDisplayLabel(field.value, resolvedOptions) ?? String(field.value ?? '')

  return {
    renderConfig,
    hint: resolved.hint,
    hintPosition: resolved.hintPosition,
    field,
    validation,
    resolvedOptions,
    isReadOnly,
    displayValue,
  }
}
