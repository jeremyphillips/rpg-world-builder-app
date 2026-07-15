'use client'

import { useCallback, useMemo, useRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import {
  applyLevelRangeMaxChange,
  applyLevelRangeMinChange,
  levelRangeRowsEqual,
  type LevelRangeRow,
} from '@rpg/contracts'

import {
  flattenSelectFieldOptions,
  LevelRangeField,
} from '../../../components/ui/level-range-field.client'
import {
  applyArrayFilterSelectOptions,
  useArrayFieldContext,
} from '../../context/array-field.context'
import { useFormSectionContext } from '../../context/form-section.context'
import { resolveFirstFieldErrorMessage } from '../../errors/resolve-field-error-message'
import { resolveInheritedFieldSize } from '../../../components/ui/field.variants'
import type { LevelRangeFieldConfig } from '../../field-config'

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

function coalesceLevel(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

function applyLevelRangeRowPatches(
  fullArrayName: string,
  previous: LevelRangeRow[],
  updated: LevelRangeRow[],
  setValue: ReturnType<typeof useFormContext>['setValue'],
): void {
  for (let index = 0; index < updated.length; index++) {
    const nextRow = updated[index]
    const previousRow = previous[index]
    if (!nextRow) continue

    if (previousRow?.minLevel !== nextRow.minLevel) {
      setValue(`${fullArrayName}.${index}.minLevel`, nextRow.minLevel, {
        shouldDirty: true,
        shouldValidate: false,
      })
    }

    if (previousRow?.maxLevel !== nextRow.maxLevel) {
      setValue(`${fullArrayName}.${index}.maxLevel`, nextRow.maxLevel, {
        shouldDirty: true,
        shouldValidate: false,
      })
    }
  }
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
  const { getValues, setValue } = useFormContext()
  const applyingCascadeRef = useRef(false)

  const { field: minField, fieldState: minState } = useController({ name: minFullName })
  const { field: maxField, fieldState: maxState } = useController({ name: maxFullName })

  const minLevel = coalesceLevel(minField.value)
  const maxLevel = coalesceLevel(maxField.value)

  const baseOptions = useMemo(() => flattenSelectFieldOptions(config.options), [config.options])

  const minOptions = useMemo(
    () => applyArrayFilterSelectOptions(baseOptions, minName, arrayContext),
    [arrayContext, baseOptions, minName],
  )

  const maxOptions = useMemo(
    () => applyArrayFilterSelectOptions(baseOptions, maxName, arrayContext),
    [arrayContext, baseOptions, maxName],
  )

  const combinedError = resolveFirstFieldErrorMessage(
    minState.error?.message,
    maxState.error?.message,
  )

  const cascadeArrayUpdate = useCallback(
    (field: 'min' | 'max', value: number) => {
      const fullArrayName = arrayContext?.fullArrayName
      if (!fullArrayName || !arrayContext?.levelRangeKeys || applyingCascadeRef.current) {
        return false
      }

      const rows = getValues(fullArrayName) as LevelRangeRow[]
      const updated =
        field === 'max'
          ? applyLevelRangeMaxChange(rows, arrayContext.rowIndex, value)
          : applyLevelRangeMinChange(rows, arrayContext.rowIndex, value)

      if (levelRangeRowsEqual(rows, updated)) {
        return true
      }

      applyingCascadeRef.current = true
      try {
        applyLevelRangeRowPatches(fullArrayName, rows, updated, setValue)
      } finally {
        queueMicrotask(() => {
          applyingCascadeRef.current = false
        })
      }

      return true
    },
    [
      arrayContext?.fullArrayName,
      arrayContext?.levelRangeKeys,
      arrayContext?.rowIndex,
      getValues,
      setValue,
    ],
  )

  const onMinChange = useCallback(
    (value: number) => {
      if (minLevel !== undefined && value === minLevel) {
        return
      }

      if (!cascadeArrayUpdate('min', value)) {
        minField.onChange(value)
      }
    },
    [cascadeArrayUpdate, minField, minLevel],
  )

  const onMaxChange = useCallback(
    (value: number) => {
      if (maxLevel !== undefined && value === maxLevel) {
        return
      }

      if (!cascadeArrayUpdate('max', value)) {
        maxField.onChange(value)
      }
    },
    [cascadeArrayUpdate, maxField, maxLevel],
  )

  return (
    <LevelRangeField
      id={id}
      label={config.label}
      minId={minId}
      maxId={maxId}
      minValue={minLevel}
      maxValue={maxLevel}
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
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      onMinBlur={minField.onBlur}
      onMaxBlur={maxField.onBlur}
    />
  )
}

export { resolveLevelRangeNames }
