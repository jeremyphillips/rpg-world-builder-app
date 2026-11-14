import { hasActiveFieldChrome, type FieldChrome } from '../../components/ui/field-chrome.variants'
import { normalizeFieldHint } from '../field-config'
import type { FormHeading } from '../form-heading.lib'

export function resolveGroupSectionDescription(
  heading: FormHeading | undefined,
): string | undefined {
  const hint = heading?.hint
  if (!hint) return undefined
  return typeof hint === 'string' ? hint : normalizeFieldHint(hint).text
}

export function resolveGroupSectionFieldChromeSuppressed(
  groupFieldChrome: FieldChrome | undefined,
  parentSuppressed: boolean | undefined,
): boolean | undefined {
  return hasActiveFieldChrome(groupFieldChrome) || parentSuppressed || undefined
}
