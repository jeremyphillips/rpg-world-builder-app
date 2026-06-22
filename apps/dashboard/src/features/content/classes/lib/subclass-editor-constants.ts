export const SUBCLASS_CHOICE_LEVEL_NONE = 'none'

export const ACTIVE_IN_CAMPAIGN_LABEL = 'Active in campaign'

export const ACTIVE_IN_CAMPAIGN_TOOLTIP =
  'Hides this item from players in the current campaign. The item remains available globally.'

export const UNTITLED_SUBCLASS_LABEL = 'Untitled subclass'

export const DRAFT_SUBCLASS_ID_PREFIX = 'draft-'

export function isDraftSubclassId(id: string): boolean {
  return id.startsWith(DRAFT_SUBCLASS_ID_PREFIX)
}

export function createDraftSubclassId(): string {
  return `${DRAFT_SUBCLASS_ID_PREFIX}${crypto.randomUUID()}`
}

export function isSubclassDeletable(source: 'system' | 'homebrew', id: string): boolean {
  return isDraftSubclassId(id) || source === 'homebrew'
}

export function isSubclassActive(activeById: Record<string, boolean>, id: string): boolean {
  return activeById[id] !== false
}
