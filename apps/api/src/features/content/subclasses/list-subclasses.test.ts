import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { resolveSubclassesForCampaign, upsertSubclassCampaignAvailability } from './list-subclasses'

useIntegrationDb()

describe('resolveSubclassesForCampaign', () => {
  it('returns catalog subclasses for a system class id', async () => {
    const { id: campaignId } = await makeTestCampaign()

    const subclasses = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')

    expect(subclasses.length).toBeGreaterThan(0)
    expect(subclasses.every((sub) => sub.classId === 'srd-cc-5.2.1:fighter')).toBe(true)
    expect(subclasses.every((sub) => sub.activeInCampaign === true)).toBe(true)
  })

  it('reflects inactive availability rows on list metadata', async () => {
    const { id: campaignId } = await makeTestCampaign()
    const subclasses = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')
    const champion = subclasses.find((subclass) => subclass.slug === 'champion')
    expect(champion).toBeDefined()

    await upsertSubclassCampaignAvailability(campaignId, champion!.id, {
      activeInCampaign: false,
    })

    const reloaded = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')
    const reloadedChampion = reloaded.find((subclass) => subclass.id === champion!.id)
    expect(reloadedChampion?.activeInCampaign).toBe(false)
  })

  it('throws when the campaign does not exist', async () => {
    await expect(
      resolveSubclassesForCampaign('000000000000000000000000', 'srd-cc-5.2.1:fighter'),
    ).rejects.toMatchObject({ status: 404 })
  })
})
