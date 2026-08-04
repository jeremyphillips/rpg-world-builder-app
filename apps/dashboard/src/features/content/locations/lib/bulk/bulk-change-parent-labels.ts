export const BULK_CHANGE_PARENT_MENU_LABEL = 'Change parent location'

export const BULK_CHANGE_PARENT_DIALOG_HEADLINE = 'Change parent location'

export const BULK_CHANGE_PARENT_PARENT_FIELD_LABEL = 'Parent location'

export const BULK_CHANGE_PARENT_NONE_OPTION_LABEL = 'No parent location'

export const BULK_CHANGE_PARENT_PARENT_FIELD_PLACEHOLDER = 'Select a parent location'

export function formatBulkChangeParentDialogDescription(selectedCount: number): string {
  const noun = selectedCount === 1 ? 'location' : 'locations'
  return `Choose a new parent for ${selectedCount} selected ${noun}. Locations already at the target parent are skipped.`
}

export function formatBulkChangeParentSelectedCount(selectedCount: number): string {
  const noun = selectedCount === 1 ? 'location' : 'locations'
  return `${selectedCount} selected ${noun}`
}

export function formatBulkChangeParentChangePreview(
  wouldChangeCount: number,
  unchangedCount: number,
): string {
  const changeNoun = wouldChangeCount === 1 ? 'location' : 'locations'
  const unchangedNoun = unchangedCount === 1 ? 'location' : 'locations'

  if (wouldChangeCount === 0) {
    return 'No locations would change.'
  }

  if (unchangedCount === 0) {
    return `${wouldChangeCount} ${changeNoun} would change.`
  }

  return `${wouldChangeCount} ${changeNoun} would change · ${unchangedCount} unchanged ${unchangedNoun} skipped`
}

export function formatBulkChangeParentConfigureApplyLabel(input: {
  wouldChangeCount: number
  isClearing: boolean
}): string | undefined {
  if (input.wouldChangeCount === 0) {
    return undefined
  }

  const noun = input.wouldChangeCount === 1 ? 'location' : 'locations'

  if (input.isClearing) {
    return `Remove parent from ${input.wouldChangeCount} ${noun}`
  }

  return `Apply to ${input.wouldChangeCount} ${noun}`
}

export function formatBulkChangeParentBlockedTitle(mode: 'bulk-all' | 'bulk-partial'): string {
  if (mode === 'bulk-all') {
    return 'Cannot change parent location'
  }

  return 'Some locations cannot be moved'
}

export function formatBulkChangeParentBlockedDescription(input: {
  mode: 'bulk-all' | 'bulk-partial'
  blockedCount: number
  selectedCount: number
}): string {
  const blockedNoun = input.blockedCount === 1 ? 'location' : 'locations'

  if (input.mode === 'bulk-all') {
    return `All ${input.selectedCount} selected locations are blocked by hierarchy rules. Change the parent or deselect blocked locations.`
  }

  return `${input.blockedCount} ${blockedNoun} blocked by hierarchy rules. Blocked items are excluded — continue with eligible locations or go back to change the parent.`
}

export type BulkChangeParentToastInput = {
  updatedCount: number
  blockedCount: number
  parentName?: string
  isClearing: boolean
}

export function formatBulkChangeParentSuccessToast(input: BulkChangeParentToastInput): {
  title: string
  description?: string
  tone: 'success' | 'warning'
} {
  const noun = input.updatedCount === 1 ? 'location' : 'locations'

  if (input.blockedCount > 0) {
    const blockedNoun = input.blockedCount === 1 ? 'location' : 'locations'
    return {
      title: `Parent updated for ${input.updatedCount} ${noun}`,
      description: `${input.blockedCount} blocked ${blockedNoun} ${input.blockedCount === 1 ? 'was' : 'were'} left unchanged.`,
      tone: 'warning',
    }
  }

  if (input.isClearing) {
    return {
      title: `Parent removed from ${input.updatedCount} ${noun}`,
      tone: 'success',
    }
  }

  const parentLabel = input.parentName?.trim() || 'the selected parent'

  return {
    title: `Parent updated for ${input.updatedCount} ${noun}`,
    description: `The selected locations were moved under ${parentLabel}.`,
    tone: 'success',
  }
}
