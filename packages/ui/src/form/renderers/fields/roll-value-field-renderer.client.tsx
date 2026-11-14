'use client'

import { useMemo } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import { DIE_FACES } from '@rpg/contracts/primitives'

import { RollValueField } from '../../../components/ui/roll-value-field.client'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { RollValueFieldPatchResult } from '../../../components/ui/roll-value-field.lib'
import { resolveFirstFieldErrorMessage } from '../../errors/resolve-field-error-message'
import type { RollValueFieldConfig } from '../../field-config'
import { resolveFieldLabelVisibility } from '../../form-heading.lib'
import { useFieldControlSize } from '../../context/form-section.context'
import { useFieldIssue } from '../../hooks/use-field-issue.client'

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

const ROLL_VALUE_SET_OPTIONS = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const

function isFlatOperator(value: unknown): value is '+' | '-' {
  return value === '+' || value === '-'
}

function rollRecordHasStoredAtom(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const roll = value as {
    dice?: { count?: unknown; faces?: unknown }
    flatOperator?: unknown
    flatAmount?: unknown
  }
  return (
    typeof roll.dice?.count === 'number' ||
    typeof roll.dice?.faces === 'number' ||
    isFlatOperator(roll.flatOperator) ||
    typeof roll.flatAmount === 'number'
  )
}

function applyPatchToForm(
  patch: RollValueFieldPatchResult,
  write: (name: string, value: unknown) => void,
  names: { count: string; faces: string; operator: string; amount: string },
) {
  if (patch.clearFlat) {
    write(names.operator, undefined)
    write(names.amount, undefined)
  }
  if (patch.diceCount !== undefined) write(names.count, patch.diceCount)
  if (patch.diceFaces !== undefined) write(names.faces, patch.diceFaces)
  if (patch.flatOperator !== undefined) write(names.operator, patch.flatOperator)
  if (patch.flatAmount !== undefined) write(names.amount, patch.flatAmount)
}

/**
 * Shows Add dice without registering controllers.
 * Registering an empty roll under `shouldUnregister` creates an undefined shell.
 */
function UnstoredRollValueField({
  config,
  fullName,
  id,
  error,
  hint,
  hintPosition,
}: RollValueFieldRendererProps) {
  const controlSize = useFieldControlSize(config.controlSizeOverride)
  const { setValue } = useFormContext()
  const routed = useFieldIssue(fullName, { rhfMessage: error })
  const names = {
    count: subPath(fullName, 'dice.count'),
    faces: subPath(fullName, 'dice.faces'),
    operator: subPath(fullName, 'flatOperator'),
    amount: subPath(fullName, 'flatAmount'),
  }
  const write = (name: string, value: unknown) => {
    setValue(name, value, ROLL_VALUE_SET_OPTIONS)
  }

  return (
    <RollValueField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      labelVisibility={resolveFieldLabelVisibility(config)}
      parts={{}}
      error={routed.message ?? error}
      hint={hint}
      hintPosition={hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={controlSize}
      width={config.width}
      faces={config.faces ?? DIE_FACES}
      countMin={config.countMin}
      countMax={config.countMax}
      modifierMin={config.modifierMin}
      modifierMax={config.modifierMax}
      defaults={{ count: config.defaultCount, faces: config.defaultFaces }}
      onPartsChange={(patch) => applyPatchToForm(patch, write, names)}
    />
  )
}

/** Binds stored roll atoms (`dice.*`, `flatOperator`, `flatAmount`) to one control. */
function StoredRollValueField({
  config,
  fullName,
  id,
  error,
  hint,
  hintPosition,
}: RollValueFieldRendererProps) {
  const controlSize = useFieldControlSize(config.controlSizeOverride)
  const { setValue } = useFormContext()
  const countName = subPath(fullName, 'dice.count')
  const facesName = subPath(fullName, 'dice.faces')
  const operatorName = subPath(fullName, 'flatOperator')
  const amountName = subPath(fullName, 'flatAmount')
  const watchedCount = useWatch({ name: countName })
  const watchedFaces = useWatch({ name: facesName })
  const watchedOperator = useWatch({ name: operatorName })
  const watchedAmount = useWatch({ name: amountName })
  const diceCount = useController({ name: countName })
  const diceFaces = useController({ name: facesName })
  const flatOperator = useController({ name: operatorName })
  const flatAmount = useController({ name: amountName })
  const names = {
    count: countName,
    faces: facesName,
    operator: operatorName,
    amount: amountName,
  }

  const parts = useMemo(
    () => ({
      diceCount: typeof watchedCount === 'number' ? watchedCount : undefined,
      diceFaces: typeof watchedFaces === 'number' ? watchedFaces : undefined,
      flatOperator: isFlatOperator(watchedOperator) ? watchedOperator : undefined,
      flatAmount: typeof watchedAmount === 'number' ? watchedAmount : undefined,
    }),
    [watchedAmount, watchedCount, watchedFaces, watchedOperator],
  )

  const write = (name: string, value: unknown) => {
    setValue(name, value, ROLL_VALUE_SET_OPTIONS)
  }

  const rhfError = resolveFirstFieldErrorMessage(
    diceCount.fieldState.error?.message,
    diceFaces.fieldState.error?.message,
    flatOperator.fieldState.error?.message,
    flatAmount.fieldState.error?.message,
    error,
  )
  const routed = useFieldIssue(fullName, { rhfMessage: rhfError })
  const combinedError = routed.message ?? rhfError

  const handleBlur = () => {
    diceCount.field.onBlur()
    diceFaces.field.onBlur()
    flatOperator.field.onBlur()
    flatAmount.field.onBlur()
  }

  return (
    <RollValueField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      labelVisibility={resolveFieldLabelVisibility(config)}
      parts={parts}
      error={combinedError}
      hint={hint}
      hintPosition={hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={controlSize}
      width={config.width}
      faces={config.faces ?? DIE_FACES}
      countMin={config.countMin}
      countMax={config.countMax}
      modifierMin={config.modifierMin}
      modifierMax={config.modifierMax}
      defaults={{ count: config.defaultCount, faces: config.defaultFaces }}
      onBlur={handleBlur}
      onPartsChange={(patch) => applyPatchToForm(patch, write, names)}
    />
  )
}

/** Renders a roll from stored atoms. Optional rolls stay unregistered until Add dice. */
export function RollValueFieldRenderer(props: RollValueFieldRendererProps) {
  const watched = useWatch({ name: props.fullName })
  if (props.config.required) return <StoredRollValueField {...props} />
  if (!rollRecordHasStoredAtom(watched)) return <UnstoredRollValueField {...props} />
  return <StoredRollValueField {...props} />
}
