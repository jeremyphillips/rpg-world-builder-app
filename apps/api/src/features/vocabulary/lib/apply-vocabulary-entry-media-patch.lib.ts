import type {
  ContentMedia,
  SystemRulesetId,
  VocabularyOptionSetId,
  VocabularyOptionSource,
} from '@rpg/contracts'
import { getVocabularySetCapability } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { updateVocabularyEntryMediaRecord } from './update-vocabulary-entry-media.lib'

export async function applyVocabularyEntryMediaPatch(input: {
  campaignId: string
  rulesetId: SystemRulesetId
  setId: VocabularyOptionSetId
  entryId: string
  source: VocabularyOptionSource
  currentMedia: ContentMedia | null
  media: ContentMedia
  expectedMediaRevision: number
}): Promise<void> {
  const capability = getVocabularySetCapability(input.setId)
  if (!capability.media) {
    throw new HttpError(
      403,
      'forbidden',
      `Media updates are not enabled for vocabulary set "${input.setId}".`,
    )
  }

  const result = await updateVocabularyEntryMediaRecord({
    campaignId: input.campaignId,
    rulesetId: input.rulesetId,
    setId: input.setId,
    entryId: input.entryId,
    source: input.source === 'system' ? 'system' : 'campaign',
    scope: { kind: 'campaign-content', campaignId: input.campaignId },
    currentMedia: input.currentMedia,
    patch: {
      media: input.media,
      expectedMediaRevision: input.expectedMediaRevision,
    },
  })

  if (result.ok) return

  if (result.reason === 'not_found') {
    throw new HttpError(404, 'not_found', `Vocabulary entry "${input.entryId}" not found.`)
  }
  if (result.reason === 'stale_revision') {
    throw new HttpError(409, 'stale_revision', 'Vocabulary entry media revision is stale.', {
      media: 'media' in result ? result.media : undefined,
    })
  }
  if ('issues' in result) {
    throw new HttpError(400, 'bad_request', 'Invalid vocabulary entry media.', result.issues)
  }
  throw new HttpError(400, 'bad_request', 'Invalid vocabulary entry media.')
}
