import type { ArrayItemIssueProminence } from '../renderers/array/array-item-issue.variants'
import type { FormIssueScope } from './form-issue.types'

export type IssueVisibility = 'visible' | 'collapsed' | 'hidden'

/** Maps issue scope + row visibility to array item badge prominence. */
export function resolveIssueProminence(
  scope: FormIssueScope,
  visibility: IssueVisibility,
): ArrayItemIssueProminence {
  if (scope === 'field' && visibility === 'visible') return 'action'
  if (scope === 'item' && visibility === 'collapsed') return 'nav'
  if (scope === 'item' && visibility === 'visible') return 'aggregate'
  return 'structural'
}
