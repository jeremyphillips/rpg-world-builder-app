import type { ArrayConfig } from '../../field-config'
import type { FieldHintConfig } from '../../field-config'
import {
  isNonWhitespaceLabel,
  resolveFieldLabelVisibility,
  type FieldLabelVisibility,
} from '../../form-heading.lib'

export type ArrayLabelMode = 'anonymous' | 'visible' | 'srOnly'

export type ResolvedArrayLabel = {
  label: string
  hint?: string | FieldHintConfig
  labelVisibility: FieldLabelVisibility
}

export function resolveArrayLabel(config: ArrayConfig): ResolvedArrayLabel | undefined {
  if (!('label' in config) || config.label === undefined) {
    return undefined
  }
  if (!isNonWhitespaceLabel(config.label)) {
    return undefined
  }
  return {
    label: config.label.trim(),
    hint: 'hint' in config ? config.hint : undefined,
    labelVisibility: resolveFieldLabelVisibility(config),
  }
}

export function resolveArrayLabelMode(config: ArrayConfig): ArrayLabelMode {
  const resolved = resolveArrayLabel(config)
  if (!resolved) return 'anonymous'
  return resolved.labelVisibility === 'srOnly' ? 'srOnly' : 'visible'
}

export function hasNamedArrayLabel(config: ArrayConfig): boolean {
  return resolveArrayLabel(config) !== undefined
}

export function resolveArraySectionLabelForDisplay(config: ArrayConfig): string {
  return resolveArrayLabel(config)?.label ?? config.name
}
