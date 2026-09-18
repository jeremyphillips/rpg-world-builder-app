import type { FieldError, UseControllerReturn } from 'react-hook-form'

import type { JoinedPairFieldConfig } from '../../field-config'
import type {
  JoinedPairEndOccupantConfig,
  JoinedPairStartOccupantConfig,
} from '../../../components/ui/joined-pair-field.types'

type BoundControllerField = UseControllerReturn<Record<string, unknown>>['field']
import type { FieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveFirstFieldErrorMessage } from '../../errors/resolve-field-error-message'
import { resolveFieldPlaceholder } from '../../config/field-placeholder.lib'

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
