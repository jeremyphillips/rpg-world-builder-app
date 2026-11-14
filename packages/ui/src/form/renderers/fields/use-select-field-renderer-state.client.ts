'use client'

import { useEffect, useMemo } from 'react'
import { useController } from 'react-hook-form'

import {
  applyArrayFilterSelectOptions,
  useArrayFieldContext,
} from '../../context/array-field.context'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { useFieldRowParticipation } from '../../../components/ui/field-row-anatomy.context'
import { useFormSectionContext } from '../../context/form-section.context'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import type { SelectFieldConfig } from '../../field-config'
import {
  fieldDefaultValue,
  collectFieldDynamicDependsOn,
  filterSelectFieldOptionList,
  flattenSelectFieldOptions,
  isSelectFieldReadOnly,
  resolveSelectFieldDisplayLabel,
} from '../../field-config'
import { resolveFieldRenderConfig } from '../field-renderer-config.lib'
import { soleSelectOptionValue } from './select-field-renderer.lib'

export function useSelectFieldRendererState(
  config: SelectFieldConfig,
  fullName: string,
  namePrefix?: string,
) {
  const { density } = useFormSectionContext()
  const inAnatomyRow = useFieldRowParticipation()
  const arrayContext = useArrayFieldContext()
  const optionValues = useDependsOnValues(config.optionAvailability?.dependsOn ?? [], namePrefix)
  const dynamicValues = useDependsOnValues(collectFieldDynamicDependsOn(config), namePrefix)
  const resolved = resolveFieldRenderConfig(config, density, dynamicValues, optionValues, {
    inAnatomyRow,
  })
  const renderConfig = resolved.config as SelectFieldConfig

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
    controlSize: resolved.controlSize,
    hint: resolved.hint,
    hintPosition: resolved.hintPosition,
    field,
    validation,
    resolvedOptions,
    flatOptions,
    isReadOnly,
    displayValue,
  }
}
