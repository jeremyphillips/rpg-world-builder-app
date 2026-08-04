import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { attachCharacterToCampaign, createCampaignNpc } from '../../campaign'
import { createPcRecord, CharacterModel } from '../../character'
import { deleteCampaignNpc } from '../../campaign/npc/npc.service'
import {
  deleteContentEntity,
  getContentDeletionAvailability,
} from '../lib/content-deletion.service'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { locationWriteConfig } from './locations.config'

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'yawning-portal-inn',
  name: 'Yawning Portal Inn',
  organizationKind: 'commercial',
} as const

async function seedWorld(campaignId: string) {
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'faerun',
    kind: 'world',
    name: 'Faerûn',
  })
}

async function seedStructureParent(campaignId: string, worldId: string) {
  const region = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'party-region',
    kind: 'region',
    name: 'Party Region',
    parentLocationId: worldId,
  })
  const settlement = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'party-settlement',
    kind: 'settlement',
    name: 'Party Settlement',
    settlementType: 'city',
    parentLocationId: region.id,
  })
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'party-district',
    kind: 'district',
    name: 'Party District',
    parentLocationId: settlement.id,
  })
}

describe('location party association lifecycle', () => {
  it('round-trips party associations on create and PATCH', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)
    const district = await seedStructureParent(campaign.id, world.id)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )
    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Durnan',
    })

    const created = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'yawning-portal',
      kind: 'structure',
      name: 'Yawning Portal',
      structureType: 'building',
      classification: { archetype: 'tavern' },
      parentLocationId: district.id,
      partyAssociations: [
        {
          id: 'assoc-owner',
          kind: 'ownership',
          party: { kind: 'organization', organizationId: organization.id },
        },
        {
          id: 'assoc-operator',
          kind: 'operation',
          role: 'operator',
          party: { kind: 'character', characterId: npc.id },
        },
      ],
    })

    expect(created.partyAssociations).toHaveLength(2)

    const updated = await updateContentEntity(locationWriteConfig, campaign.id, created.id, {
      kind: 'structure',
      partyAssociations: [
        ...created.partyAssociations,
        {
          id: 'assoc-hq',
          kind: 'occupancy',
          role: 'headquarters',
          party: { kind: 'organization', organizationId: organization.id },
        },
      ],
    })

    expect(updated.partyAssociations).toHaveLength(3)
    expect(updated.partyAssociations?.map((entry) => entry.id).sort()).toEqual([
      'assoc-hq',
      'assoc-operator',
      'assoc-owner',
    ])
  })

  it('rejects unknown character and organization references on write', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)
    const district = await seedStructureParent(campaign.id, world.id)

    await expect(
      createHomebrewContent(locationWriteConfig, campaign.id, {
        slug: 'bad-character-ref',
        kind: 'site',
        name: 'Bad Character Ref',
        siteType: 'landmark',
        parentLocationId: district.id,
        partyAssociations: [
          {
            id: 'assoc-1',
            kind: 'ownership',
            party: { kind: 'character', characterId: new Types.ObjectId().toString() },
          },
        ],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_reference' })

    await expect(
      createHomebrewContent(locationWriteConfig, campaign.id, {
        slug: 'bad-org-ref',
        kind: 'site',
        name: 'Bad Org Ref',
        siteType: 'landmark',
        parentLocationId: district.id,
        partyAssociations: [
          {
            id: 'assoc-1',
            kind: 'ownership',
            party: { kind: 'organization', organizationId: new Types.ObjectId().toString() },
          },
        ],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_reference' })
  })

  it('blocks organization delete when a location references the organization', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)
    const district = await seedStructureParent(campaign.id, world.id)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )
    await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'referenced-tavern',
      kind: 'structure',
      name: 'Referenced Tavern',
      structureType: 'building',
      classification: { archetype: 'tavern' },
      parentLocationId: district.id,
      partyAssociations: [
        {
          id: 'assoc-owner',
          kind: 'ownership',
          party: { kind: 'organization', organizationId: organization.id },
        },
      ],
    })

    const availability = await getContentDeletionAvailability(
      organizationWriteConfig,
      campaign.id,
      organization.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toEqual([
      expect.objectContaining({
        kind: 'content',
        contentTypeKey: 'locations',
        label: 'Referenced Tavern',
      }),
    ])

    await expect(
      deleteContentEntity(organizationWriteConfig, campaign.id, organization.id),
    ).resolves.toMatchObject({ status: 'blocked' })
  })

  it('blocks PC delete when referenced by a location party association', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)
    const district = await seedStructureParent(campaign.id, world.id)
    const pc = await createPcRecord(minimalStandalonePcInput, campaign.owner.id)
    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: pc.id,
      joinedAt: new Date().toISOString(),
    })

    await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'pc-workplace',
      kind: 'structure',
      name: 'PC Workplace',
      structureType: 'building',
      classification: { archetype: 'tavern' },
      parentLocationId: district.id,
      partyAssociations: [
        {
          id: 'assoc-works',
          kind: 'operation',
          role: 'works_at',
          party: { kind: 'character', characterId: pc.id },
        },
      ],
    })

    const { deleteCharacterForUser } = await import('../../character/character.service')
    const result = await deleteCharacterForUser(pc.id, campaign.owner.id)
    expect(result).toMatchObject({ status: 'blocked' })
    if (result.status !== 'blocked') throw new Error('expected blocked')
    expect(result.blockers[0]).toMatchObject({
      kind: 'content',
      contentTypeKey: 'locations',
      label: 'PC Workplace',
    })

    const stillExists = await CharacterModel.findById(pc.id).lean()
    expect(stillExists).not.toBeNull()
  })

  it('blocks NPC delete when referenced by a location party association', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)
    const district = await seedStructureParent(campaign.id, world.id)
    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Referenced NPC',
    })

    await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'npc-workplace',
      kind: 'structure',
      name: 'NPC Workplace',
      structureType: 'building',
      classification: { archetype: 'tavern' },
      parentLocationId: district.id,
      partyAssociations: [
        {
          id: 'assoc-operator',
          kind: 'operation',
          role: 'operator',
          party: { kind: 'character', characterId: npc.id },
        },
      ],
    })

    const result = await deleteCampaignNpc(campaign.id, npc.id)
    expect(result).toMatchObject({ status: 'blocked' })
    if (result.status !== 'blocked') throw new Error('expected blocked')
    expect(result.blockers[0]).toMatchObject({
      kind: 'content',
      contentTypeKey: 'locations',
      label: 'NPC Workplace',
    })
  })
})
