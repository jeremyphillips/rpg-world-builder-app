import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { createUser } from '../user'
import { createCampaign } from '../campaign'
import { HomebrewClassModel } from '../content/classes/homebrew-class.model'
import { getHomebrewContentSummary } from './homebrew-summary.service'

beforeAll(async () => {
  await startTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

async function makeCampaign() {
  const owner = await createUser({
    email: 'owner@example.com',
    passwordHash: 'x',
    displayName: 'Owner',
  })
  return createCampaign({ name: 'Test', createdBy: owner.id })
}

describe('getHomebrewContentSummary', () => {
  it('returns catalog counts for every visible-sidebar content type', async () => {
    const campaign = await makeCampaign()

    await HomebrewClassModel.create({
      slug: 'blood-hunter',
      rulesetId: 'srd-cc-5.2.1',
      campaignId: campaign.id,
      name: 'Blood Hunter',
      primaryAbilities: ['str'],
      hitDie: 10,
      subclassChoiceLevel: 3,
      proficiencies: {
        savingThrows: ['str', 'con'],
        armor: ['light', 'medium'],
        weapons: { categories: ['simple', 'martial'] },
        skills: { choose: 2 },
      },
    })

    const summary = await getHomebrewContentSummary(campaign.id)

    expect(summary.content).toHaveLength(6)
    expect(summary.content.map((item) => item.contentType)).toEqual([
      'classes',
      'spells',
      'species',
      'feats',
      'equipment',
      'skill-proficiencies',
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
