export type ActionDescriptor = {
  nounSingular: string
  nounPlural: string
  actionKind: 'availability-off' | 'availability' | 'disable' | 'roster-status'
}

export type ActionBlockedMode = 'single' | 'bulk-all' | 'bulk-partial'

export type ActionBlockedTitleInput = {
  mode: ActionBlockedMode
  action: ActionDescriptor
}

export type ActionBlockedDescriptionInput = {
  mode: ActionBlockedMode
  action?: ActionDescriptor
  blockedCount: number
  selectedCount: number
  noun: string
  referenceNoun?: string
  /** Active references blocking a single target — defaults to blockedCount. */
  referenceCount?: number
  /** Named target for single blocked copy — e.g. content or entry title. */
  targetName?: string
}

export type ActionBulkSummaryInput = {
  eligible: number
  blocked: number
  unchanged: number
  failed: number
  updated: number
  noun: string
}

const ACTION_BLOCKED_TITLE_BY_KIND: Record<ActionDescriptor['actionKind'], string> = {
  'availability-off': 'Cannot turn off availability',
  availability: 'Some items could not be updated',
  disable: 'Cannot disable vocabulary entry',
  'roster-status': 'Some characters could not be updated',
}

const ACTION_BLOCKED_BULK_ALL_TITLE_BY_KIND: Record<ActionDescriptor['actionKind'], string> = {
  'availability-off': 'Cannot turn off availability',
  availability: 'Cannot update campaign availability',
  disable: 'Cannot disable selected entries',
  'roster-status': 'Cannot update roster status',
}

const ACTION_BLOCKED_BULK_PARTIAL_TITLE_BY_KIND: Record<ActionDescriptor['actionKind'], string> = {
  'availability-off': 'Some items could not be made unavailable',
  availability: 'Some items could not be updated',
  disable: 'Some entries could not be disabled',
  'roster-status': 'Some characters could not be updated',
}

export function formatActionBlockedTitle({ mode, action }: ActionBlockedTitleInput): string {
  if (mode === 'single') {
    return ACTION_BLOCKED_TITLE_BY_KIND[action.actionKind]
  }

  if (mode === 'bulk-all') {
    return ACTION_BLOCKED_BULK_ALL_TITLE_BY_KIND[action.actionKind]
  }

  return ACTION_BLOCKED_BULK_PARTIAL_TITLE_BY_KIND[action.actionKind]
}

export function formatActionBlockedDescription({
  mode,
  action,
  blockedCount,
  selectedCount,
  noun,
  referenceNoun = 'character',
  referenceCount = blockedCount,
  targetName,
}: ActionBlockedDescriptionInput): string {
  if (mode === 'single') {
    return formatActionBlockedSingleDescription({
      action,
      referenceCount,
      referenceNoun,
      targetName,
    })
  }

  const referenceLabel = blockedCount === 1 ? referenceNoun : `${referenceNoun}s`

  if (blockedCount === selectedCount) {
    return `All ${selectedCount} selected ${noun} are blocked by active ${referenceLabel}. Remove the references before continuing.`
  }

  return `${blockedCount} of ${selectedCount} selected ${noun} are blocked by active ${referenceLabel}. Uncheck blocked items or remove the references before continuing.`
}

function formatActionBlockedSingleDescription({
  action,
  referenceCount,
  referenceNoun,
  targetName,
}: {
  action?: ActionDescriptor
  referenceCount: number
  referenceNoun: string
  targetName?: string
}): string {
  const referenceLabel = referenceCount === 1 ? referenceNoun : `${referenceNoun}s`
  const subject = resolveSingleBlockedSubject(action, targetName)

  if (action?.actionKind === 'availability-off') {
    return `This ${subject} is currently used by ${referenceCount} active ${referenceLabel}. Remove the references before making it unavailable.`
  }

  if (action?.actionKind === 'disable') {
    return `This ${subject} is currently used by ${referenceCount} active ${referenceLabel}. Remove the references before disabling.`
  }

  return `This ${subject} is currently used by ${referenceCount} active ${referenceLabel}. Remove the references before continuing.`
}

const GENERIC_BLOCKED_TARGET_PLACEHOLDERS = new Set(['this item', 'this entry', 'this content'])

function isGenericBlockedTargetPlaceholder(targetName: string): boolean {
  return GENERIC_BLOCKED_TARGET_PLACEHOLDERS.has(targetName.trim().toLowerCase())
}

