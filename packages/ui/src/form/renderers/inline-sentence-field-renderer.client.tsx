'use client'

import { useMemo } from 'react'
import { useController } from 'react-hook-form'

import { InlineSentenceField } from '../../components/ui/inline-sentence-field.client'
import {
  inlineSentenceBoundNames,
  isInlineSentenceBoundSegment,
} from '../../components/ui/inline-sentence-field.lib'
import type {
  InlineSentenceBoundChips,
  InlineSentenceBoundControl,
  InlineSentenceBoundNumber,
  InlineSentenceBoundSelect,
} from '../../components/ui/inline-sentence-field.types'
import { resolveFirstFieldErrorMessage } from '../errors/resolve-field-error-message'
import { resolveSelectPlaceholder } from '../config/field-placeholder.lib'
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

/** RHF adapter for `InlineSentenceField` — one controller per bound segment. */
export function InlineSentenceFieldRenderer({
  config,
  id,
  namePrefix,
  error,
}: InlineSentenceFieldRendererProps) {
  const boundNames = useMemo(
    () => inlineSentenceBoundNames(config.segments, config.below),
    [config.below, config.segments],
  )

  const controller0 = useController({
    name: resolveFullName(namePrefix, boundNames[0] ?? '__inlineSentenceUnused0'),
    disabled: boundNames.length < 1,
  })
  const controller1 = useController({
    name: resolveFullName(namePrefix, boundNames[1] ?? '__inlineSentenceUnused1'),
    disabled: boundNames.length < 2,
  })
  const controller2 = useController({
    name: resolveFullName(namePrefix, boundNames[2] ?? '__inlineSentenceUnused2'),
    disabled: boundNames.length < 3,
  })

  const controllers = useMemo(
    () => [controller0, controller1, controller2],
    [controller0, controller1, controller2],
  )
  const combinedError = resolveFirstFieldErrorMessage(
    ...controllers.map(({ fieldState }) => fieldState.error?.message),
    error,
  )

  const controls = useMemo(() => {
    const result: InlineSentenceBoundControl[] = []
    let boundIndex = 0

    for (const segment of config.segments) {
      if (!isInlineSentenceBoundSegment(segment)) continue

      const controller = controllers[boundIndex]
      boundIndex += 1
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
  }, [config.label, config.segments, controllers, id])

  const belowControl = useMemo((): InlineSentenceBoundChips | undefined => {
    if (!config.below) return undefined

    const belowIndex = boundNames.indexOf(config.below.name)
    const controller = controllers[belowIndex]
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
  }, [boundNames, config.below, config.chipSize, controllers, id])

  return (
    <InlineSentenceField
      id={id}
      label={config.label}
      segments={config.segments}
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
