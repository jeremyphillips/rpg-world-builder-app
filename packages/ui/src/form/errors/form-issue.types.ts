import type { MessageParams } from '@rpg/contracts'

/** Severity tier for ordering and header vs field display split. */
export type FormIssueSeverity = 'crossRow' | 'row' | 'field'

/** Where a validation issue belongs in the form hierarchy. */
export type FormIssueScope = 'form' | 'section' | 'array' | 'item' | 'field'

/** Flattened validation issue with array item context when applicable. */
export type FormIssue = {
  /** Dot path from form root, e.g. `startingWealth.tiers.1.minLevel`. */
  path: string
  /** Full field-context message shown beside the control. */
  message: string
  /** Shorter summary label for collapsed row chrome; falls back to `message`. */
  summaryMessage?: string
  /** Stable message id from a {@link defineMessage} catalog when encoded in the payload. */
  messageId?: string
  /** Interpolation params from a {@link defineMessage} catalog when encoded in the payload. */
  messageParams?: MessageParams
  severity: FormIssueSeverity
  /** Derived placement in the form hierarchy (array item, field, etc.). */
  scope?: FormIssueScope
  /** Array field path when the issue belongs to an array item, e.g. `startingWealth.tiers`. */
  arrayPath?: string
  itemIndex?: number
  /** Prefix through the array item index, e.g. `startingWealth.tiers.1`. */
  itemPrefix?: string
  /** Path relative to the array item root, e.g. `magicItemGrants.1.rarity`. */
  relativePath?: string
}

export type ArrayItemIssueGroup = {
  itemPrefix: string
  arrayPath: string
  itemIndex: number
  totalCount: number
  sortedIssues: FormIssue[]
  /** Cross-row and row-level issues for header display. */
  headerIssues: FormIssue[]
  /** Field-level issues shown at controls when expanded. */
  fieldIssues: FormIssue[]
  /** Joined summary labels for compact invalid row chrome. */
  fieldSummary?: string
}

export const FORM_ISSUE_SEVERITY_ORDER: Record<FormIssueSeverity, number> = {
  crossRow: 0,
  row: 1,
  field: 2,
}
