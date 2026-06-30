export {
  ACTIVE_IN_CAMPAIGN_LABEL,
  ACTIVE_IN_CAMPAIGN_TOOLTIP,
  isContentRowActive as isSubclassActive,
} from '../../../lib/master-detail/content-campaign-availability'

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
