export type MasterDetailInlineTitle = {
  field: 'name' | 'nameOverride'
  /** Heading shown when the stored value is empty. Never written to the form. */
  fallback: string
  /** Empty-input hint. Never written to the form. */
  placeholder: string
  mode: 'authored' | 'override'
  /** Open the editor once for a row that was just created. */
  initialEdit?: boolean
  /** Overflow label while an override is stored. */
  resetLabel?: string
}
