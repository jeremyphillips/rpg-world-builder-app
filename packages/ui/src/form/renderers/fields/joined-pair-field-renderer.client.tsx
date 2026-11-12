'use client'

import { useMemo } from 'react'
import { useController } from 'react-hook-form'

import { JoinedPairFieldForm } from '../../../components/ui/joined-pair-field-form.client'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import type { JoinedPairFieldConfig } from '../../field-config'
import { useFieldRowParticipation } from '../../../components/ui/field-row-anatomy.context'
import { useFieldControlSize } from '../../context/form-section.context'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveRowAwareFieldHintPresentation } from '../../config/resolve-row-field-hint.lib'
import { resolveFieldLabelVisibility } from '../../form-heading.lib'
import {
  amountAfterJoinedPairUnitChange,
  buildJoinedPairControls,
  resolveJoinedPairBoundPaths,
  resolveJoinedPairCombinedError,
  resolveJoinedPairControlIds,
  resolveJoinedPairStartOccupant,
} from './joined-pair-field-renderer.lib'

export interface JoinedPairFieldRendererProps {
  config: JoinedPairFieldConfig
  id: string
  namePrefix?: string
}

/** RHF adapter for standalone `joinedPair` fields — one controller per bound occupant. */
export function JoinedPairFieldRenderer({ config, id, namePrefix }: JoinedPairFieldRendererProps) {
  const inAnatomyRow = useFieldRowParticipation()
  const controlSize = useFieldControlSize(config.controlSizeOverride)
  const { startPath, endPath } = resolveJoinedPairBoundPaths(config, namePrefix)
  const ids = resolveJoinedPairControlIds(id, config)

  const startController = useController({ name: startPath })
  const endDefaultValue =
    endPath !== undefined && config.end.kind === 'select' ? config.end.defaultValue : undefined
  const endController = useController({
    name: endPath ?? '__joinedPairUnusedEnd',
    disabled: endPath === undefined,
    ...(endDefaultValue !== undefined ? { defaultValue: endDefaultValue } : {}),
  })
  const unitValue = endPath !== undefined ? endController.field.value : undefined
  const startOptionsDependsOn =
    config.start.kind === 'select' ? (config.start.optionsResolve?.dependsOn ?? []) : []
  const optionValues = useDependsOnValues(startOptionsDependsOn, namePrefix)
  const startOccupant = useMemo(
    () => resolveJoinedPairStartOccupant(config, optionValues, unitValue, endDefaultValue),
    [config, endDefaultValue, optionValues, unitValue],
  )
  const endField = {
    ...endController.field,
    onChange: (next: unknown) => {
      if (config.clearAmountWhenUnitChanges) {
        const nextAmount = amountAfterJoinedPairUnitChange(
          startController.field.value,
          endController.field.value,
          next,
        )
        if (nextAmount !== startController.field.value) {
          startController.field.onChange(nextAmount)
        }
      }
      endController.field.onChange(next)
    },
  }

  const combinedError = resolveJoinedPairCombinedError(
    startController.fieldState.error,
    endController.fieldState.error,
    endPath,
  )
  const validation = useFieldErrorPresentation(combinedError, startPath)
  const hintPresentation = resolveRowAwareFieldHintPresentation(config, {}, inAnatomyRow)
  const labelVisibility = resolveFieldLabelVisibility(config)
  const controls = buildJoinedPairControls(
    { ...config, start: startOccupant },
    ids,
    startController.field,
    endField,
    startController.fieldState.error,
    endController.fieldState.error,
    endPath,
    validation,
  )

  return (
    <JoinedPairFieldForm
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      labelVisibility={labelVisibility}
      error={validation.error}
      hint={hintPresentation.text}
      hintPosition={hintPresentation.position}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={controlSize}
      width={config.width}
      start={controls.start}
      end={controls.end}
      startOccupant={config.start}
      endOccupant={config.end}
    />
  )
}
