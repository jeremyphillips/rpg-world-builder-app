import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { createUser } from '../user'
import { createCampaign } from '../campaign'
import { ClassPatchModel } from './classes/class-patch.model'
import { HomebrewClassModel } from './classes/homebrew-class.model'
import { classContentConfig } from './classes/classes.config'
import { resolveClassesForCampaign } from './classes/derive-classes-catalog'
import { resolveCatalogForCampaign } from './content.service'

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
    email: 'dm@example.com',
    passwordHash: 'x',
    displayName: 'DM',
  })
  return createCampaign({ name: 'Catalog', createdBy: owner.id })
}

describe('resolveCatalogForCampaign (classes)', () => {
  it('returns the unmodified system catalog when a campaign has no patches or homebrew', async () => {
    const campaign = await makeCampaign()
    const classes = await resolveClassesForCampaign(campaign.id)

    expect(classes).toHaveLength(12)
    expect(classes.find((c) => c.id === 'srd-cc-5.2.1:fighter')?.hitDie).toBe(10)
    expect(classes.every((c) => c.source === 'system')).toBe(true)
    expect(
      classes.find((c) => c.slug === 'fighter')?.proficiencies.skills.from.length,
    ).toBeGreaterThan(0)
  })

  it('deep-merges a campaign overlay patch onto the system class', async () => {
    const campaign = await makeCampaign()
    await ClassPatchModel.create({
      campaignId: campaign.id,
      targetId: 'srd-cc-5.2.1:fighter',
      patch: { hitDie: 12, description: 'House-ruled fighter.' },
    })

    const classes = await resolveCatalogForCampaign(classContentConfig, campaign.id)
    const fighter = classes.find((c) => c.id === 'srd-cc-5.2.1:fighter')

    expect(fighter?.hitDie).toBe(12)
    expect(fighter?.description).toBe('House-ruled fighter.')
    // Untouched fields survive the merge.
    expect(fighter?.proficiencies.savingThrows).toEqual(['str', 'con'])
  })

  it('appends a campaign homebrew class to the resolved catalog', async () => {
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
      features: [],
    })

    const classes = await resolveCatalogForCampaign(classContentConfig, campaign.id)
    const homebrew = classes.find((c) => c.slug === 'blood-hunter')

    expect(classes).toHaveLength(13)
    expect(homebrew?.source).toBe('homebrew')
    expect(homebrew?.campaignId).toBe(campaign.id)
  })

  it('scopes patches and homebrew to their own campaign', async () => {
    const a = await makeCampaign()
    const ownerB = await createUser({ email: 'b@example.com', passwordHash: 'x', displayName: 'B' })
    const b = await createCampaign({ name: 'Other', createdBy: ownerB.id })

    await ClassPatchModel.create({
      campaignId: a.id,
      targetId: 'srd-cc-5.2.1:fighter',
      patch: { hitDie: 12 },
    })

    const classesB = await resolveCatalogForCampaign(classContentConfig, b.id)
    expect(classesB.find((c) => c.id === 'srd-cc-5.2.1:fighter')?.hitDie).toBe(10)
    expect(classesB).toHaveLength(12)
  })

  it('throws 404 for an unknown campaign', async () => {
    await expect(
      resolveCatalogForCampaign(classContentConfig, '507f1f77bcf86cd799439011'),
    ).rejects.toMatchObject({ status: 404 })
  })
})
