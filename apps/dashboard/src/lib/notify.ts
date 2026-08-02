import type { ContentTypeKey } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'
import { toast } from '@rpg/ui'

import {
  CAMPAIGN_ACCESS_MAKE_AVAILABLE_FAILED_TITLE,
  CAMPAIGN_ACCESS_MARK_UNAVAILABLE_FAILED_TITLE,
  formatCampaignAccessAvailabilityToast,
} from '@/features/content/lib/campaign-access/campaign-access-labels'
import {
  CONTENT_PUBLISHED_MESSAGE,
  formatContentCreatedMessage,
  formatContentDeletedMessage,
} from '@/features/content/lib/content-type-labels'
import { DUPLICATE_CONTENT_CREATED_MESSAGE } from '@/features/content/lib/duplication/duplicate-content-labels'
import type { CoordinatedSaveSavedEvent } from '@/features/content/lib/forms/shells/content-save-session.lib'

const CHANGES_SAVED_MESSAGE = 'Changes saved.'
const CAMPAIGN_ACCESS_UPDATE_FALLBACK = 'Could not update campaign access.'

export function notifyContentDeleted(contentTypeKey: ContentTypeKey): void {
  toast.success(formatContentDeletedMessage(contentTypeKey))
}

export function notifyContentCreated(contentTypeKey: ContentTypeKey): void {
  toast.success(formatContentCreatedMessage(contentTypeKey))
}

export function notifyPublishSuccess(): void {
  toast.success(CONTENT_PUBLISHED_MESSAGE)
}

export function notifySaveSuccess(label?: string): void {
  toast.success(label ? `${label} saved.` : CHANGES_SAVED_MESSAGE)
}

export function notifyDuplicateContentCreated(): void {
  toast.success(DUPLICATE_CONTENT_CREATED_MESSAGE)
}

export function notifyCampaignAccessUpdated(name: string | undefined, available: boolean): void {
  toast.success(
    formatCampaignAccessAvailabilityToast({
      count: 1,
      name,
      available,
    }),
  )
}

export function notifyCampaignAccessUpdateFailed(
  entityId: string,
  available: boolean,
  err: unknown,
  retry: () => void,
): void {
  toast({
    id: `campaign-access:${entityId}`,
    title: available
      ? CAMPAIGN_ACCESS_MAKE_AVAILABLE_FAILED_TITLE
      : CAMPAIGN_ACCESS_MARK_UNAVAILABLE_FAILED_TITLE,
    description: getErrorMessage(err, CAMPAIGN_ACCESS_UPDATE_FALLBACK),
    tone: 'destructive',
    action: { label: 'Retry', onClick: retry },
  })
}

/** One success toast after a coordinated content edit save session. */
export function notifyCoordinatedContentSaveSuccess(
  event: CoordinatedSaveSavedEvent,
  entityName: string,
): void {
  if (event.bodySaved) {
    notifySaveSuccess()
    return
  }

  if (event.accessSaved && event.accessAvailabilityChanged && event.accessAvailable != null) {
    notifyCampaignAccessUpdated(entityName, event.accessAvailable)
    return
  }

  if (event.accessSaved) {
    notifySaveSuccess()
  }
}

export function notifyBulkCampaignAccessResult(result: {
  summary: string | null
  fullSuccess: boolean
  updatedIds: string[]
  blockedIds: string[]
  failedIds: string[]
}): void {
  if (!result.summary) {
    return
  }

  if (
    result.failedIds.length > 0 &&
    result.updatedIds.length === 0 &&
    result.blockedIds.length === 0
  ) {
    toast.error(result.summary)
    return
  }

  if (result.fullSuccess) {
    toast.success(result.summary)
    return
  }

  toast.warning(result.summary)
}

export function notifyBulkVocabularyAvailabilityResult(result: {
  summary: string | null
  fullSuccess: boolean
  updatedIds: string[]
  blockedResults: Array<{ rowId: string }>
  failedIds: string[]
}): void {
  if (!result.summary) {
    return
  }

  if (
    result.failedIds.length > 0 &&
    result.updatedIds.length === 0 &&
    result.blockedResults.length === 0
  ) {
    toast.error(result.summary)
    return
  }

  if (result.fullSuccess) {
    toast.success(result.summary)
    return
  }

  toast.warning(result.summary)
}

export function notifyVocabularyEntryCreated(entryLabel: string): void {
  toast.success(`${entryLabel} created.`)
}

export function notifyVocabularyEntrySaved(entryLabel: string): void {
  toast.success(`${entryLabel} saved.`)
}

export function notifyVocabularyEntryDeleted(entryLabel: string): void {
  toast.success(`${entryLabel} deleted.`)
}
