'use client'

import { useMemo } from 'react'
import { useController } from 'react-hook-form'

import { InlineSentenceField } from '../../components/ui/inline-sentence-field.client'
import {
  filterVisibleInlineSentenceSegments,
  inlineSentenceSegmentVisibilityDeps,
  inlineSentenceUniqueBoundNames,
  isInlineSentenceBoundSegment,
  MAX_INLINE_SENTENCE_BOUND_CONTROLLERS,
} from '../../components/ui/inline-sentence-field.lib'
import type {
  InlineSentenceBoundChips,
  InlineSentenceBoundControl,
  InlineSentenceBoundNumber,
  InlineSentenceBoundSelect,
} from '../../components/ui/inline-sentence-field.types'
import { resolveFirstFieldErrorMessage } from '../errors/resolve-field-error-message'
import { resolveSelectPlaceholder } from '../config/field-placeholder.lib'
import { useDependsOnValues } from '../config/form-depends-on.client'
import type { InlineSentenceFieldConfig } from '../field-config'

export interface InlineSentenceFieldRendererProps {
  config: InlineSentenceFieldConfig
  id: string
  namePrefix?: string
  error?: string
}

function resolveFullName(namePrefix: string | undefined, name: string): string {
  return namePrefix ? `${namePrefix}.${name}` : name
}

function useInlineSentenceControllers(uniqueBoundNames: readonly string[], namePrefix?: string) {
  const resolve = (index: number) =>
    resolveFullName(namePrefix, uniqueBoundNames[index] ?? `__inlineSentenceUnused${index}`)

  const controller0 = useController({
    name: resolve(0),
    disabled: uniqueBoundNames.length < 1,
  })
  const controller1 = useController({
    name: resolve(1),
    disabled: uniqueBoundNames.length < 2,
  })
  const controller2 = useController({
    name: resolve(2),
    disabled: uniqueBoundNames.length < 3,
  })
  const controller3 = useController({
    name: resolve(3),
    disabled: uniqueBoundNames.length < 4,
  })
  const controller4 = useController({
    name: resolve(4),
    disabled: uniqueBoundNames.length < 5,
  })
  const controller5 = useController({
    name: resolve(5),
    disabled: uniqueBoundNames.length < 6,
  })
  const controller6 = useController({
    name: resolve(6),
    disabled: uniqueBoundNames.length < 7,
  })
  const controller7 = useController({
    name: resolve(7),
    disabled: uniqueBoundNames.length < 8,
  })

  return useMemo(
    () => [
      controller0,
      controller1,
      controller2,
      controller3,
      controller4,
      controller5,
      controller6,
      controller7,
    ],
    [
      controller0,
      controller1,
      controller2,
      controller3,
      controller4,
      controller5,
      controller6,
      controller7,
    ],
  )
}

/** RHF adapter for `InlineSentenceField` — one controller per distinct bound segment. */
export function InlineSentenceFieldRenderer({
  config,
  id,
  namePrefix,
  error,
}: InlineSentenceFieldRendererProps) {
  const segmentVisibilityDeps = useMemo(
    () => inlineSentenceSegmentVisibilityDeps(config.segments),
    [config.segments],
  )
  const segmentVisibilityValues = useDependsOnValues(segmentVisibilityDeps, namePrefix)
  const visibleSegments = useMemo(
    () => filterVisibleInlineSentenceSegments(config.segments, segmentVisibilityValues),
    [config.segments, segmentVisibilityValues],
  )

  const uniqueBoundNames = useMemo(
    () => inlineSentenceUniqueBoundNames(config.segments, config.below),
    [config.below, config.segments],
  )

  const controllers = useInlineSentenceControllers(uniqueBoundNames, namePrefix)
  const controllerByName = useMemo(() => {
    const map = new Map<string, (typeof controllers)[number]>()
    for (const [index, name] of uniqueBoundNames.entries()) {
      if (index >= MAX_INLINE_SENTENCE_BOUND_CONTROLLERS) break
      map.set(name, controllers[index]!)
    }
    return map
  }, [controllers, uniqueBoundNames])

  const combinedError = resolveFirstFieldErrorMessage(
    ...controllers.map(({ fieldState }) => fieldState.error?.message),
    error,
  )

  const controls = useMemo(() => {
    const result: InlineSentenceBoundControl[] = []

    for (const segment of visibleSegments) {
      if (!isInlineSentenceBoundSegment(segment)) continue

      const controller = controllerByName.get(segment.name)
      if (!controller) continue

      const { field } = controller
      const controlId = `${id}-${segment.name.replaceAll('.', '-')}`

      if (segment.kind === 'number') {
        const numberControl: InlineSentenceBoundNumber = {
          kind: 'number',
          id: controlId,
          name: segment.name,
          value: typeof field.value === 'number' ? field.value : undefined,
          min: segment.min,
          max: segment.max,
          digits: segment.digits,
          onChange: field.onChange,
          onBlur: field.onBlur,
        }
        result.push(numberControl)
        continue
      }

      const selectLabel = segment.ariaLabel ?? config.label
      const selectControl: InlineSentenceBoundSelect = {
        kind: 'select',
        id: controlId,
        name: segment.name,
        value: typeof field.value === 'string' ? field.value : undefined,
        options: segment.options,
        digits: segment.digits,
        width: segment.width,
        placeholder: resolveSelectPlaceholder(selectLabel, segment.placeholder),
        ariaLabel: selectLabel,
        onChange: field.onChange,
        onBlur: field.onBlur,
      }
      result.push(selectControl)
    }

    return result
  }, [config.label, controllerByName, id, visibleSegments])

  const belowControl = useMemo((): InlineSentenceBoundChips | undefined => {
    if (!config.below) return undefined

    const controller = controllerByName.get(config.below.name)
    if (!controller) return undefined

    const { field } = controller
    const chipsValue = Array.isArray(field.value) ? field.value.map(String) : []

    return {
      kind: 'chips',
      id: `${id}-${config.below.name.replaceAll('.', '-')}`,
      name: config.below.name,
      value: chipsValue,
      options: config.below.options,
      multiple: config.below.multiple,
      max: config.below.max,
      chipSize: config.below.chipSize ?? config.chipSize,
      onChange: field.onChange,
      onBlur: field.onBlur,
    }
  }, [config.below, config.chipSize, controllerByName, id])

  return (
    <InlineSentenceField
      id={id}
      label={config.label}
      segments={visibleSegments}
      controls={controls}
      below={config.below}
      belowControl={belowControl}
      error={combinedError}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={config.size}
      width={config.width}
      hideLabel={config.hideLabel}
      chipSize={config.chipSize}
    />
  )
}
