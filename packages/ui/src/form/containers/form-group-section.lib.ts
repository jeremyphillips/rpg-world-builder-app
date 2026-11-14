import { hasActiveFieldChrome, type FieldChrome } from '../../components/ui/field-chrome.variants'
import { normalizeFieldHint, resolveFieldHintPresentation } from '../field-config'
import type { FormHeading } from '../form-heading.lib'

export function resolveGroupHeadingHintDependsOn(
  heading: FormHeading | undefined,
): readonly string[] {
  const hint = heading?.hint
  if (!hint || typeof hint === 'string') return []
  return normalizeFieldHint(hint).resolve?.dependsOn ?? []
}

export function resolveGroupSectionDescription(
  heading: FormHeading | undefined,
  values: Record<string, unknown> = {},
): string | undefined {
  if (!heading?.hint) return undefined
  return resolveFieldHintPresentation({ hint: heading.hint }, values).text
}

export function resolveGroupSectionFieldChromeSuppressed(
  groupFieldChrome: FieldChrome | undefined,
  parentSuppressed: boolean | undefined,
): boolean | undefined {
  return hasActiveFieldChrome(groupFieldChrome) || parentSuppressed || undefined
}
