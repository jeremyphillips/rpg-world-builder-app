import { collectCreatureTraitTemplateIssues } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

/** Rejects unknown creature trait templates before a species or monster write. */
export function rejectInvalidCreatureTraitTemplates(
  traits: unknown,
  prefix: (string | number)[] = [],
): void {
  const issues = collectCreatureTraitTemplateIssues(traits).map((issue) => ({
    ...issue,
    path: [...prefix, ...issue.path],
  }))
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', 'Creature trait template is invalid.', { issues })
}
