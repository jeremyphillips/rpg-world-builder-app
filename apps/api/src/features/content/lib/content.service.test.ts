import { skillSlugsFromClassChoices } from '@rpg/contracts'

import { createCampaign } from '../../campaign'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { makeTestUser } from '../../../test/fixtures/users'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { ClassPatchModel } from '../classes/class-patch.model'
import { HomebrewClassModel } from '../classes/homebrew-class.model'
import { classContentConfig } from '../classes/classes.config'
import { resolveClassesForCampaign } from '../classes/derive-classes-catalog'
import { resolveCatalogForCampaign } from '../content.service'

useIntegrationDb()

describe('resolveCatalogForCampaign (classes)', () => {
  it('returns the unmodified system catalog when a campaign has no patches or homebrew', async () => {
    const campaign = await makeTestCampaign()
    const classes = await resolveClassesForCampaign(campaign.id)

    expect(classes).toHaveLength(12)
    expect(classes.find((c) => c.id === 'srd-cc-5.2.1:fighter')?.hitDie).toBe(10)
    expect(classes.every((c) => c.source === 'system')).toBe(true)
    const fighter = classes.find((c) => c.slug === 'fighter')!
    expect(skillSlugsFromClassChoices(fighter).length).toBeGreaterThan(0)
  })

  it('deep-merges a campaign overlay patch onto the system class', async () => {
    const campaign = await makeTestCampaign()
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
        armor: ['light', 'medium'],
        weapons: { categories: ['simple', 'martial'] },
        skills: { choose: 2, from: ['athletics', 'stealth'] },
      },
      features: [],
    })

    const classes = await resolveClassesForCampaign(campaign.id)
    const homebrew = classes.find((c) => c.slug === 'blood-hunter')

    expect(classes).toHaveLength(13)
    expect(homebrew?.source).toBe('homebrew')
    expect(homebrew?.campaignId).toBe(campaign.id)
    expect(homebrew?.proficiencies.armor).toEqual({ categories: ['light', 'medium'], items: [] })
    expect(homebrew?.proficiencies.skills).toEqual({ categories: [], items: [] })
    expect(homebrew?.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).toEqual([
      'athletics',
      'stealth',
    ])
  })

  it('strips proficiencies.skills choose/from pollution without overriding characterCreation choices', async () => {
    const campaign = await makeTestCampaign()
    await ClassPatchModel.create({
      campaignId: campaign.id,
      targetId: 'srd-cc-5.2.1:fighter',
      patch: {
        proficiencies: {
          skills: { categories: [], items: [], choose: 99, from: ['medicine'] },
        },
      },
    })

    const fighter = (await resolveClassesForCampaign(campaign.id)).find(
      (c) => c.slug === 'fighter',
    )!

    expect(fighter.proficiencies.skills).toEqual({ categories: [], items: [] })
    expect(fighter.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).toEqual([
      'acrobatics',
      'athletics',
      'history',
      'intimidation',
      'perception',
    ])
    expect(fighter.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).not.toContain(
      'medicine',
    )
  })

  it('scopes patches and homebrew to their own campaign', async () => {
    const a = await makeTestCampaign({ name: 'Catalog' })
    const ownerB = await makeTestUser({ email: 'b@example.com', displayName: 'B' })
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
