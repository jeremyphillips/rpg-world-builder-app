import { isContentDiscoverableForViewer } from '../campaign/content-viewer-discovery'
import type { ContentViewer } from '../../campaign/campaign-content-viewer'
import type { CharacterEligibilitySubject } from './character-eligibility-subject'
import type {
  CharacterCampaignBlockingIssue,
  CharacterCampaignWarning,
} from '../../campaign/character/eligibility-contracts'
import type { CampaignContentEligibilityIndex } from './campaign-content-eligibility-index'
import {
  lookupCampaignContentEntry,
  lookupCampaignLanguageEntry,
} from './campaign-content-eligibility-index'
import {
  collectCharacterContentReferences,
  type ContentReference,
} from './collect-character-content-references'

export type { CampaignContentEligibilityEntry } from './campaign-content-eligibility-index'

export type ResolveCharacterContentEligibilityInput = {
  subject: CharacterEligibilitySubject
  contentIndex: CampaignContentEligibilityIndex
  /**
   * Viewer for discovery checks. For existing-character onboarding use the
   * candidate's prospective context: `{ kind: 'pc', characterIds: [character.id] }`.
   * For new-character builder use `{ kind: 'none' }`.
   */
  viewer: ContentViewer
}

export type ResolveCharacterContentEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
  warnings: CharacterCampaignWarning[]
}

type EligibilityAccumulator = {
  blockingIssues: CharacterCampaignBlockingIssue[]
  warnings: CharacterCampaignWarning[]
  seenBlocking: Set<string>
  seenWarnings: Set<string>
}

function pushUniqueBlockingIssue(
  accumulator: EligibilityAccumulator,
  key: string,
  issue: CharacterCampaignBlockingIssue,
): void {
  if (accumulator.seenBlocking.has(key)) return
  accumulator.seenBlocking.add(key)
  accumulator.blockingIssues.push(issue)
}

function processContentReference(
  reference: ContentReference,
  contentIndex: CampaignContentEligibilityIndex,
  viewer: ContentViewer,
  accumulator: EligibilityAccumulator,
): void {
  if (reference.contentType === 'languages') {
    if (!lookupCampaignLanguageEntry(contentIndex, reference.contentId)) {
      pushUniqueBlockingIssue(
        accumulator,
        `content_missing:${reference.contentType}:${reference.contentId}`,
        {
          code: 'content_missing',
          contentType: reference.contentType,
          contentId: reference.contentId,
        },
      )
    }
    return
  }

  const entry = lookupCampaignContentEntry(
    contentIndex,
    reference.contentType,
    reference.contentId,
    reference.speciesId,
  )
  if (!entry) {
    pushUniqueBlockingIssue(
      accumulator,
      `content_missing:${reference.contentType}:${reference.contentId}`,
      {
        code: 'content_missing',
        contentType: reference.contentType,
        contentId: reference.contentId,
      },
    )
    return
  }

  if (isContentDiscoverableForViewer(entry.access, viewer)) {
    return
  }

  if (reference.kind === 'blocking') {
    pushUniqueBlockingIssue(accumulator, `${reference.code}:${reference.contentId}`, {
      code: reference.code,
      contentId: reference.contentId,
      label: entry.label,
    })
    return
  }

  const warningKey = `${reference.category}:${reference.contentId}`
  if (accumulator.seenWarnings.has(warningKey)) return
  accumulator.seenWarnings.add(warningKey)
  accumulator.warnings.push({
    code: 'content_unavailable',
    category: reference.category,
    contentId: reference.contentId,
    label: entry.label,
  })
}

export function resolveCharacterContentEligibility({
  subject,
  contentIndex,
  viewer,
}: ResolveCharacterContentEligibilityInput): ResolveCharacterContentEligibilityResult {
  const accumulator: EligibilityAccumulator = {
    blockingIssues: [],
    warnings: [],
    seenBlocking: new Set<string>(),
    seenWarnings: new Set<string>(),
  }

  for (const reference of collectCharacterContentReferences(subject)) {
    processContentReference(reference, contentIndex, viewer, accumulator)
  }

  return {
    blockingIssues: accumulator.blockingIssues,
    warnings: accumulator.warnings,
  }
}
