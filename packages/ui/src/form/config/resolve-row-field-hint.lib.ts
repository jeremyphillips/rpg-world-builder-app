import type { FieldHintPosition } from '../../components/ui/field.variants'
import { resolveFieldHintPresentation } from '../field-config'

type FieldHintSource = Parameters<typeof resolveFieldHintPresentation>[0]

/** Row-aware hint resolution — hints always render below the control in anatomy rows. */
export function resolveRowAwareFieldHintPresentation(
  field: FieldHintSource,
  values: Record<string, unknown>,
  inAnatomyRow: boolean,
): { text?: string; position: FieldHintPosition } {
  const presentation = resolveFieldHintPresentation(field, values)
  if (!inAnatomyRow) return presentation
  return {
    text: presentation.text,
    position: 'below-control',
  }
}
