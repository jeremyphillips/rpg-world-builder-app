/** Ordered modeling status ladder — lower rungs may be derived; explicit promotion from `meaningful-partial`. */
export const MODELING_STATUS_LADDER = [
  'prose-only',
  'non-meaningful-partial',
  'meaningful-partial',
  'sufficient-for-display',
  'sufficient-for-character-sheet',
  'mechanics-ready',
] as const

export type ModelingStatus = (typeof MODELING_STATUS_LADDER)[number]

export type DerivedModelingStatus = Extract<ModelingStatus, 'prose-only' | 'non-meaningful-partial'>

/** Statuses that may be persisted after human review. */
export const EXPLICIT_MODELING_STATUSES = [
  'meaningful-partial',
  'sufficient-for-display',
  'sufficient-for-character-sheet',
  'mechanics-ready',
] as const

export type ExplicitModelingStatus = (typeof EXPLICIT_MODELING_STATUSES)[number]

/** Thresholds for structured product consumers — excludes `meaningful-partial` (authoring only). */
export const CONSUMER_MODELING_THRESHOLDS = [
  'sufficient-for-display',
  'sufficient-for-character-sheet',
  'mechanics-ready',
] as const

export type ConsumerModelingThreshold = (typeof CONSUMER_MODELING_THRESHOLDS)[number]

export const MODELING_STATUS_LABELS: Record<ModelingStatus, string> = {
  'prose-only': 'Prose only',
  'non-meaningful-partial': 'Non-meaningful partial',
  'meaningful-partial': 'Meaningful partial',
  'sufficient-for-display': 'Sufficient for display',
  'sufficient-for-character-sheet': 'Sufficient for character sheet',
  'mechanics-ready': 'Mechanics ready',
}

export function getModelingStatusLabel(status: ModelingStatus): string {
  return MODELING_STATUS_LABELS[status]
}

function modelingStatusRank(status: ModelingStatus): number {
  return MODELING_STATUS_LADDER.indexOf(status)
}

export function meetsModelingThreshold(status: ModelingStatus, min: ModelingStatus): boolean {
  return modelingStatusRank(status) >= modelingStatusRank(min)
}

/** Authoring editor gate — not used by detail VM or character sheet. */
export function isEditorEligible(status: ModelingStatus): boolean {
  return meetsModelingThreshold(status, 'meaningful-partial')
}

export function meetsConsumerThreshold(
  status: ModelingStatus,
  min: ConsumerModelingThreshold,
): boolean {
  return meetsModelingThreshold(status, min)
}

export function isExplicitModelingStatus(status: string): status is ExplicitModelingStatus {
  return (EXPLICIT_MODELING_STATUSES as readonly string[]).includes(status)
}

export function isDerivedModelingStatus(status: ModelingStatus): status is DerivedModelingStatus {
  return status === 'prose-only' || status === 'non-meaningful-partial'
}
