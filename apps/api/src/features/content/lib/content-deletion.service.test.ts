import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { makeTestUser } from '../../../test/fixtures/users'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  attachCharacterToCampaign,
  CampaignMembershipModel,
  createCampaignNpc,
} from '../../campaign'
import { CharacterModel, createPcRecord } from '../../character'
import { classWriteConfig } from '../classes/classes.config'
import { HomebrewClassModel } from '../classes/homebrew-class.model'
import { resolveCatalogForCampaign } from '../content.service'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { speciesWriteConfig } from '../species/species.config'
import { createHomebrewContent } from './content-write.service'
import { deleteContentEntity, getContentDeletionAvailability } from './content-deletion.service'
import { HttpError } from '../../../lib/http-error'

useIntegrationDb()

const minimalClassInput = {
  slug: 'deletable-class',
  name: 'Deletable Class',
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
    abilityScoreOrder: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
  },
  features: [{ name: 'Test Feature', level: 1 }],
}

const minimalSpeciesInput = {
  slug: 'deletable-folk',
  name: 'Deletable Folk',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [],
}

describe('content deletion service', () => {
  it('returns allowed availability when no characters reference the entity', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const availability = await getContentDeletionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )

    expect(availability).toEqual({ status: 'allowed' })
  })

  it('deletes homebrew with deleteOne scoped by _id and campaignId', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const result = await deleteContentEntity(classWriteConfig, campaign.id, created.id)
    expect(result).toEqual({ status: 'deleted' })

    const remaining = await HomebrewClassModel.findById(created.id).lean()
    expect(remaining).toBeNull()
  })

  it('blocks delete when a campaign NPC references the entity', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Blocked NPC',
      classes: [{ classId: created.id, level: 1 }],
    })

    const availability = await getContentDeletionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toHaveLength(1)
    expect(availability.blockers[0]?.kind).toBe('usage')

    const deleteResult = await deleteContentEntity(classWriteConfig, campaign.id, created.id)
    expect(deleteResult).toMatchObject({ status: 'blocked' })
  })

  it('blocks delete when an organization member class affinity references the entity', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'thieves-guild',
      name: "Thieves' Guild",
      organizationDomain: 'criminal',
      memberClassAffinityIds: [created.id],
    })

    const availability = await getContentDeletionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(
      availability.blockers.some(
        (blocker) => blocker.kind === 'content' && blocker.contentTypeKey === 'organizations',
      ),
    ).toBe(true)

    const deleteResult = await deleteContentEntity(classWriteConfig, campaign.id, created.id)
    expect(deleteResult).toMatchObject({ status: 'blocked' })
  })

  it('returns 409 blocked when a character reference is added before DELETE', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesInput,
    )

    const availabilityBefore = await getContentDeletionAvailability(
      speciesWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availabilityBefore).toEqual({ status: 'allowed' })

    await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Species NPC',
      species: { id: created.id },
    })

    const deleteResult = await deleteContentEntity(speciesWriteConfig, campaign.id, created.id)
    expect(deleteResult.status).toBe('blocked')
  })

  it('deletes after a blocked dependency is removed', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Temporary NPC',
      classes: [{ classId: created.id, level: 1 }],
    })

    const blocked = await deleteContentEntity(classWriteConfig, campaign.id, created.id)
    expect(blocked.status).toBe('blocked')

    await CharacterModel.deleteOne({ _id: npc.id })

    const result = await deleteContentEntity(classWriteConfig, campaign.id, created.id)
    expect(result).toEqual({ status: 'deleted' })
  })

  it('returns 404 for a homebrew entity id under another campaign', async () => {
    const campaignA = await makeTestCampaign({
      owner: await makeTestUser({ email: 'owner-a@example.com' }),
    })
    const campaignB = await makeTestCampaign({
      owner: await makeTestUser({ email: 'owner-b@example.com' }),
    })
    const created = await createHomebrewContent(classWriteConfig, campaignA.id, minimalClassInput)

    await expect(
      getContentDeletionAvailability(classWriteConfig, campaignB.id, created.id),
    ).rejects.toMatchObject({ status: 404 })

    await expect(
      deleteContentEntity(classWriteConfig, campaignB.id, created.id),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('dedupes duplicate participation references into one usage blocker', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)
    const pc = await createPcRecord(minimalStandalonePcInput, campaign.owner.id)

    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: pc.id,
      joinedAt: new Date().toISOString(),
    })

    await CharacterModel.updateOne(
      { _id: pc.id },
      { $set: { classes: [{ classId: created.id, level: 1 }] } },
    )

    const availability = await getContentDeletionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toHaveLength(1)
    const blocker = availability.blockers[0]
    expect(blocker?.kind).toBe('usage')
    if (blocker?.kind !== 'usage') throw new Error('expected usage blocker')
    expect(blocker.usage.id).toBe(pc.id)
  })

  it('ignores control-only membership references without open participation', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await CampaignMembershipModel.updateOne(
      { campaignId: campaign.id, userId: campaign.owner.id },
      { $set: { controlledCharacterIds: ['000000000000000000000099'] } },
    )

    const availability = await getContentDeletionAvailability(
      classWriteConfig,
      campaign.id,
      created.id,
    )
    expect(availability).toEqual({ status: 'allowed' })
  })

  it('returns 403 for system content availability GET', async () => {
    const campaign = await makeTestCampaign()
    const classes = await resolveCatalogForCampaign(classWriteConfig.readConfig, campaign.id)
    const fighter = classes.find((entry) => entry.slug === 'fighter')
    expect(fighter).toBeDefined()
    if (!fighter) throw new Error('expected fighter')

    await expect(
      getContentDeletionAvailability(classWriteConfig, campaign.id, fighter.id),
    ).rejects.toBeInstanceOf(HttpError)

    await expect(
      getContentDeletionAvailability(classWriteConfig, campaign.id, fighter.id),
    ).rejects.toMatchObject({ status: 403 })
  })
})
