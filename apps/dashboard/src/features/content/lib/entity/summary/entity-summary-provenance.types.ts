/**
 * Where an entity's owned quantity came from, and the inline actions that give it
 * back. Provenance is its own slot: it is never a status item, carries no
 * `SelectionSignalCategory`, and does not pass through the selection-row pipeline.
 */
export type EntitySummaryProvenanceText = {
  kind: 'text'
  label: string
}

/** Inline release/remove affordance attached to the segment it acts on. */
export type EntitySummaryProvenanceAction = {
  kind: 'action'
  key: string
  label: string
  ariaLabel: string
  onAction: () => void
  disabled?: boolean
}

export type EntitySummaryProvenanceItem =
  | EntitySummaryProvenanceText
  | EntitySummaryProvenanceAction
