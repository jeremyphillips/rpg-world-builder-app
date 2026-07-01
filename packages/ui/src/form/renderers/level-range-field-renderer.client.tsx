'use client'

import { useController } from 'react-hook-form'

import {
  flattenSelectFieldOptions,
  LevelRangeField,
} from '../../components/ui/level-range-field.client'
import { applyArrayFilterSelectOptions, useArrayFieldContext } from '../context/array-field.context'
import { useFormSectionContext } from '../context/form-section.context'
import { resolveInheritedFieldSize } from '../../components/ui/field.variants'
import type { LevelRangeFieldConfig } from '../field-config'

export interface LevelRangeFieldRendererProps {
  config: LevelRangeFieldConfig
  id: string
  namePrefix?: string
}

function resolveLevelRangeNames(config: LevelRangeFieldConfig) {
  const minName = config.minName ?? config.name
  const maxName = config.maxName ?? 'maxLevel'
  return { minName, maxName }
}

/** RHF adapter for `LevelRangeField` — binds min/max sibling paths. */
export function LevelRangeFieldRenderer({ config, id, namePrefix }: LevelRangeFieldRendererProps) {
  const { minName, maxName } = resolveLevelRangeNames(config)
  const minFullName = namePrefix ? `${namePrefix}.${minName}` : minName
  const maxFullName = namePrefix ? `${namePrefix}.${maxName}` : maxName
  const minId = `${id}-min`
  const maxId = `${id}-max`

  const { size: inheritedSize } = useFormSectionContext()
  const resolvedSize = resolveInheritedFieldSize({
    explicit: config.size,
    inherited: inheritedSize,
  })
  const arrayContext = useArrayFieldContext()

  const { field: minField, fieldState: minState } = useController({ name: minFullName })
  const { field: maxField, fieldState: maxState } = useController({ name: maxFullName })

  const baseOptions = flattenSelectFieldOptions(config.options)
  const minOptions = applyArrayFilterSelectOptions(baseOptions, minName, arrayContext)
  const maxOptions = applyArrayFilterSelectOptions(baseOptions, maxName, arrayContext)

  const combinedError = minState.error?.message ?? maxState.error?.message

  return (
    <LevelRangeField
      id={id}
      label={config.label}
      minId={minId}
      maxId={maxId}
      minValue={typeof minField.value === 'number' ? minField.value : undefined}
      maxValue={typeof maxField.value === 'number' ? maxField.value : undefined}
      minOptions={minOptions}
      maxOptions={maxOptions}
      connector={config.connector}
      error={combinedError}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={resolvedSize}
      width={config.width}
      digits={config.digits}
      onMinChange={minField.onChange}
      onMaxChange={maxField.onChange}
      onMinBlur={minField.onBlur}
      onMaxBlur={maxField.onBlur}
    />
  )
}

export { resolveLevelRangeNames }