function resolveSingleBlockedSubject(action?: ActionDescriptor, targetName?: string): string {
  const trimmed = targetName?.trim()
  if (trimmed && !isGenericBlockedTargetPlaceholder(trimmed)) {
    return trimmed
  }

  if (action?.actionKind === 'availability-off') {
    return 'content'
  }

  if (action?.actionKind === 'disable') {
    return 'entry'
  }

  return action?.nounSingular ?? 'item'
}

export function formatBulkActionSummary(input: ActionBulkSummaryInput): string {
  const parts: string[] = []

  if (input.eligible > 0) {
    parts.push(`${input.eligible} eligible`)
  }
  if (input.blocked > 0) {
    parts.push(`${input.blocked} blocked`)
  }
  if (input.unchanged > 0) {
    parts.push(`${input.unchanged} unchanged`)
  }
  if (input.updated > 0) {
    parts.push(`${input.updated} updated`)
  }
  if (input.failed > 0) {
    parts.push(`${input.failed} failed`)
  }

  return parts.join(' · ')
}

export function formatActionSuccess(
  updatedCount: number,
  nounPlural: string,
  nounSingular = nounPlural,
): string {
  const noun = updatedCount === 1 ? nounSingular : nounPlural
  return `Updated ${updatedCount} ${noun}.`
}

export function formatActionPartialSuccess(
  updatedCount: number,
  blockedCount: number,
  failedCount: number,
  nounPlural: string,
  nounSingular = nounPlural,
): string {
  const parts: string[] = []

  if (updatedCount > 0) {
    parts.push(formatActionSuccess(updatedCount, nounPlural, nounSingular))
  }
  if (blockedCount > 0) {
    const noun = blockedCount === 1 ? nounSingular : nounPlural
    parts.push(`${blockedCount} ${noun} blocked.`)
  }
  if (failedCount > 0) {
    const noun = failedCount === 1 ? nounSingular : nounPlural
    parts.push(`${failedCount} ${noun} failed.`)
  }

  return parts.join(' ')
}

export function formatActionMixedResult(
  updatedCount: number,
  failedCount: number,
  unchangedCount: number,
  nounPlural: string,
  nounSingular = nounPlural,
): string {
  const parts: string[] = []

  if (updatedCount > 0) {
    parts.push(formatActionSuccess(updatedCount, nounPlural, nounSingular))
  }
  if (failedCount > 0) {
    const noun = failedCount === 1 ? nounSingular : nounPlural
    parts.push(`${failedCount} ${noun} failed.`)
  }
  if (unchangedCount > 0) {
    const noun = unchangedCount === 1 ? nounSingular : nounPlural
    parts.push(`${unchangedCount} ${noun} unchanged.`)
  }

  return parts.join(' ')
}

export const ACTION_RESOLVE_APPLY_LABEL = 'Apply to selected items'
export const ACTION_RESOLVE_BACK_LABEL = 'Back'
export const ACTION_CANCEL_LABEL = 'Cancel'
export const ACTION_CLOSE_LABEL = 'Close'
export const ACTION_RETRY_FAILED_LABEL = 'Retry failed'
export const ACTION_CONFIGURE_APPLY_LABEL = 'Apply changes'

export function formatActionResolveHeadline(confirmedCount: number, noun: string): string {
  return `Apply to ${confirmedCount} ${confirmedCount === 1 ? noun.replace(/s$/, '') || noun : noun}`
}

export function formatActionResultHeadline(): string {
  return 'Some updates could not be completed'
}

export const CONTENT_AVAILABILITY_ACTION: ActionDescriptor = {
  nounSingular: 'item',
  nounPlural: 'items',
  actionKind: 'availability',
}

export const CONTENT_AVAILABILITY_OFF_ACTION: ActionDescriptor = {
  nounSingular: 'item',
  nounPlural: 'items',
  actionKind: 'availability-off',
}

export const VOCABULARY_DISABLE_ACTION: ActionDescriptor = {
  nounSingular: 'entry',
  nounPlural: 'entries',
  actionKind: 'disable',
}

export const NPC_ROSTER_STATUS_ACTION: ActionDescriptor = {
  nounSingular: 'NPC',
  nounPlural: 'NPCs',
  actionKind: 'roster-status',
}
