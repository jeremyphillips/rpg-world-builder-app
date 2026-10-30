import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '../../../lib/http-error'

const getRulesetPatchRead = vi.fn()

vi.mock('../../vocabulary', () => ({
  getRulesetPatchRead: (...args: unknown[]) => getRulesetPatchRead(...args),
  requireCampaignRuleset: vi.fn(),
  resolveVocabularySetForCampaign: vi.fn(),
  vocabularyUsageContextForCampaign: vi.fn(),
}))

const { contentSearchSource } = await import('./content.source')

describe('contentSearchSource', () => {
  beforeEach(() => {
    getRulesetPatchRead.mockReset()
  })

  it('errors when the campaign ruleset cannot be read', async () => {
    getRulesetPatchRead.mockResolvedValue(null)

    await expect(
      contentSearchSource.collect({
        campaignId: 'missing-campaign',
        viewerRole: 'gm',
        viewerUserId: 'user-1',
        viewerControlledCharacterIds: [],
      } as never),
    ).rejects.toEqual(expect.any(HttpError))

    await expect(
      contentSearchSource.collect({
        campaignId: 'missing-campaign',
        viewerRole: 'gm',
        viewerUserId: 'user-1',
        viewerControlledCharacterIds: [],
      } as never),
    ).rejects.toMatchObject({ status: 404, code: 'not_found' })
  })
})
