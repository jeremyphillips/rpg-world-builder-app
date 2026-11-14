import type { FieldError, UseControllerReturn } from 'react-hook-form'

import type { JoinedPairFieldConfig } from '../../field-config'
import type {
  JoinedPairEndOccupantConfig,
  JoinedPairSelectOccupantConfig,
  JoinedPairStartOccupantConfig,
} from '../../../components/ui/joined-pair-field.types'

type BoundControllerField = UseControllerReturn<Record<string, unknown>>['field']
import type { FieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveFirstFieldErrorMessage } from '../../errors/resolve-field-error-message'
import { resolveFieldPlaceholder } from '../../config/field-placeholder.lib'

/** Drops the amount when the unit changes so 120 ft does not become 120 miles. */
export function amountAfterJoinedPairUnitChange(
  amount: unknown,
  previousUnit: unknown,
  nextUnit: unknown,
): unknown {
  if (nextUnit === previousUnit) return amount
  return undefined
}

function resolveSelectControlValue(value: unknown): string | number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return value as string | number
}

function buildStartControl(
  config: JoinedPairStartOccupantConfig,
  startId: string,
  field: BoundControllerField,
  hasOccupantError: boolean,
  validation: FieldErrorPresentation,
) {
  const shared = {
    id: startId,
    hasError: hasOccupantError || Boolean(validation.error),
    describedBy: validation.describedBy,
    onChange: field.onChange,
    onBlur: field.onBlur,
  }

  if (config.kind === 'number') {
    return {
      kind: 'number' as const,
      ...shared,
      value: typeof field.value === 'number' ? field.value : undefined,
      min: config.min,
      max: config.max,
      digits: config.digits,
      ariaLabel: config.ariaLabel,
    }
  }

  return {
    kind: 'select' as const,
    ...shared,
    value: resolveSelectControlValue(field.value),
    options: config.options,
    digits: config.digits,
    sizingLabel: config.sizingLabel,
    sizingLabels: config.sizingLabels,
    placeholder: resolveFieldPlaceholder(
      { label: config.ariaLabel, category: 'choice', digits: config.digits },
      config.placeholder,
    ),
    ariaLabel: config.ariaLabel,
    allowCustom: config.allowCustom,
    clearable: config.clearable,
    customMin: config.customMin,
    customMax: config.customMax,
  }
}

function buildEndControl(
  config: JoinedPairEndOccupantConfig,
  endId: string,
  field: BoundControllerField,
  hasOccupantError: boolean,
  validation: FieldErrorPresentation,
) {
  if (config.kind === 'label') {
    return {
      kind: 'label' as const,
      text: config.text,
      ariaLabel: config.ariaLabel,
    }
  }

  return {
    kind: 'select' as const,
    id: endId,
    value: resolveSelectControlValue(field.value),
    options: config.options,
    digits: config.digits,
    sizingLabel: config.sizingLabel,
    sizingLabels: config.sizingLabels,
    placeholder: resolveFieldPlaceholder(
      { label: config.ariaLabel, category: 'choice', digits: config.digits },
      config.placeholder,
    ),
    ariaLabel: config.ariaLabel,
    hasError: hasOccupantError || Boolean(validation.error),
    describedBy: validation.describedBy,
    onChange: field.onChange,
    onBlur: field.onBlur,
  }
}

function resolveJoinedPairSelectOccupantOptions(
  occupant: JoinedPairSelectOccupantConfig,
  optionValues: Record<string, unknown>,
  unitValue: unknown,
  presetsByUnit: JoinedPairFieldConfig['presetsByUnit'],
  endDefaultValue: string | number | undefined,
): JoinedPairSelectOccupantConfig {
  let options = occupant.options
  if (occupant.optionsResolve) {
    options = [...occupant.optionsResolve.optionsWhen(optionValues)]
  } else if (presetsByUnit) {
    options = presetsByUnit[String(unitValue ?? endDefaultValue ?? '')] ?? occupant.options
  }
  return { ...occupant, options }
}

/** Resolves dynamic options on the start select occupant without mutating config. */
export function resolveJoinedPairStartOccupant(
  config: JoinedPairFieldConfig,
  optionValues: Record<string, unknown>,
  unitValue: unknown,
  endDefaultValue: string | number | undefined,
): JoinedPairStartOccupantConfig {
  if (config.start.kind !== 'select') return config.start
  return resolveJoinedPairSelectOccupantOptions(
    config.start,
    optionValues,
    unitValue,
    config.presetsByUnit,
    endDefaultValue,
  )
}

export function resolveJoinedPairBoundPaths(
  config: JoinedPairFieldConfig,
  namePrefix: string | undefined,
): { startPath: string; endPath: string | undefined } {
  const join = (name: string) => (namePrefix ? `${namePrefix}.${name}` : name)
  return {
    startPath: join(config.start.name),
    endPath: config.end.kind === 'select' ? join(config.end.name) : undefined,
  }
}

export function resolveJoinedPairControlIds(
  id: string,
  config: JoinedPairFieldConfig,
): { startId: string; endId: string } {
  return {
    startId: `${id}-${config.start.name.replaceAll('.', '-')}`,
    endId:
      config.end.kind === 'select'
        ? `${id}-${config.end.name.replaceAll('.', '-')}`
        : `${id}-label`,
  }
}

export function resolveJoinedPairCombinedError(
  startError: FieldError | undefined,
  endError: FieldError | undefined,
  endPath: string | undefined,
): string | undefined {
  return resolveFirstFieldErrorMessage(startError?.message, endPath ? endError?.message : undefined)
}

export function buildJoinedPairControls(
  config: JoinedPairFieldConfig,
  ids: { startId: string; endId: string },
  startField: BoundControllerField,
  endField: BoundControllerField,
  startError: FieldError | undefined,
  endError: FieldError | undefined,
  endPath: string | undefined,
  validation: FieldErrorPresentation,
) {
  return {
    start: buildStartControl(
      config.start,
      ids.startId,
      startField,
      Boolean(startError?.message),
      validation,
    ),
    end: buildEndControl(
      config.end,
      ids.endId,
      endField,
      endPath ? Boolean(endError?.message) : false,
      validation,
    ),
  }
}
