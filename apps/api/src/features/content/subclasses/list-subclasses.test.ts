import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { resolveSubclassesForCampaign } from './list-subclasses'

useIntegrationDb()

describe('resolveSubclassesForCampaign', () => {
  it('returns catalog subclasses for a system class id', async () => {
    const { id: campaignId } = await makeTestCampaign()

    const subclasses = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')

    expect(subclasses.length).toBeGreaterThan(0)
    expect(subclasses.every((sub) => sub.classId === 'srd-cc-5.2.1:fighter')).toBe(true)
  })

  it('throws when the campaign does not exist', async () => {
    await expect(
      resolveSubclassesForCampaign('000000000000000000000000', 'srd-cc-5.2.1:fighter'),
    ).rejects.toMatchObject({ status: 404 })
  })
})
