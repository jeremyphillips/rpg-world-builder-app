import type { ArrayConfig } from '../../field-config'
import type { FormHeading } from '../../form-heading.lib'
import { isNonWhitespaceLabel, resolveFieldLabelVisibility } from '../../form-heading.lib'

export type ArrayLabelMode = 'anonymous' | 'visible' | 'srOnly'

export function resolveArrayHeading(config: ArrayConfig): FormHeading | undefined {
  if (!('heading' in config) || config.heading === undefined) {
    return undefined
  }
  if (!isNonWhitespaceLabel(config.heading.label)) {
    return undefined
  }
  return {
    ...config.heading,
    label: config.heading.label.trim(),
  }
}

export function resolveArrayLabelMode(config: ArrayConfig): ArrayLabelMode {
  const resolved = resolveArrayHeading(config)
  if (!resolved) return 'anonymous'
  return resolveFieldLabelVisibility(resolved) === 'srOnly' ? 'srOnly' : 'visible'
}

export function hasNamedArrayHeading(config: ArrayConfig): boolean {
  return resolveArrayHeading(config) !== undefined
}

export function resolveArraySectionLabelForDisplay(config: ArrayConfig): string {
  return resolveArrayHeading(config)?.label ?? config.name
}
