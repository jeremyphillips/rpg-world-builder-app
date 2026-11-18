import { resolveFieldDescribedBy } from '../../../components/ui/field-validation-props'
import { normalizeFieldHint, type FieldHintConfig } from '../../field-config'

/** Fieldset description ids for an array section hint and container error. */
export function resolveArrayFieldsetDescribedBy(options: {
  hasContainerIssue: boolean
  hint?: string | FieldHintConfig
  errorId: string
  hintId: string
}): string | undefined {
  const normalized = normalizeFieldHint(options.hint)
  return resolveFieldDescribedBy(
    undefined,
    options.hasContainerIssue || undefined,
    normalized.text,
    undefined,
    options.errorId,
    options.hintId,
    normalized.position,
  )
}
