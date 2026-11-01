import type { FieldHintPosition, FieldLabelPosition } from '../../components/ui/field.variants'
import { resolveFieldHintPresentation, type FieldHintIcon } from '../field-config'

type FieldHintSource = Parameters<typeof resolveFieldHintPresentation>[0] & {
  labelPosition?: FieldLabelPosition
}

/** Row-aware hint resolution — hints always render below the control in anatomy rows. */
export function resolveRowAwareFieldHintPresentation(
  field: FieldHintSource,
  values: Record<string, unknown>,
  inAnatomyRow: boolean,
): { text?: string; position: FieldHintPosition; icon?: FieldHintIcon } {
  const presentation = resolveFieldHintPresentation(field, values)
  if (!inAnatomyRow) return presentation
  if (field.labelPosition === 'settings') return presentation
  return {
    text: presentation.text,
    position: 'below-control',
    ...(presentation.icon ? { icon: presentation.icon } : {}),
  }
}
