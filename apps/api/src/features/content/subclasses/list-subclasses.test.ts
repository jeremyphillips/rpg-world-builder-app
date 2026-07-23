import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { updateContentCampaignAccess } from '../lib/content-campaign-access.service'
import { resolveSubclassesForCampaign } from './list-subclasses'
import { subclassWriteConfig } from './subclasses.config'

useIntegrationDb()

describe('resolveSubclassesForCampaign', () => {
  it('returns catalog subclasses for a system class id', async () => {
    const { id: campaignId } = await makeTestCampaign()

    const subclasses = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')

    expect(subclasses.length).toBeGreaterThan(0)
    expect(subclasses.every((sub) => sub.classId === 'srd-cc-5.2.1:fighter')).toBe(true)
    expect(subclasses.every((sub) => sub.campaignAccess.available === true)).toBe(true)
    expect(subclasses.every((sub) => sub.campaignAccess.effectiveAudience === 'all_players')).toBe(
      true,
    )
  })

  it('reflects unavailable campaign access rows on list metadata', async () => {
    const { id: campaignId } = await makeTestCampaign()
    const subclasses = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')
    const champion = subclasses.find((subclass) => subclass.slug === 'champion')
    expect(champion).toBeDefined()

    await updateContentCampaignAccess(subclassWriteConfig, campaignId, champion!.id, {
      available: false,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    const reloaded = await resolveSubclassesForCampaign(campaignId, 'srd-cc-5.2.1:fighter')
    const reloadedChampion = reloaded.find((subclass) => subclass.id === champion!.id)
    expect(reloadedChampion?.campaignAccess.available).toBe(false)
    expect(reloadedChampion?.campaignAccess.effectiveAudience).toBe('none')
    expect(reloadedChampion?.campaignAccess.visibilityMode).toBe('all_players')
  })

  it('throws when the campaign does not exist', async () => {
    await expect(
      resolveSubclassesForCampaign('000000000000000000000000', 'srd-cc-5.2.1:fighter'),
    ).rejects.toMatchObject({ status: 404 })
  })
})
