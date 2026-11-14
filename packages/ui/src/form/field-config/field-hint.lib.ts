import type { FieldHintPosition } from '../../components/ui/field.variants'

import type { BaseFieldConfig, FieldHintConfig, FieldHintIcon } from './field-base.types'
import type { FieldDynamicHint } from './field-dynamic.types'

/** Normalizes static and dynamic hint configuration. */
export function normalizeFieldHint(hint: string | FieldHintConfig | undefined): {
  text?: string
  position: FieldHintPosition
  icon?: FieldHintIcon
  resolve?: FieldDynamicHint
} {
  if (hint === undefined) {
    return { position: 'below-label' }
  }
  if (typeof hint === 'string') {
    return { text: hint, position: 'below-label' }
  }
  return {
    text: hint.text,
    position: hint.position ?? 'below-label',
    icon: hint.icon,
    resolve: hint.resolve,
  }
}

/** Resolves static and dynamic hint text for a field config. */
export function resolveFieldHint(
  field: Pick<BaseFieldConfig, 'hint'>,
  values: Record<string, unknown>,
): string | undefined {
  const normalized = normalizeFieldHint(field.hint)
  return normalized.resolve?.hintWhen(values) ?? normalized.text
}

/** Resolves helper text placement for a field config. */
export function resolveFieldHintPosition(field: Pick<BaseFieldConfig, 'hint'>): FieldHintPosition {
  return normalizeFieldHint(field.hint).position
}

/** Resolves rendered hint text and placement for a field config. */
export function resolveFieldHintPresentation(
  field: Pick<BaseFieldConfig, 'hint'>,
  values: Record<string, unknown>,
): { text?: string; position: FieldHintPosition; icon?: FieldHintIcon } {
  const normalized = normalizeFieldHint(field.hint)
  const text = normalized.resolve?.hintWhen(values) ?? normalized.text
  return {
    text,
    position: normalized.position,
    ...(text && normalized.icon ? { icon: normalized.icon } : {}),
  }
}
