import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { makeTestUser } from '../../../test/fixtures/users'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { classWriteConfig } from '../classes/classes.config'
import { featWriteConfig } from '../feats/feats.config'
import { HomebrewClassModel } from '../classes/homebrew-class.model'
import { skillProficiencyWriteConfig } from '../skill-proficiencies/skill-proficiencies.config'
import { createHomebrewContent } from './content-write.service'
import {
  demoteContentToDraft,
  getContentDemotionAvailability,
  promoteContentToPublished,
} from './content-status.service'
import { createNpcRecord } from '../../character/character.repository'
import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'

useIntegrationDb()

const minimalClassInput = {
  slug: 'status-class',
  name: 'Status Class',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
  features: [{ name: 'Test Feature', level: 1 }],
}

describe('content status service', () => {
  it('promotes a draft homebrew record to published', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      classWriteConfig,
      campaign.id,
      minimalClassInput,
      'draft',
    )
    expect(created.status).toBe('draft')

    const promoted = await promoteContentToPublished(classWriteConfig, campaign.id, created.id)
    expect(promoted.status).toBe('published')

    const doc = await HomebrewClassModel.findById(created.id).lean()
    expect(doc?.status).toBe('published')
  })

  it('rejects promote when draft body is publish-incomplete', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      skillProficiencyWriteConfig,
      campaign.id,
      { slug: 'incomplete-skill', name: '' },
      'draft',
    )
    expect(created.status).toBe('draft')

    await expect(
      promoteContentToPublished(skillProficiencyWriteConfig, campaign.id, created.id),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('promotes a complete draft feat to published', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      featWriteConfig,
      campaign.id,
      {
        slug: 'draft-feat',
        name: 'Draft Feat',
        category: 'general',
        repeatable: { allowed: false },
      },
      'draft',
    )

    const promoted = await promoteContentToPublished(featWriteConfig, campaign.id, created.id)
    expect(promoted.status).toBe('published')
  })

  it('demotes published homebrew when no characters reference it', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const availability = await getContentDemotionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availability).toEqual({ status: 'allowed' })

    const result = await demoteContentToDraft(classWriteConfig, campaign.id, created.id)
    expect(result).toEqual({ status: 'demoted' })

    const doc = await HomebrewClassModel.findById(created.id).lean()
    expect(doc?.status).toBe('draft')
  })

  it('blocks demote when a campaign NPC references the entity', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await createNpcRecord({
      ...minimalNpcRequestInput,
      characterType: 'npc',
      name: 'Blocking NPC',
      campaignId: campaign.id,
      classes: [{ classId: created.id, level: 1 }],
    })

    const availability = await getContentDemotionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toHaveLength(1)

    const result = await demoteContentToDraft(classWriteConfig, campaign.id, created.id)
    expect(result).toMatchObject({ status: 'blocked' })

    const doc = await HomebrewClassModel.findById(created.id).lean()
    expect(doc?.status).toBe('published')
  })

  it('re-evaluates blockers atomically on demote without a prior availability call', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await createNpcRecord({
      ...minimalNpcRequestInput,
      characterType: 'npc',
      name: 'Race NPC',
      campaignId: campaign.id,
      classes: [{ classId: created.id, level: 1 }],
    })

    const result = await demoteContentToDraft(classWriteConfig, campaign.id, created.id)
    expect(result.status).toBe('blocked')
  })

  it('returns 403 when promoting system content', async () => {
    const campaign = await makeTestCampaign()
    const classes = await resolveCatalogForCampaign(classWriteConfig.readConfig, campaign.id)
    const fighter = classes.find((entry) => entry.slug === 'fighter')
    expect(fighter).toBeDefined()
    if (!fighter) throw new Error('expected fighter')

    await expect(
      promoteContentToPublished(classWriteConfig, campaign.id, fighter.id),
    ).rejects.toBeInstanceOf(HttpError)

    await expect(
      promoteContentToPublished(classWriteConfig, campaign.id, fighter.id),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('returns 404 for a homebrew entity id under another campaign', async () => {
    const campaignA = await makeTestCampaign({
      owner: await makeTestUser({ email: 'status-owner-a@example.com' }),
    })
    const campaignB = await makeTestCampaign({
      owner: await makeTestUser({ email: 'status-owner-b@example.com' }),
    })
    const created = await createHomebrewContent(classWriteConfig, campaignA.id, minimalClassInput)

    await expect(
      demoteContentToDraft(classWriteConfig, campaignB.id, created.id),
    ).rejects.toMatchObject({ status: 404 })
  })
})
