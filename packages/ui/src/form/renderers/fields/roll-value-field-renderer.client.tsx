'use client'

import { useMemo } from 'react'
import { useController } from 'react-hook-form'

import { DIE_FACES } from '@rpg/contracts/primitives'

import { RollValueField } from '../../../components/ui/roll-value-field.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { RollValueFieldPatchResult } from '../../../components/ui/roll-value-field.lib'
import { resolveFirstFieldErrorMessage } from '../../errors/resolve-field-error-message'
import type { RollValueFieldConfig } from '../../field-config'

export interface RollValueFieldRendererProps {
  config: RollValueFieldConfig
  fullName: string
  id: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
}

function subPath(fullName: string, suffix: string): string {
  return `${fullName}.${suffix}`
}

function applyRollValuePatchToControllers(
  patch: RollValueFieldPatchResult,
  controllers: {
    diceCount: ReturnType<typeof useController>
    diceFaces: ReturnType<typeof useController>
    flatOperator: ReturnType<typeof useController>
    flatAmount: ReturnType<typeof useController>
  },
): void {
  if (patch.clearFlat) {
    controllers.flatOperator.field.onChange(undefined)
    controllers.flatAmount.field.onChange(undefined)
  }

  if (patch.diceCount !== undefined) {
    controllers.diceCount.field.onChange(patch.diceCount)
  }

  if (patch.diceFaces !== undefined) {
    controllers.diceFaces.field.onChange(patch.diceFaces)
  }

  if (patch.flatOperator !== undefined) {
    controllers.flatOperator.field.onChange(patch.flatOperator)
  }

  if (patch.flatAmount !== undefined) {
    controllers.flatAmount.field.onChange(patch.flatAmount)
  }
}

/** Binds RollValue form atoms (`dice.*`, `flatOperator`, `flatAmount`) to one control. */
export function RollValueFieldRenderer({
  config,
  fullName,
  id,
  error,
  hint,
  hintPosition,
}: RollValueFieldRendererProps) {
  const diceCount = useController({ name: subPath(fullName, 'dice.count') })
  const diceFaces = useController({ name: subPath(fullName, 'dice.faces') })
  const flatOperator = useController({ name: subPath(fullName, 'flatOperator') })
  const flatAmount = useController({ name: subPath(fullName, 'flatAmount') })

  const parts = useMemo(
    () => ({
      diceCount: typeof diceCount.field.value === 'number' ? diceCount.field.value : undefined,
      diceFaces: typeof diceFaces.field.value === 'number' ? diceFaces.field.value : undefined,
      flatOperator:
        flatOperator.field.value === '+' || flatOperator.field.value === '-'
          ? flatOperator.field.value
          : undefined,
      flatAmount: typeof flatAmount.field.value === 'number' ? flatAmount.field.value : undefined,
    }),
    [
      diceCount.field.value,
      diceFaces.field.value,
      flatAmount.field.value,
      flatOperator.field.value,
    ],
  )

  const combinedError = resolveFirstFieldErrorMessage(
    diceCount.fieldState.error?.message,
    diceFaces.fieldState.error?.message,
    flatOperator.fieldState.error?.message,
    flatAmount.fieldState.error?.message,
    error,
  )

  const handleBlur = () => {
    diceCount.field.onBlur()
    diceFaces.field.onBlur()
    flatOperator.field.onBlur()
    flatAmount.field.onBlur()
  }

  return (
    <RollValueField
      id={id}
      label={config.label}
      parts={parts}
      error={combinedError}
      hint={hint}
      hintPosition={hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={config.size}
      width={config.width}
      faces={config.faces ?? DIE_FACES}
      countMin={config.countMin}
      countMax={config.countMax}
      modifierMin={config.modifierMin}
      modifierMax={config.modifierMax}
      defaults={{ count: config.defaultCount, faces: config.defaultFaces }}
      onBlur={handleBlur}
      onPartsChange={(patch) => {
        applyRollValuePatchToControllers(patch, {
          diceCount,
          diceFaces,
          flatOperator,
          flatAmount,
        })
      }}
    />
  )
}
