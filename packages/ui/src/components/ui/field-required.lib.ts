import type React from 'react'

import type { FieldLabelVisibility } from '../../form/form-heading.lib'

const NATIVE_REQUIRED_ELEMENT_TYPES = new Set(['input', 'select', 'textarea'])

/** Components that forward the native `required` attribute to an underlying input. */
const NATIVE_REQUIRED_FORWARDER_DISPLAY_NAMES = new Set(['Input', 'NumberInput'])

export function shouldShowVisibleRequiredMarker(
  required: boolean | undefined,
  labelVisibility: FieldLabelVisibility = 'visible',
): boolean {
  return Boolean(required) && labelVisibility !== 'srOnly'
}

function getComponentDisplayName(type: unknown): string | undefined {
  if (typeof type !== 'function' && typeof type !== 'object') return undefined
  if (type === null) return undefined
  return (type as { displayName?: string }).displayName
}

function usesNativeRequiredAttribute(child: React.ReactElement<Record<string, unknown>>): boolean {
  if (typeof child.type === 'string') {
    return NATIVE_REQUIRED_ELEMENT_TYPES.has(child.type)
  }

  const displayName = getComponentDisplayName(child.type)
  return displayName ? NATIVE_REQUIRED_FORWARDER_DISPLAY_NAMES.has(displayName) : false
}

/** Picks native `required` or `aria-required` for the control — not both. */
export function resolveControlRequiredProps(
  child: React.ReactElement<Record<string, unknown>>,
  required: boolean,
): Record<string, unknown> {
  if (!required) return {}

  if (child.props.required !== undefined || child.props['aria-required'] !== undefined) {
    return {}
  }

  if (usesNativeRequiredAttribute(child)) {
    return { required: true }
  }

  return { 'aria-required': true as const }
}
