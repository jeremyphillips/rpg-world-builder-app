/** Severity tier for ordering and header vs field display split. */
export type FormIssueSeverity = 'crossRow' | 'row' | 'field'

/** Flattened validation issue with array item context when applicable. */
export type FormIssue = {
  /** Dot path from form root, e.g. `startingWealth.tiers.1.minLevel`. */
  path: string
  message: string
  severity: FormIssueSeverity
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
}

export const FORM_ISSUE_SEVERITY_ORDER: Record<FormIssueSeverity, number> = {
  crossRow: 0,
  row: 1,
  field: 2,
}
