import { describe, expect, it } from 'vitest'

import { HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { HomebrewClassModel } from '../classes/homebrew-class.model'
import { getHomebrewContentSummary } from './homebrew-summary.service'

useIntegrationDb()

describe('getHomebrewContentSummary', () => {
  it('returns catalog counts for every visible-sidebar content type', async () => {
    const campaign = await makeTestCampaign()

    await HomebrewClassModel.create({
      slug: 'blood-hunter',
      rulesetId: 'srd-cc-5.2.1',
      campaignId: campaign.id,
      name: 'Blood Hunter',
      primaryAbilities: ['str'],
      hitDie: 10,
      proficiencies: {
        savingThrows: ['str', 'con'],
        armor: { categories: ['light', 'medium'], items: [] },
        weapons: { categories: ['simple', 'martial'], items: [] },
        skills: { categories: [], items: [] },
      },
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'acrobatics'] }],
          },
        },
      },
    })

    const summary = await getHomebrewContentSummary(campaign.id)

    expect(summary.content).toHaveLength(HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS.length)
    expect(summary.content.map((item) => item.contentType)).toEqual([
      ...HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS,
    ])

    const classes = summary.content.find((item) => item.contentType === 'classes')
    expect(classes?.totalCount).toBe(13)
  })

  it('throws when the campaign does not exist', async () => {
    await expect(getHomebrewContentSummary('000000000000000000000000')).rejects.toMatchObject({
      status: 404,
    })
  })
})
